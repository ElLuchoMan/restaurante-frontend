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
  selector: 'app-gestionar-domicilios',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gestionar-domicilios.component.html',
  styleUrl: './gestionar-domicilios.component.scss',
})
export class GestionarDomiciliosComponent {
  subtitulo = 'Consulta y administra los domicilios y entregas del restaurante';

  opciones: OpcionCard[] = [
    {
      titulo: 'Domicilios Activos',
      descripcion: 'Ver domicilios en curso sin filtros',
      icono: 'fa-shipping-fast',
      ruta: '/admin/pedidos/gestionar-domicilios/activos',
      color: 'blue',
    },
    {
      titulo: 'Buscar por Usuario',
      descripcion: 'Consultar domicilios de un cliente',
      icono: 'fa-user',
      ruta: '/admin/pedidos/gestionar-domicilios/por-usuario',
      color: 'green',
    },
    {
      titulo: 'Buscar por Fecha',
      descripcion: 'Filtrar domicilios por rango de fechas',
      icono: 'fa-calendar',
      ruta: '/admin/pedidos/gestionar-domicilios/por-fecha',
      color: 'purple',
    },
    {
      titulo: 'Buscar por Domiciliario',
      descripcion: 'Ver domicilios de un repartidor específico',
      icono: 'fa-motorcycle',
      ruta: '/admin/pedidos/gestionar-domicilios/por-domiciliario',
      color: 'orange',
    },
    {
      titulo: 'Buscar por Estado',
      descripcion: 'Filtrar domicilios por estado de entrega',
      icono: 'fa-tasks',
      ruta: '/admin/pedidos/gestionar-domicilios/por-estado',
      color: 'red',
    },
  ];

  constructor(private router: Router) {}

  navegarA(ruta: string): void {
    this.router.navigate([ruta]);
  }
}
