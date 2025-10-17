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
  selector: 'app-gestionar-pedidos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gestionar-pedidos.component.html',
  styleUrl: './gestionar-pedidos.component.scss',
})
export class GestionarPedidosComponent {
  subtitulo = 'Consulta y administra los pedidos del restaurante';

  opciones: OpcionCard[] = [
    {
      titulo: 'Pedidos Activos',
      descripcion: 'Ver pedidos activos en tiempo real',
      icono: 'fa-clock',
      ruta: '/admin/pedidos/gestionar-pedidos/activos',
      color: 'blue',
    },
    {
      titulo: 'Buscar por Usuario',
      descripcion: 'Consultar historial de pedidos de un cliente',
      icono: 'fa-user',
      ruta: '/admin/pedidos/gestionar-pedidos/por-usuario',
      color: 'green',
    },
    {
      titulo: 'Buscar por Fecha',
      descripcion: 'Filtrar pedidos por rango de fechas',
      icono: 'fa-calendar',
      ruta: '/admin/pedidos/gestionar-pedidos/por-fecha',
      color: 'purple',
    },
  ];

  constructor(private router: Router) {}

  navegarA(ruta: string): void {
    this.router.navigate([ruta]);
  }
}
