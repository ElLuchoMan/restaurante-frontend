import { CommonModule } from '@angular/common';
import { Component, computed, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { TelemetryService } from '../core/services/telemetry.service';
import {
  DashboardData,
  ProductosPopularesData,
  TelemetryParams,
  TimePeriod,
} from '../shared/models/telemetry.model';
import { getSafeImageSrc } from '../shared/utils/image.utils';

@Component({
  selector: 'app-telemetry-example',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-shell">
      <div class="section-title">
        <h2>🚀 Ejemplo de Servicio de Telemetría Avanzado</h2>
      </div>

      <div class="card">
        <h3>📊 Filtros Temporales Avanzados</h3>

        <!-- Filtros Predefinidos -->
        <div class="filter-group">
          <h4>1. Filtros Predefinidos</h4>
          <select
            [ngModel]="selectedPeriod()"
            (ngModelChange)="selectedPeriod.set($event); loadDashboardData()"
          >
            <option value="hoy">Hoy</option>
            <option value="ultima_semana">Última Semana</option>
            <option value="ultimo_mes">Último Mes</option>
            <option value="ultimos_3_meses">Últimos 3 Meses</option>
            <option value="ultimos_6_meses">Últimos 6 Meses</option>
            <option value="ultimo_año">Último Año</option>
            <option value="historico">Histórico</option>
          </select>
        </div>

        <!-- Filtros por Mes/Año -->
        <div class="filter-group">
          <h4>2. Filtros por Mes y Año</h4>
          <input
            type="number"
            [ngModel]="selectedMonth()"
            (ngModelChange)="selectedMonth.set($event); loadDashboardData()"
            min="1"
            max="12"
            placeholder="Mes (1-12)"
          />
          <input
            type="number"
            [ngModel]="selectedYear()"
            (ngModelChange)="selectedYear.set($event); loadDashboardData()"
            min="2020"
            max="2030"
            placeholder="Año"
          />
        </div>

        <!-- Filtros por Rango de Fechas -->
        <div class="filter-group">
          <h4>3. Filtros por Rango de Fechas y Horas</h4>
          <input
            type="date"
            [ngModel]="startDate()"
            (ngModelChange)="startDate.set($event); loadDashboardData()"
          />
          <input
            type="date"
            [ngModel]="endDate()"
            (ngModelChange)="endDate.set($event); loadDashboardData()"
          />
          <input
            type="time"
            [ngModel]="startTime()"
            (ngModelChange)="startTime.set($event); loadDashboardData()"
          />
          <input
            type="time"
            [ngModel]="endTime()"
            (ngModelChange)="endTime.set($event); loadDashboardData()"
          />
        </div>

        <button type="button" (click)="clearFilters()" class="btn-secondary">
          🧹 Limpiar Filtros
        </button>
      </div>

      <!-- Dashboard Data -->
      <div class="card" *ngIf="dashboardData()">
        <h3>📈 Dashboard Data</h3>
        <div class="metrics-grid">
          <div class="metric">
            <span class="metric-label">Total Pedidos:</span>
            <span class="metric-value">{{ dashboardData()!.totalPedidos }}</span>
          </div>
          <div class="metric">
            <span class="metric-label">Ingresos Totales:</span>
            <span class="metric-value"
              >\${{ dashboardData()!.ingresosTotales | number: '1.2-2' }}</span
            >
          </div>
          <div class="metric">
            <span class="metric-label">Usuarios Registrados:</span>
            <span class="metric-value">{{ dashboardData()!.usuariosRegistrados }}</span>
          </div>
          <div class="metric">
            <span class="metric-label">Valor Promedio Orden:</span>
            <span class="metric-value"
              >\${{ dashboardData()!.valorPromedioOrden | number: '1.2-2' }}</span
            >
          </div>
        </div>
      </div>

      <!-- Productos Populares (Endpoint Público) -->
      <div class="card">
        <h3>🌟 Productos Populares (Endpoint Público - Sin Auth)</h3>
        <button type="button" (click)="loadProductosPopulares()" class="btn-primary">
          Cargar Productos Populares
        </button>

        <div *ngIf="productosPopulares()" class="productos-grid">
          <div
            *ngFor="let producto of productosPopulares()!.productosPopulares"
            class="producto-card"
          >
            <img
              [src]="getSafeImageSrc(producto.imagen, producto.productoId)"
              [alt]="producto.nombreProducto"
              class="producto-image"
            />
            <h4>{{ producto.nombreProducto }}</h4>
            <p><strong>Cantidad Vendida:</strong> {{ producto.cantidadVendida }}</p>
            <p><strong>Precio:</strong> \${{ producto.precio | number }}</p>
            <p><strong>Ingresos:</strong> \${{ producto.ingresoTotal | number }}</p>
          </div>
        </div>
      </div>

      <!-- Filtros Aplicados -->
      <div class="card">
        <h3>🔍 Filtros Aplicados</h3>
        <pre>{{ currentFilters() | json }}</pre>
      </div>

      <!-- Estado de Carga -->
      <div *ngIf="isLoading()" class="card">
        <p>⏳ Cargando datos de telemetría...</p>
      </div>

      <!-- Errores -->
      <div *ngIf="error()" class="card error-card">
        <h3>❌ Error</h3>
        <p>{{ error() }}</p>
      </div>
    </div>
  `,
  styles: [
    `
      .filter-group {
        margin-bottom: 1rem;
        padding: 1rem;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
      }

      .filter-group h4 {
        margin-top: 0;
        color: #374151;
      }

      .filter-group input,
      .filter-group select {
        margin-right: 0.5rem;
        margin-bottom: 0.5rem;
        padding: 0.5rem;
        border: 1px solid #d1d5db;
        border-radius: 4px;
      }

      .metrics-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
        margin-top: 1rem;
      }

      .metric {
        display: flex;
        justify-content: space-between;
        padding: 0.75rem;
        background-color: #f9fafb;
        border-radius: 6px;
      }

      .metric-label {
        font-weight: 500;
        color: #6b7280;
      }

      .metric-value {
        font-weight: 700;
        color: #111827;
      }

      .productos-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1rem;
        margin-top: 1rem;
      }

      .producto-card {
        padding: 1rem;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        text-align: center;
      }

      .producto-image {
        width: 60px;
        height: 60px;
        object-fit: cover;
        border-radius: 4px;
        margin-bottom: 0.5rem;
      }

      .producto-card h4 {
        margin: 0.5rem 0;
        color: #374151;
      }

      .producto-card p {
        margin: 0.25rem 0;
        color: #6b7280;
        font-size: 0.875rem;
      }

      .btn-primary,
      .btn-secondary {
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 500;
        margin-right: 0.5rem;
      }

      .btn-primary {
        background-color: #3b82f6;
        color: white;
      }

      .btn-secondary {
        background-color: #6b7280;
        color: white;
      }

      .btn-primary:hover {
        background-color: #2563eb;
      }

      .btn-secondary:hover {
        background-color: #4b5563;
      }

      .error-card {
        background-color: #fef2f2;
        border-color: #fecaca;
        color: #dc2626;
      }

      pre {
        background-color: #f3f4f6;
        padding: 1rem;
        border-radius: 6px;
        overflow: auto;
        font-size: 0.875rem;
      }
    `,
  ],
})
export class TelemetryExampleComponent implements OnInit {
  // Signals para el estado de la UI
  selectedPeriod = signal<TimePeriod>('ultimo_mes');
  selectedMonth = signal<number | undefined>(undefined);
  selectedYear = signal<number | undefined>(undefined);
  startDate = signal<string>('');
  endDate = signal<string>('');
  startTime = signal<string>('');
  endTime = signal<string>('');

  // Signals para los datos
  dashboardData = signal<DashboardData | null>(null);
  productosPopulares = signal<ProductosPopularesData | null>(null);

  // Signals para el estado
  isLoading = signal(false);
  error = signal<string | null>(null);

  // Computed para los filtros actuales
  currentFilters = computed(() => {
    const filters: TelemetryParams = {};

    if (this.selectedPeriod()) filters.periodo = this.selectedPeriod();
    if (this.selectedMonth()) filters.mes = this.selectedMonth();
    if (this.selectedYear()) filters.año = this.selectedYear();
    if (this.startDate()) filters.fecha_inicio = this.startDate();
    if (this.endDate()) filters.fecha_fin = this.endDate();
    if (this.startTime()) filters.hora_inicio = this.startTime();
    if (this.endTime()) filters.hora_fin = this.endTime();

    return filters;
  });

  constructor(private telemetryService: TelemetryService) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  /**
   * Cargar datos del dashboard con filtros aplicados
   */
  loadDashboardData() {
    this.isLoading.set(true);
    this.error.set(null);

    const filters = this.currentFilters();

    this.telemetryService.getDashboard(filters).subscribe({
      next: (response) => {
        this.dashboardData.set(response.data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar datos del dashboard: ' + err.message);
        this.isLoading.set(false);
      },
    });
  }

  /**
   * Cargar productos populares (endpoint público)
   */
  loadProductosPopulares() {
    this.isLoading.set(true);
    this.error.set(null);

    const filters = this.currentFilters();

    // Este endpoint NO requiere autenticación 🌟
    this.telemetryService.getProductosPopulares(filters).subscribe({
      next: (response) => {
        this.productosPopulares.set(response.data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar productos populares: ' + err.message);
        this.isLoading.set(false);
      },
    });
  }

  /**
   * Obtiene una fuente de imagen segura que evita el error 431
   */
  getSafeImageSrc = getSafeImageSrc;

  /**
   * Limpiar todos los filtros
   */
  clearFilters() {
    this.selectedPeriod.set('ultimo_mes');
    this.selectedMonth.set(undefined);
    this.selectedYear.set(undefined);
    this.startDate.set('');
    this.endDate.set('');
    this.startTime.set('');
    this.endTime.set('');

    this.loadDashboardData();
  }

  /**
   * 🎯 Ejemplos de uso avanzado de filtros
   */
  ejemplosUsoAvanzado() {
    // Ejemplo 1: Filtros predefinidos simples
    this.telemetryService.getDashboard({ periodo: 'hoy' }).subscribe();

    // Ejemplo 2: Filtro por mes y año específico
    this.telemetryService.getSales({ mes: 1, año: 2024 }).subscribe();

    // Ejemplo 3: Rango de fechas personalizado
    this.telemetryService
      .getProducts({
        fecha_inicio: '2024-01-15',
        fecha_fin: '2024-02-15',
      })
      .subscribe();

    // Ejemplo 4: Filtros por horarios específicos (ej: horario de almuerzo)
    this.telemetryService
      .getTimeAnalysis({
        hora_inicio: '12:00:00',
        hora_fin: '14:00:00',
      })
      .subscribe();

    // Ejemplo 5: Combinación compleja de filtros
    this.telemetryService
      .getSegmentacion({
        mes: 12,
        año: 2023,
        hora_inicio: '18:00:00',
        hora_fin: '22:00:00',
        limit: 20,
      })
      .subscribe();

    // Ejemplo 6: Productos populares sin autenticación
    this.telemetryService
      .getProductosPopulares({
        periodo: 'ultima_semana',
        limit: 5,
      })
      .subscribe();
  }
}
