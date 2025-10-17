import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { PrecioProductoHistService } from '../../../../core/services/precio-producto-hist.service';
import { PrecioProductoHist } from '../../../../shared/models/precio-producto-hist.model';

@Component({
  selector: 'app-historico-precios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './historico-precios.component.html',
  styleUrl: './historico-precios.component.scss',
})
export class HistoricoPreciosComponent implements OnInit {
  historico: PrecioProductoHist[] = [];
  historicoFiltrado: PrecioProductoHist[] = [];
  cargando = false;
  error = '';

  // Filtros
  filtroProductoId = '';
  filtroNombre = '';
  filtroFecha = '';

  constructor(private precioProductoHistService: PrecioProductoHistService) {}

  ngOnInit(): void {
    this.cargarHistorico();
  }

  cargarHistorico(): void {
    this.cargando = true;
    this.error = '';

    this.precioProductoHistService.list().subscribe({
      next: (response) => {
        if (response.code === 200 && response.data) {
          this.historico = response.data;
          this.historicoFiltrado = [...this.historico];
        } else {
          this.error = response.message || 'Error al cargar el histórico';
        }
        this.cargando = false;
      },
      error: (err) => {
        this.error = 'Error al cargar el histórico de precios';
        console.error('Error al cargar histórico:', err);
        this.cargando = false;
      },
    });
  }

  aplicarFiltros(): void {
    this.historicoFiltrado = this.historico.filter((item) => {
      const coincideProductoId = this.filtroProductoId
        ? item.productoId?.toString().includes(this.filtroProductoId)
        : true;

      const coincideNombre = this.filtroNombre
        ? item.nombre?.toLowerCase().includes(this.filtroNombre.toLowerCase())
        : true;

      const coincideFecha = this.filtroFecha ? item.fechaVigencia.includes(this.filtroFecha) : true;

      return coincideProductoId && coincideNombre && coincideFecha;
    });
  }

  limpiarFiltros(): void {
    this.filtroProductoId = '';
    this.filtroNombre = '';
    this.filtroFecha = '';
    this.historicoFiltrado = [...this.historico];
  }

  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(precio);
  }

  formatearFecha(fecha: string): string {
    if (!fecha) {
      return 'Fecha no disponible';
    }

    try {
      // Intentar parsear la fecha directamente
      let fechaObj = new Date(fecha);

      // Si no es válida, intentar con el formato ISO agregando la hora
      if (isNaN(fechaObj.getTime())) {
        fechaObj = new Date(fecha + 'T00:00:00');
      }

      // Verificar si la fecha es válida después de los intentos
      if (isNaN(fechaObj.getTime())) {
        console.error('Fecha inválida:', fecha);
        return 'Fecha inválida';
      }

      return new Intl.DateTimeFormat('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(fechaObj);
    } catch (error) {
      console.error('Error al formatear fecha:', fecha, error);
      return 'Error en fecha';
    }
  }
}
