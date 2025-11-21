import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, HostListener, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { CartService } from '../../../core/services/cart.service';
import { LayoutService } from '../../../core/services/layout.service';
import { LiveAnnouncerService } from '../../../core/services/live-announcer.service';
import { NetworkService } from '../../../core/services/network.service';
import { UserService } from '../../../core/services/user.service';
import { MenuItem } from '../../models/menu-item.model';
import { QuickActionsComponent } from '../quick-actions/quick-actions.component';

@Component({
  selector: 'app-header',
  imports: [RouterModule, CommonModule, QuickActionsComponent],
  standalone: true,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  menuLeft: MenuItem[] = [];
  menuRight: MenuItem[] = [];
  userRole: string | null = null;
  isBrowser: boolean;
  isNative = false;
  showHeader = true;
  imagenVisible: boolean = true;
  cartCount = 0;
  online = true;
  private destroy$ = new Subject<void>();
  private firstFocusableSelector = '.navbar-nav .nav-link';

  constructor(
    private userService: UserService,
    @Inject(PLATFORM_ID) private platformId: object,
    private router: Router,
    private cartService: CartService,
    private live: LiveAnnouncerService,
    private network: NetworkService,
    private layoutService: LayoutService,
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    // Mostrar header clásico solo en navegadores; en nativo usamos topbar
    if (this.isBrowser && typeof window !== 'undefined') {
      const cap = (window as Window & { Capacitor?: { getPlatform?: () => string } }).Capacitor;
      this.isNative = !!(
        cap &&
        typeof cap.getPlatform === 'function' &&
        cap.getPlatform() !== 'web'
      );
      this.showHeader = !this.isNative;

      // CORREGIR BUG: Limpiar estado visual al inicializar
      if (typeof document !== 'undefined') {
        setTimeout(() => {
          const navbar = document.querySelector('.navbar');
          navbar?.classList.remove('logging-out');
        }, 100);
      }
    } else {
      this.isNative = false;
      this.showHeader = true;
    }

    this.userService
      .getAuthState()
      .pipe(takeUntil(this.destroy$))
      .subscribe((isLoggedIn) => {
        this.userRole = isLoggedIn ? this.userService.getUserRole() : null;
        this.generateMenu();
      });

    this.cartService.count$.pipe(takeUntil(this.destroy$)).subscribe((count) => {
      this.cartCount = count;
    });
    this.network.isOnline$.pipe(takeUntil(this.destroy$)).subscribe((o) => (this.online = o));
    // Anuncio cuando vuelve la red
    this.network.isOnline$.pipe(takeUntil(this.destroy$)).subscribe((o) => {
      if (o) {
        this.live.announce('Conexión restablecida');
      }
    });

    // Suscribirse a la visibilidad del header desde LayoutService
    this.layoutService.headerVisible$
      .pipe(takeUntil(this.destroy$))
      .subscribe((visible: boolean) => {
        // Solo actualizar si no estamos en modo nativo (donde siempre está oculto)
        if (!this.isNative) {
          this.showHeader = visible;
        }
      });

    if (this.isBrowser) {
      this.checkScreenSize();
      this.bindMenuA11yHandlers();
    }
  }

  @HostListener('window:resize', [])
  onResize(): void {
    if (this.isBrowser) {
      this.checkScreenSize();
    }
  }

  @HostListener('window:scroll', [])
  onScroll(): void {
    // Cerrar menú automáticamente al hacer scroll
    this.cerrarMenu();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!this.isBrowser) return;
    // Cerrar menú al hacer clic fuera de él
    const target = event.target as HTMLElement;
    const navbar = document.getElementById('navbarCollapse');
    const toggler = document.querySelector('.navbar-toggler');

    if (
      navbar?.classList.contains('show') &&
      !navbar.contains(target) &&
      !toggler?.contains(target)
    ) {
      this.cerrarMenu();
    }
  }

  private bindMenuA11yHandlers(): void {
    const toggler = document.querySelector<HTMLButtonElement>('.navbar-toggler');
    const collapse = document.getElementById('navbarCollapse');
    if (!toggler || !collapse) return;

    // Alterna aria-expanded
    const updateExpanded = () => {
      const expanded = collapse.classList.contains('show');
      toggler.setAttribute('aria-expanded', String(expanded));
    };

    // Enfoca primer link al abrir
    const focusFirst = () => {
      const first = collapse.querySelector(this.firstFocusableSelector) as HTMLAnchorElement | null;
      if (first) setTimeout(() => first.focus(), 0);
    };

    toggler.addEventListener('click', () => {
      setTimeout(() => {
        updateExpanded();
        if (collapse.classList.contains('show')) {
          focusFirst();
        }
      }, 0);
    });

    // Cierre con Escape dentro del menú
    collapse.addEventListener('keydown', (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') {
        ev.stopPropagation();
        this.cerrarMenu();
        toggler.focus();
        updateExpanded();
      }
    });
  }

  checkScreenSize(): void {
    if (this.isBrowser && typeof window !== 'undefined') {
      const screenWidth = window.innerWidth;
      const totalItems = this.menuLeft.length + this.menuRight.length;

      // Transición suave del logo con animación
      const newImagenVisible = screenWidth < 1201 || totalItems > 6;
      if (newImagenVisible !== this.imagenVisible) {
        this.imagenVisible = newImagenVisible;
        this.animateLogoTransition();
      }
    }
  }

  private animateLogoTransition(): void {
    if (!this.isBrowser) return;

    const logoContainer = document.querySelector('.logo-container');
    if (logoContainer) {
      logoContainer.classList.add('transitioning');
      setTimeout(() => {
        logoContainer.classList.remove('transitioning');
      }, 300);
    }
  }

  private generateMenu(): void {
    let menuItems: MenuItem[] = [];

    if (!this.userRole) {
      // NO AUTENTICADO
      menuItems = [
        { label: 'Inicio', route: '/home', priority: 1 },
        { label: 'Menú', route: '/menu', priority: 2 },
        { label: 'Ubicación', route: '/ubicacion', priority: 3 },
        { label: 'Reservas', route: '/reservas', priority: 4 },
        { label: 'Galería', route: '/gallery', priority: 5 },
        { label: 'Login', route: '/login', priority: 99 },
      ];
    } else {
      // AUTENTICADO - por rol
      if (this.userRole === 'Cliente') {
        // CLIENTE: Menú | Ubicación | Reservas | Galería | Perfil | 🛒 | Logout
        menuItems = [
          { label: 'Menú', route: '/menu', priority: 1 },
          { label: 'Reservas', route: '/reservas', priority: 2 },
          { label: 'Galería', route: '/gallery', priority: 3 },
          { label: 'Perfil', route: '/cliente/perfil', priority: 4 },
          { label: '🛒', route: '/cliente/carrito-cliente', priority: 5 },
          { label: 'Logout', route: '/logout', priority: 99 },
        ];
      } else if (this.userRole === 'Administrador') {
        // ADMIN: Telemetría | Productos | Reservas | Registro | Logout
        menuItems = [
          { label: 'Acciones', route: '/admin/acciones', priority: 1 },
          { label: 'Reservas', route: '/admin/reservas', priority: 2 },
          { label: 'Registro', route: '/admin/registro-admin', priority: 3 },
          { label: 'Logout', route: '/logout', priority: 99 },
        ];
      } else if (this.userRole === 'Domiciliario') {
        // DOMICILIARIO: Domicilios | Menú | Mi perfil | Logout
        menuItems = [
          { label: 'Domicilios', route: '/trabajador/domicilios/tomar', priority: 1 },
          { label: 'Menú', route: '/menu', priority: 2 },
          { label: 'Mi perfil', route: '/trabajador/perfil', priority: 3 },
          { label: 'Logout', route: '/logout', priority: 99 },
        ];
      } else if (this.userRole === 'Mesero') {
        // MESERO: Pedidos | Menú | Mi perfil | Logout
        menuItems = [
          { label: 'Pedidos', route: '/trabajador/pedidos', priority: 1 },
          { label: 'Menú', route: '/menu', priority: 2 },
          { label: 'Mi perfil', route: '/trabajador/perfil', priority: 3 },
          { label: 'Logout', route: '/logout', priority: 99 },
        ];
      } else if (this.userRole === 'Cocinero') {
        // COCINERO: Pedidos | Menú | Mi perfil | Logout
        menuItems = [
          { label: 'Pedidos', route: '/trabajador/pedidos', priority: 1 },
          { label: 'Menú', route: '/menu', priority: 2 },
          { label: 'Mi perfil', route: '/trabajador/perfil', priority: 3 },
          { label: 'Logout', route: '/logout', priority: 99 },
        ];
      } else if (this.userRole === 'Oficios Varios') {
        // OFICIOS VARIOS: Menú | Mi perfil | Galería | Logout
        menuItems = [
          { label: 'Menú', route: '/menu', priority: 1 },
          { label: 'Mi perfil', route: '/trabajador/perfil', priority: 2 },
          { label: 'Galería', route: '/gallery', priority: 3 },
          { label: 'Logout', route: '/logout', priority: 99 },
        ];
      }
    }

    menuItems.sort((a, b) => a.priority - b.priority);

    const midIndex = Math.ceil(menuItems.length / 2);
    this.menuLeft = menuItems.slice(0, midIndex);
    this.menuRight = menuItems.slice(midIndex);

    this.checkScreenSize();
  }

  logout(): void {
    // Animación suave antes de cerrar sesión
    if (this.isBrowser) {
      const navbar = document.querySelector('.navbar');
      navbar?.classList.add('logging-out');

      // CORREGIR BUG: Remover la clase después de la animación
      setTimeout(() => {
        navbar?.classList.remove('logging-out');
      }, 200); // Un poco más que la duración de la transición CSS (0.15s)
    }

    this.userService.logout();
    this.cerrarMenu();

    setTimeout(() => {
      this.router.navigate(['/home']);
      this.live.announce('Sesión cerrada correctamente');
    }, 150);
  }
  cerrarMenu(): void {
    if (this.isBrowser) {
      const navbar = document.getElementById('navbarCollapse');
      const toggler = document.querySelector<HTMLButtonElement>('.navbar-toggler');

      if (navbar?.classList.contains('show')) {
        navbar.classList.remove('show');
        // Actualizar aria-expanded del botón toggler
        if (toggler) {
          toggler.setAttribute('aria-expanded', 'false');
        }
      }
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
