import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

interface OpcionCard {
  titulo: string;
  descripcion: string;
  icono: string;
  ruta: string;
  color: string;
}

@Component({
  selector: 'app-menu-pedidos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './menu-pedidos.component.html',
  styleUrl: './menu-pedidos.component.scss',
})
export class MenuPedidosComponent {
  subtitulo = 'Gestiona pedidos, domicilios y pagos desde un solo lugar';

  opciones: OpcionCard[] = [
    {
      titulo: 'Gestionar Pedidos',
      descripcion: 'Consultar pedidos activos y búsqueda por usuario',
      icono: 'fa-clipboard-list',
      ruta: '/admin/pedidos/gestionar-pedidos',
      color: 'blue',
    },
    {
      titulo: 'Gestionar Domicilios',
      descripcion: 'Consultar domicilios y entregas del restaurante',
      icono: 'fa-truck',
      ruta: '/admin/pedidos/gestionar-domicilios',
      color: 'green',
    },
    {
      titulo: 'Gestionar Pagos',
      descripcion: 'Consultar y agrupar pagos por fecha o método',
      icono: 'fa-credit-card',
      ruta: '/admin/pedidos/gestionar-pagos',
      color: 'orange',
    },
  ];

  constructor(private router: Router) {}

  navegarA(ruta: string): void {
    this.router.navigate([ruta]);
  }
}
