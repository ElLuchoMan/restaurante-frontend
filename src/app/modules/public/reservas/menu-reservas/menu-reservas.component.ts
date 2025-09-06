import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';

import { UserService } from '../../../../core/services/user.service';

@Component({
  selector: 'app-menu-reservas',
  standalone: true,
  templateUrl: './menu-reservas.component.html',
  styleUrls: ['./menu-reservas.component.scss'],
  imports: [RouterOutlet, CommonModule],
})
export class MenuReservasComponent implements OnInit {
  mostrarMenu: boolean = true;
  rol: string | null = '';
  esAdmin: boolean = false;

  constructor(
    private router: Router,
    private userService: UserService,
  ) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const url = event.urlAfterRedirects.split('?')[0];
        this.mostrarMenu = url === '/reservas' || url === '/reservas/';
      }
    });
  }

  ngOnInit(): void {
    this.rol = this.userService.getUserRole() || null;
    this.esAdmin = this.rol === 'Administrador';

    const currentUrl = this.router.url.split('?')[0];
    this.mostrarMenu = currentUrl === '/reservas' || currentUrl === '/reservas/';

    if (!this.esAdmin && this.mostrarMenu) {
      this.irA('crear');
    }
  }

  irA(ruta: string) {
    this.router.navigate([`/reservas/${ruta}`]);
  }

  volver() {
    this.router.navigate(['/reservas']);
  }
}
