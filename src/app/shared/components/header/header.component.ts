import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
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
  textoVisible: boolean = false;
  imagenVisible: boolean = true;
  menuLeft: MenuItem[] = [];
  menuRight: MenuItem[] = [];
  userRole: string | null = null;

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.userRole = this.userService.getUserRole();
    this.generateMenu();
  }

  private generateMenu(): void {
    let menuItems: MenuItem[] = [
      { label: 'Inicio', route: '/home', priority: 1 },
      { label: 'Menú', route: '/menu', priority: 2 },
      { label: 'Ubicación', route: '/location', priority: 3 },
      { label: 'Reservas', route: '/reservas', priority: 4 },
      { label: 'Galería', route: '/gallery', priority: 5 },
    ];

    if (!this.userRole) {
      menuItems.push({ label: 'Login', route: '/login', priority: 99 });
    } else {
      menuItems.push({ label: 'Logout', route: '/logout', priority: 99 });
      if (this.userRole === 'Cliente') {
        menuItems.unshift(
          { label: 'Perfil', route: '/perfil', priority: 7 }
        );
      } else if (this.userRole === 'Administrador') {
        menuItems.unshift({ label: 'Dashboard', route: '/admin', priority: 6 });
        menuItems = menuItems.filter(item => item.label !== 'Galería');
        menuItems = menuItems.filter(item => item.label !== 'Menú');
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

    this.textoVisible = this.menuLeft.length < 3 && this.menuRight.length < 3;
    this.imagenVisible = this.menuLeft.length > 4 || this.menuRight.length > 4;
  }

}
