import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID, HostListener } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UserService } from '../../../core/services/user.service';
import { MenuItem } from '../../models/menu-item.model';
import { CartService } from '../../../core/services/cart.service';

interface RoleMenuConfig {
  add?: MenuItem[];
  remove?: string[];
}

const BASE_MENU: MenuItem[] = [
  { label: 'Inicio', route: '/home', priority: 1 },
  { label: 'Menú', route: '/menu', priority: 2 },
  { label: 'Ubicación', route: '/ubicacion', priority: 2 },
  { label: 'Reservas', route: '/reservas', priority: 4 },
  { label: 'Galería', route: '/gallery', priority: 5 },
];

const ROLE_MENU_CONFIG: Record<string, RoleMenuConfig> = {
  Cliente: {
    add: [
      { label: 'Perfil', route: 'cliente/perfil', priority: 7 },
      { label: '🛒', route: 'cliente/carrito-cliente', priority: 8 },
    ],
    remove: ['Inicio', 'Ubicación', 'Galería'],
  },
  Administrador: {
    add: [
      { label: 'Registrar', route: 'admin/registro-admin', priority: 6 },
      { label: 'Domicilios', route: '/domicilios/consultar', priority: 3 },
      { label: 'Productos', route: '/admin/productos/', priority: 3 },
    ],
    remove: ['Inicio', 'Galería', 'Menú', 'Ubicación'],
  },
  Mesero: {
    add: [{ label: 'Pedidos', route: '/pedidos', priority: 8 }],
  },
  Domiciliario: {
    add: [{ label: 'Domicilios', route: '/trabajador/domicilios/tomar', priority: 8 }],
    remove: ['Galería', 'Menú', 'Reservas'],
  },
};

@Component({
  selector: 'app-header',
  imports: [RouterModule, CommonModule],
  standalone: true,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  menuLeft: MenuItem[] = [];
  menuRight: MenuItem[] = [];
  userRole: string | null = null;
  isBrowser: boolean;
  imagenVisible: boolean = true;
  cartCount = 0;
  private destroy$ = new Subject<void>();

  constructor(private userService: UserService, @Inject(PLATFORM_ID) private platformId: any, private router: Router, private cartService: CartService) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.userService.getAuthState()
      .pipe(takeUntil(this.destroy$))
      .subscribe((isLoggedIn) => {
        this.userRole = isLoggedIn ? this.userService.getUserRole() : null;
        this.generateMenu();
      });

    this.cartService.count$
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => {
        this.cartCount = count;
      });
    if (this.isBrowser) {
      this.checkScreenSize();
    }
  }

  @HostListener('window:resize', [])
  onResize(): void {
    if (this.isBrowser) {
      this.checkScreenSize();
    }
  }

  checkScreenSize(): void {
    if (this.isBrowser) {
      const screenWidth = window.innerWidth;
      const totalItems = this.menuLeft.length + this.menuRight.length;

      this.imagenVisible = screenWidth < 1201 || totalItems > 6;
    }
  }

  private generateMenu(): void {
    const items = new Map<string, MenuItem>();

    BASE_MENU.forEach(item => items.set(item.label, item));

    if (!this.userRole) {
      items.set('Login', { label: 'Login', route: '/login', priority: 99 });
    } else {
      items.set('Logout', { label: 'Logout', route: '/logout', priority: 99 });
      const config = ROLE_MENU_CONFIG[this.userRole];
      config?.add?.forEach(item => items.set(item.label, item));
      config?.remove?.forEach(label => items.delete(label));
    }

    const menuItems = Array.from(items.values()).sort((a, b) => a.priority - b.priority);

    const midIndex = Math.ceil(menuItems.length / 2);
    this.menuLeft = menuItems.slice(0, midIndex);
    this.menuRight = menuItems.slice(midIndex);

    this.checkScreenSize();
  }

  logout(): void {
    this.userService.logout();
    this.cerrarMenu();
    this.router.navigate(['/home']);
  }
  cerrarMenu(): void {
    if (this.isBrowser) {
      const navbar = document.getElementById('navbarCollapse');
      if (navbar?.classList.contains('show')) {
        navbar.classList.remove('show');
      }
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
