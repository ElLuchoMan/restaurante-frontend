import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { PerformanceService } from '../../../core/services/performance.service';
import { TelemetryService } from '../../../core/services/telemetry.service';
import {
  DashboardData,
  ProductsData,
  SalesData,
  TimeAnalysisData,
  TimePeriod,
  UsersData,
} from '../../../shared/models/telemetry.model';

@Component({
  selector: 'app-telemetry-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './telemetry-dashboard.component.html',
  styleUrls: ['./telemetry-dashboard.component.scss'],
})
export class TelemetryDashboardComponent {
  // Signals para estado de la UI
  activeTab = signal<string>('dashboard');
  selectedPeriod = signal<TimePeriod>('ultimo_mes');
  isLoading = signal(false);
  error = signal<string | null>(null);

  // Signals para datos del backend
  dashboardData = signal<DashboardData | null>(null);
  salesData = signal<SalesData | null>(null);
  productsData = signal<ProductsData | null>(null);
  usersData = signal<UsersData | null>(null);
  timeData = signal<TimeAnalysisData | null>(null);

  // Signals para telemetría local
  private localRefreshTick = signal(0);
  localMetrics = computed(() => {
    this.localRefreshTick();
    return this.telemetry.getAggregatedMetrics();
  });
  localEvents = computed(() => {
    this.localRefreshTick();
    return this.telemetry.getEvents(200);
  });

  constructor(
    private telemetry: TelemetryService,
    private performance: PerformanceService,
  ) {
    // Cargar datos iniciales
    this.loadDashboardData();
  }

  setActiveTab(tab: string): void {
    this.activeTab.set(tab);
    this.loadTabData();
  }

  onPeriodChange(): void {
    this.loadTabData();
  }

  refreshAll(): void {
    this.loadTabData();
    this.refreshLocal();
  }

  refreshLocal(): void {
    this.localRefreshTick.update((v) => v + 1);
  }

  clearLocal(): void {
    this.telemetry.clear();
    this.refreshLocal();
  }

  getCoreWebVitals() {
    return this.performance.getCoreWebVitals();
  }

  getCoreWebVitalsStatus() {
    return this.performance.getCoreWebVitalsStatus();
  }

  formatEventTimestamp(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleString('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  getEventTypeClass(type: string): string {
    switch (type) {
      case 'login_success':
        return 'bg-success';
      case 'login_failure':
        return 'bg-danger';
      case 'login_attempt':
        return 'bg-info';
      case 'purchase':
        return 'bg-primary';
      case 'http_request':
        return 'bg-secondary';
      case 'error':
        return 'bg-warning';
      default:
        return 'bg-light text-dark';
    }
  }

  trackByEventId(index: number, event: any): string {
    return event.id;
  }

  getStatusClass(status: number): string {
    if (status >= 200 && status < 300) return 'status-success';
    if (status >= 300 && status < 400) return 'status-redirect';
    if (status >= 400 && status < 500) return 'status-client-error';
    if (status >= 500) return 'status-server-error';
    return '';
  }

  getDurationClass(duration: number): string {
    if (duration < 100) return 'duration-fast';
    if (duration < 500) return 'duration-medium';
    if (duration < 1000) return 'duration-slow';
    return 'duration-very-slow';
  }

  private loadTabData(): void {
    const currentTab = this.activeTab();
    const params = { periodo: this.selectedPeriod() };

    switch (currentTab) {
      case 'dashboard':
        this.loadDashboardData();
        break;
      case 'sales':
        this.loadSalesData(params);
        break;
      case 'products':
        this.loadProductsData(params);
        break;
      case 'users':
        this.loadUsersData(params);
        break;
      case 'time':
        this.loadTimeData(params);
        break;
      case 'local':
        this.refreshLocal();
        break;
    }
  }

  private loadDashboardData(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.telemetry.getDashboard({ periodo: this.selectedPeriod() }).subscribe({
      next: (response) => {
        this.dashboardData.set(response.data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(
          'Error al cargar datos del dashboard: ' + (err.message || 'Error desconocido'),
        );
        this.isLoading.set(false);
      },
    });
  }

  private loadSalesData(params: { periodo: TimePeriod }): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.telemetry.getSales(params).subscribe({
      next: (response) => {
        this.salesData.set(response.data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar datos de ventas: ' + (err.message || 'Error desconocido'));
        this.isLoading.set(false);
      },
    });
  }

  private loadProductsData(params: { periodo: TimePeriod }): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.telemetry.getProducts(params).subscribe({
      next: (response) => {
        console.log('Products response', response.data);
        this.productsData.set(response.data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(
          'Error al cargar datos de productos: ' + (err.message || 'Error desconocido'),
        );
        this.isLoading.set(false);
      },
    });
  }

  private loadUsersData(params: { periodo: TimePeriod }): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.telemetry.getUsers(params).subscribe({
      next: (response) => {
        this.usersData.set(response.data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(
          'Error al cargar datos de usuarios: ' + (err.message || 'Error desconocido'),
        );
        this.isLoading.set(false);
      },
    });
  }

  private loadTimeData(params: { periodo: TimePeriod }): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.telemetry.getTimeAnalysis(params).subscribe({
      next: (response) => {
        console.log('Time response', response.data);
        this.timeData.set(response.data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(
          'Error al cargar análisis temporal: ' + (err.message || 'Error desconocido'),
        );
        this.isLoading.set(false);
      },
    });
  }
}
