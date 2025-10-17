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
  selector: 'app-gestionar-pagos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gestionar-pagos.component.html',
  styleUrl: './gestionar-pagos.component.scss',
})
export class GestionarPagosComponent {
  subtitulo = 'Consulta, ordena y agrupa información de pagos y transacciones';

  opciones: OpcionCard[] = [
    {
      titulo: 'Pagos del Día',
      descripcion: 'Ver pagos realizados el día de hoy',
      icono: 'fa-calendar-day',
      ruta: '/admin/pedidos/gestionar-pagos/del-dia',
      color: 'blue',
    },
    {
      titulo: 'Buscar por Fecha',
      descripcion: 'Consultar pagos por rango de fechas',
      icono: 'fa-calendar',
      ruta: '/admin/pedidos/gestionar-pagos/por-fecha',
      color: 'green',
    },
    {
      titulo: 'Buscar por Método de Pago',
      descripcion: 'Filtrar pagos por efectivo, tarjeta o transferencia',
      icono: 'fa-credit-card',
      ruta: '/admin/pedidos/gestionar-pagos/por-metodo',
      color: 'purple',
    },
    {
      titulo: 'Agrupar y Ordenar',
      descripcion: 'Organizar pagos por precio, fecha o método',
      icono: 'fa-sort-amount-down',
      ruta: '/admin/pedidos/gestionar-pagos/agrupar',
      color: 'orange',
    },
  ];

  constructor(private router: Router) {}

  navegarA(ruta: string): void {
    this.router.navigate([ruta]);
  }
}
