import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, HostListener, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { map, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { CartService } from '../../../core/services/cart.service';
import { UserService } from '../../../core/services/user.service';

export interface TopBarAction {
  icon: string;
  route?: string;
  badge?: number;
  ariaLabel: string;
  isButton?: boolean;
  action?: string;
}

@Component({
  selector: 'app-native-topbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './native-topbar.component.html',
  styleUrls: ['./native-topbar.component.scss'],
})
export class NativeTopbarComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  isLoggedOut$: Observable<boolean>;
  userRole: string | null = null;
  cartCount = 0;
  notifCount = 0;
  logoLink = '/home';
  topBarActions: TopBarAction[] = [];
  private mainEl?: HTMLElement | null;

  constructor(
    private cart: CartService,
    private user: UserService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: object,
  ) {
    this.isLoggedOut$ = this.user.getAuthState().pipe(map((isAuth) => !isAuth));

    // Actualizar contador del carrito y regenerar acciones cuando cambie
    this.cart.count$?.pipe(takeUntil(this.destroy$))?.subscribe?.((n) => {
      this.cartCount = n ?? 0;
      if (this.userRole === 'Cliente') {
        this.generateTopBarActions(); // Actualizar badges del carrito
      }
    });

    // Siempre dirigir el logo al Home
    this.logoLink = '/home';
  }

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.mainEl = document.getElementById('main') as HTMLElement | null;
    this.applyTopPadding();

    // Suscribirse a cambios del centro de notificaciones (localStorage)
    try {
      const { getUnseenCount } = require('../../utils/notification-center.store');
      const update = () => {
        try {
          this.notifCount = getUnseenCount();
        } catch {
          this.notifCount = 0;
        }
        this.generateTopBarActions();
      };
      update();
      window.addEventListener('notification-center:update', update);
      window.addEventListener('focus', update);
      this.destroy$.pipe(takeUntil(this.destroy$)).subscribe(() => {
        window.removeEventListener('notification-center:update', update);
        window.removeEventListener('focus', update);
      });
    } catch {}

    // Detectar cambios en el rol del usuario
    this.user
      .getAuthState()
      .pipe(takeUntil(this.destroy$))
      .subscribe((isLoggedIn) => {
        this.userRole = isLoggedIn ? this.user.getUserRole() : null;
        this.generateTopBarActions();
      });

    // Recalcular al cambiar de ruta (Home sin padding; resto con padding)
    this.router.events.pipe(takeUntil(this.destroy$)).subscribe((e) => {
      if (e instanceof NavigationEnd) this.applyTopPadding();
    });
  }

  private generateTopBarActions(): void {
    this.topBarActions = [];

    if (!this.userRole) {
      // NO AUTENTICADO: Login
      this.topBarActions = [
        {
          icon: 'fa fa-user',
          route: '/login',
          ariaLabel: 'Iniciar sesión',
        },
      ];
    } else if (this.userRole === 'Cliente') {
      // CLIENTE: 🛒 | 👤 | 🔔 | 🚪
      this.topBarActions = [
        {
          icon: 'fa fa-shopping-cart',
          route: '/cliente/carrito-cliente',
          badge: this.cartCount,
          ariaLabel: 'Carrito de compras',
        },
        {
          icon: 'fa fa-user-circle',
          route: '/cliente/perfil',
          ariaLabel: 'Mi perfil',
        },
        {
          icon: 'fa fa-bell',
          route: '/notificaciones',
          ariaLabel: 'Notificaciones',
          badge: this.notifCount,
        },
        {
          icon: 'fa fa-sign-out-alt',
          action: 'logout',
          isButton: true,
          ariaLabel: 'Cerrar sesión',
        },
      ];
    } else if (this.userRole === 'Administrador') {
      // ADMIN: ⚡ | 👤 | 🔔 | 🚪
      this.topBarActions = [
        {
          icon: 'fa fa-cogs',
          route: '/admin/dashboard',
          ariaLabel: 'Acciones administrativas',
        },
        {
          icon: 'fa fa-user-circle',
          route: '/trabajador/perfil',
          ariaLabel: 'Mi perfil',
        },
        {
          icon: 'fa fa-bell',
          route: '/notificaciones',
          ariaLabel: 'Notificaciones',
          badge: this.notifCount,
        },
        {
          icon: 'fa fa-sign-out-alt',
          action: 'logout',
          isButton: true,
          ariaLabel: 'Cerrar sesión',
        },
      ];
    } else if (this.userRole === 'Domiciliario') {
      // DOMICILIARIO: 👤 | 🔔 | 🚪
      this.topBarActions = [
        {
          icon: 'fa fa-user-circle',
          route: '/trabajador/perfil',
          ariaLabel: 'Mi perfil',
        },
        {
          icon: 'fa fa-bell',
          route: '/notificaciones',
          ariaLabel: 'Notificaciones',
          badge: this.notifCount,
        },
        {
          icon: 'fa fa-sign-out-alt',
          action: 'logout',
          isButton: true,
          ariaLabel: 'Cerrar sesión',
        },
      ];
    } else if (this.userRole === 'Mesero' || this.userRole === 'Cocinero') {
      // MESERO/COCINERO: 👤 | 🔔 | 🚪
      this.topBarActions = [
        {
          icon: 'fa fa-user-circle',
          route: '/trabajador/perfil',
          ariaLabel: 'Mi perfil',
        },
        {
          icon: 'fa fa-bell',
          route: '/notificaciones',
          ariaLabel: 'Notificaciones',
        },
        {
          icon: 'fa fa-sign-out-alt',
          action: 'logout',
          isButton: true,
          ariaLabel: 'Cerrar sesión',
        },
      ];
    } else if (this.userRole === 'Oficios Varios') {
      // OFICIOS VARIOS: 👤 | 🚪 (sin notificaciones)
      this.topBarActions = [
        {
          icon: 'fa fa-user-circle',
          route: '/trabajador/perfil',
          ariaLabel: 'Mi perfil',
        },
        {
          icon: 'fa fa-sign-out-alt',
          action: 'logout',
          isButton: true,
          ariaLabel: 'Cerrar sesión',
        },
      ];
    }
  }

  onActionClick(action: TopBarAction): void {
    if (action.action === 'logout') {
      this.onLogout();
    } else if (action.route) {
      this.router.navigate([action.route]);
    }
  }

  onLogout(): void {
    this.user.logout();
    this.router.navigate(['/home']);
  }

  @HostListener('window:resize')
  onResize(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.applyTopPadding();
  }

  private applyTopPadding(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const bar = document.querySelector('.home-topbar') as HTMLElement | null;
    if (!this.mainEl || !bar) return;
    const url = this.router.url || '';
    const atHome = url === '/' || url.startsWith('/home');
    if (atHome) {
      // En Home: sin padding para que el carrusel quede pegado a la topbar
      this.mainEl.style.paddingTop = '0px';
      return;
    }
    // Usar altura fija de 60px para consistencia
    this.mainEl.style.paddingTop = `calc(60px + max(env(safe-area-inset-top), 0px))`;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    if (this.mainEl) this.mainEl.style.paddingTop = '';
  }
}
