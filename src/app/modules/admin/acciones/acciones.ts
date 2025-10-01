import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

interface AccionCard {
  titulo: string;
  descripcion: string;
  icono: string;
  ruta: string;
  color: string;
}

@Component({
  selector: 'app-acciones',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './acciones.html',
  styleUrl: './acciones.scss',
})
export class AccionesComponent {
  // Subtítulo descriptivo del menú
  subtitulo = 'Accede rápidamente a las herramientas administrativas del sistema';

  acciones: AccionCard[] = [
    {
      titulo: 'Telemetría',
      descripcion: 'Monitorear métricas y rendimiento del sistema',
      icono: 'fa-chart-line',
      ruta: '/admin/telemetria',
      color: 'blue',
    },
    {
      titulo: 'Productos',
      descripcion: 'Gestionar catálogo de productos y menú',
      icono: 'fa-utensils',
      ruta: '/admin/productos',
      color: 'green',
    },
    {
      titulo: 'Notificaciones',
      descripcion: 'Enviar notificaciones push a clientes y trabajadores',
      icono: 'fa-bell',
      ruta: '/admin/enviar-notificacion',
      color: 'orange',
    },
  ];

  constructor(private router: Router) {}

  navegarA(ruta: string): void {
    this.router.navigate([ruta]);
  }
}
