import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';

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
  private basePath: string = '/reservas';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
  ) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.updateState();
      }
    });
  }

  ngOnInit(): void {
    this.rol = this.userService.getUserRole() || null;
    this.esAdmin = this.rol === 'Administrador';
    console.log('Entrando, si es Admin', this.esAdmin);

    this.updateState();

    if (!this.esAdmin && this.mostrarMenu) {
      this.irA('crear');
    }
  }

  irA(ruta: string) {
    this.router.navigate([`${this.basePath}/${ruta}`]);
  }

  volver() {
    this.router.navigate([this.basePath]);
  }

  private updateState(): void {
    const currentUrl = this.router.url.split('?')[0];
    const isAdminPath = currentUrl.startsWith('/admin/reservas');
    this.basePath = isAdminPath ? '/admin/reservas' : '/reservas';
    // Mostrar menú cuando NO estamos en una subruta conocida
    const isSubroute = /(\/consultar|\/hoy|\/crear)(\/|$)/.test(currentUrl);
    this.mostrarMenu = !isSubroute;
  }
}
