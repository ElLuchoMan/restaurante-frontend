import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  HostListener,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  ViewEncapsulation,
} from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { map, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { UserService } from '../../../core/services/user.service';

export interface QuickActionItem {
  label: string;
  route: string;
  icon: string;
  badge?: number;
  isButton?: boolean;
}

@Component({
  selector: 'app-quick-actions',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './quick-actions.component.html',
  styleUrls: ['./quick-actions.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class QuickActionsComponent implements OnInit, AfterViewInit, OnDestroy {
  private footerObserver?: IntersectionObserver;
  private barEl?: HTMLElement | null;
  private mainEl?: HTMLElement | null;
  private teardownFns: Array<() => void> = [];
  private keyboardOpen = false;
  private footerVisible = false;
  private destroy$ = new Subject<void>();

  isLoggedOut$!: Observable<boolean>;
  userRole: string | null = null;
  quickActions: QuickActionItem[] = [];
  private isBrowser: boolean;

  constructor(
    private userService: UserService,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: object,
  ) {
    this.isLoggedOut$ = this.userService.getAuthState().pipe(map((isAuth) => !isAuth));
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    // Detectar cambios en el rol del usuario
    this.userService
      .getAuthState()
      .pipe(takeUntil(this.destroy$))
      .subscribe((isLoggedIn) => {
        this.userRole = isLoggedIn ? this.userService.getUserRole() : null;
        this.generateQuickActions();
      });
  }

  private generateQuickActions(): void {
    if (!this.userRole) {
      // NO AUTENTICADO: Menú | Reservas | Ubicación | Login
      this.quickActions = [
        { label: 'Menú', route: '/menu', icon: 'fa fa-utensils' },
        { label: 'Reservas', route: '/reservas', icon: 'fa fa-calendar' },
        { label: 'Ubicación', route: '/ubicacion', icon: 'fa fa-map-marker-alt' },
        { label: 'Login', route: '/login', icon: 'fa fa-sign-in-alt' },
      ];
    } else if (this.userRole === 'Cliente') {
      // CLIENTE: Menú | Reservas | Ubicación | Galería
      this.quickActions = [
        { label: 'Menú', route: '/menu', icon: 'fa fa-utensils' },
        { label: 'Reservas', route: '/reservas', icon: 'fa fa-calendar' },
        { label: 'Ubicación', route: '/ubicacion', icon: 'fa fa-map-marker-alt' },
        { label: 'Galería', route: '/gallery', icon: 'fa fa-images' },
      ];
    } else if (this.userRole === 'Administrador') {
      // ADMIN: Menú | Reservas | Logout
      this.quickActions = [
        { label: 'Menú', route: '/menu', icon: 'fa fa-utensils' },
        { label: 'Registro', route: '/admin/registro-admin', icon: 'fa fa-address-card' },
        { label: 'Reservas', route: '/admin/reservas', icon: 'fa fa-calendar' },
        { label: 'Logout', route: '/logout', icon: 'fa fa-sign-out-alt', isButton: true },
      ];
    } else if (this.userRole === 'Domiciliario') {
      // DOMICILIARIO: Domicilios | Menú | Mi perfil | Logout
      this.quickActions = [
        { label: 'Domicilios', route: '/trabajador/domicilios/tomar', icon: 'fa fa-motorcycle' },
        { label: 'Menú', route: '/menu', icon: 'fa fa-utensils' },
        { label: 'Mi perfil', route: '/trabajador/perfil', icon: 'fa fa-user' },
        { label: 'Logout', route: '/logout', icon: 'fa fa-sign-out-alt', isButton: true },
      ];
    } else if (this.userRole === 'Mesero' || this.userRole === 'Cocinero') {
      // MESERO/COCINERO: Pedidos | Menú | Mi perfil | Logout
      this.quickActions = [
        { label: 'Pedidos', route: '/trabajador/pedidos', icon: 'fa fa-clipboard-list' },
        { label: 'Menú', route: '/menu', icon: 'fa fa-utensils' },
        { label: 'Mi perfil', route: '/trabajador/perfil', icon: 'fa fa-user' },
        { label: 'Logout', route: '/logout', icon: 'fa fa-sign-out-alt', isButton: true },
      ];
    } else if (this.userRole === 'Oficios Varios') {
      // OFICIOS VARIOS: Menú | Mi perfil | Galería | Logout
      this.quickActions = [
        { label: 'Menú', route: '/menu', icon: 'fa fa-utensils' },
        { label: 'Mi perfil', route: '/trabajador/perfil', icon: 'fa fa-user' },
        { label: 'Galería', route: '/gallery', icon: 'fa fa-images' },
        { label: 'Logout', route: '/logout', icon: 'fa fa-sign-out-alt', isButton: true },
      ];
    }
  }

  onLogout(): void {
    this.userService.logout();
    this.router.navigate(['/home']);
  }

  onActionClick(action: QuickActionItem): void {
    if (action.isButton && action.route === '/logout') {
      this.onLogout();
    } else {
      this.router.navigate([action.route]);
    }
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser || typeof document === 'undefined' || typeof window === 'undefined') return;
    this.barEl = document.querySelector('.quick-actions-bar') as HTMLElement | null;
    this.mainEl = document.getElementById('main') as HTMLElement | null;
    if (!this.barEl || !this.mainEl) return;

    // Ajustar padding inferior del main mientras la barra esté visible
    const applyPadding = (visible: boolean) => {
      if (!this.mainEl || !this.barEl) return;
      const atHome = (this.router.url || '').startsWith('/home') || this.router.url === '/';
      if (!visible) {
        // En Home, deja un respiro mínimo más compacto cuando el footer oculta la barra
        this.mainEl.style.paddingBottom = atHome
          ? 'calc(8px + max(env(safe-area-inset-bottom), 0px))'
          : '';
        return;
      }
      const h = this.barEl.getBoundingClientRect().height;
      this.mainEl.style.paddingBottom = `calc(${Math.ceil(h)}px + max(env(safe-area-inset-bottom), 0px))`;
    };

    const updateVisibility = () => {
      const shouldShow = !this.keyboardOpen && !this.footerVisible;
      if (!this.barEl) return;
      if (shouldShow) {
        this.barEl.classList.remove('qa-hidden');
      } else {
        this.barEl.classList.add('qa-hidden');
      }
      applyPadding(shouldShow);
    };

    // Inicial visible
    updateVisibility();

    const setupFooterObserver = () => {
      // Limpiar anterior
      if (this.footerObserver) {
        try {
          this.footerObserver.disconnect();
        } catch {}
        this.footerObserver = undefined;
      }
      const footerEl = document.querySelector('app-footer .footer') as Element | null;
      if (!footerEl) {
        this.footerVisible = false;
        updateVisibility();
        return;
      }
      this.footerObserver = new IntersectionObserver(
        (entries) => {
          this.footerVisible = entries[0]?.isIntersecting === true;
          updateVisibility();
        },
        { root: null, threshold: 0.01, rootMargin: '0px 0px 120px 0px' },
      );
      this.footerObserver.observe(footerEl);
    };

    // Inicial tras render
    setTimeout(setupFooterObserver, 0);

    // Re-vincular al cambiar de ruta (Home agrega/quita footer)
    const sub = this.router.events.subscribe((e) => {
      if (e instanceof NavigationEnd) {
        setTimeout(setupFooterObserver, 0);
      }
    });
    this.teardownFns.push(() => sub.unsubscribe());

    // Detectar apertura de teclado por focus de inputs
    const onFocusIn = (ev: Event) => {
      const t = ev.target as HTMLElement | null;
      if (!t) return;
      const tag = (t.tagName || '').toUpperCase();
      if (tag === 'INPUT' || tag === 'TEXTAREA' || t.isContentEditable) {
        this.keyboardOpen = true;
        updateVisibility();
      }
    };
    const onFocusOut = () => {
      this.keyboardOpen = false;
      updateVisibility();
    };
    document.addEventListener('focusin', onFocusIn, true);
    document.addEventListener('focusout', onFocusOut, true);
    this.teardownFns.push(() => document.removeEventListener('focusin', onFocusIn, true));
    this.teardownFns.push(() => document.removeEventListener('focusout', onFocusOut, true));

    // Detectar teclado por cambio fuerte de viewport (visualViewport)
    const vv = (window as unknown as { visualViewport?: VisualViewport }).visualViewport;
    const base = window.innerHeight;
    const onVVResize = () => {
      const h = vv?.height ?? window.innerHeight;
      const delta = base - h;
      // Umbral ~120px para considerar teclado abierto
      const likelyKeyboard = delta > 120;
      if (this.keyboardOpen !== likelyKeyboard) {
        this.keyboardOpen = likelyKeyboard;
        updateVisibility();
      }
    };
    if (vv && typeof vv.addEventListener === 'function') {
      vv.addEventListener('resize', onVVResize);
      this.teardownFns.push(() => vv.removeEventListener('resize', onVVResize));
    }

    // Efecto tap: agregar clase para animación en CSS
    const items = Array.from(document.querySelectorAll('.quick-actions .qa-item')) as HTMLElement[];
    const attachTap = (el: HTMLElement) => {
      const trigger = () => {
        el.classList.add('qa-tap');
        window.setTimeout(() => el.classList.remove('qa-tap'), 240);
      };
      const onPointer = () => trigger();
      const onKey = (ev: KeyboardEvent) => {
        const k = ev.key;
        if (k === 'Enter' || k === ' ') trigger();
      };
      el.addEventListener('pointerdown', onPointer, { passive: true });
      el.addEventListener('keydown', onKey);
      this.teardownFns.push(() => el.removeEventListener('pointerdown', onPointer));
      this.teardownFns.push(() => el.removeEventListener('keydown', onKey));
    };
    items.forEach(attachTap);
  }

  @HostListener('window:resize')
  onResize(): void {
    // Recalcular padding si cambia el alto de la barra
    if (!this.mainEl || !this.barEl) return;
    if (this.barEl.classList.contains('qa-hidden')) {
      this.mainEl.style.paddingBottom = '';
    } else {
      const h = this.barEl.getBoundingClientRect().height;
      this.mainEl.style.paddingBottom = `calc(${Math.ceil(h)}px + max(env(safe-area-inset-bottom), 0px))`;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    if (this.footerObserver) this.footerObserver.disconnect();
    if (this.mainEl) this.mainEl.style.paddingBottom = '';
    for (const off of this.teardownFns) {
      try {
        off();
      } catch {}
    }
  }
}
