import { Component, OnInit, Inject, PLATFORM_ID, HostListener } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { MenuItem } from '../../models/menu-item.model';

@Component({
  selector: 'app-header',
  imports: [RouterModule, CommonModule],
  standalone: true,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  menuLeft: MenuItem[] = [];
  menuRight: MenuItem[] = [];
  userRole: string | null = null;
  isBrowser: boolean;
  imagenVisible: boolean = true;

  constructor(private userService: UserService, @Inject(PLATFORM_ID) private platformId: any, private router: Router) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.userService.getAuthState().subscribe((isLoggedIn) => {
      this.userRole = isLoggedIn ? this.userService.getUserRole() : null;
      this.generateMenu();
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
    let menuItems: MenuItem[] = [
      { label: 'Inicio', route: '/home', priority: 1 },
      { label: 'Menú', route: '/menu', priority: 2 },
      { label: 'Ubicación', route: '/ubicacion', priority: 2 },
      { label: 'Reservas', route: '/reservas', priority: 4 },
      { label: 'Galería', route: '/gallery', priority: 5 },
    ];

    if (!this.userRole) {
      menuItems.push({ label: 'Login', route: '/login', priority: 99 });
    } else {
      menuItems.push({ label: 'Logout', route: '/logout', priority: 99 });

      if (this.userRole === 'Cliente') {
        menuItems.unshift({ label: 'Perfil', route: '/perfil', priority: 7 });
      } else if (this.userRole === 'Administrador') {
        menuItems.unshift({ label: 'Registrar', route: 'admin/registro-admin', priority: 6 });
        menuItems = menuItems.filter(item => item.label !== 'Galería');
        menuItems = menuItems.filter(item => item.label !== 'Menú');
        menuItems = menuItems.filter(item => item.label !== 'Ubicación');
      } else if (this.userRole === 'Mesero') {
        menuItems.push({ label: 'Pedidos', route: '/pedidos', priority: 8 });
      } else if (this.userRole === 'Domiciliario') {
        menuItems.push({ label: 'Mis entregas', route: '/entregas', priority: 8 });
      }
    }

    menuItems.sort((a, b) => a.priority - b.priority);

    const midIndex = Math.ceil(menuItems.length / 2);
    this.menuLeft = menuItems.slice(0, midIndex);
    this.menuRight = menuItems.slice(midIndex);

    this.checkScreenSize();
  }

  logout(): void {
    this.userService.logout();
    this.router.navigate(['/home']);
  }
}
