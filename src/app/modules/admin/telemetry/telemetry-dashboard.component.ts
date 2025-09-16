import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';

import { PerformanceService } from '../../../core/services/performance.service';
import { TelemetryService } from '../../../core/services/telemetry.service';

@Component({
  selector: 'app-telemetry-dashboard',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container mt-3">
      <h2>Telemetría (local)</h2>
      <div class="mb-3">
        <button class="btn btn-sm btn-primary me-2" (click)="refresh()">Refrescar</button>
        <button class="btn btn-sm btn-outline-danger" (click)="clear()">Limpiar eventos</button>
      </div>

      <div class="row g-3">
        <div class="col-md-4">
          <div class="card h-100">
            <div class="card-body">
              <h5 class="card-title">Inicios de sesión</h5>
              <p class="mb-1">Intentos: {{ metrics().login.attempts }}</p>
              <p class="mb-1 text-success">Éxitos: {{ metrics().login.successes }}</p>
              <p class="mb-0 text-danger">Fallos: {{ metrics().login.failures }}</p>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card h-100">
            <div class="card-body">
              <h5 class="card-title">Compras por método de pago</h5>
              <ul class="mb-0">
                <li *ngFor="let kv of metrics().purchasesByPaymentMethod | keyvalue">
                  {{ kv.key }}: {{ kv.value }}
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card h-100">
            <div class="card-body">
              <h5 class="card-title">Productos más/menos pedidos</h5>
              <ul class="mb-0">
                <li *ngFor="let kv of metrics().productsCount | keyvalue">
                  {{ kv.key }}: {{ kv.value }} uds
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div class="row g-3 mt-1">
        <div class="col-md-4">
          <div class="card h-100">
            <div class="card-body">
              <h5 class="card-title">Core Web Vitals</h5>
              <div class="vitals-grid">
                <div class="vital-item">
                  <span class="vital-label">LCP:</span>
                  <span class="vital-value" [class]="'vital-' + getCoreWebVitalsStatus().lcp">
                    {{
                      getCoreWebVitals().lcp
                        ? (getCoreWebVitals().lcp! / 1000).toFixed(2) + 's'
                        : 'N/A'
                    }}
                  </span>
                </div>
                <div class="vital-item">
                  <span class="vital-label">FID:</span>
                  <span class="vital-value" [class]="'vital-' + getCoreWebVitalsStatus().fid">
                    {{ getCoreWebVitals().fid ? getCoreWebVitals().fid!.toFixed(0) + 'ms' : 'N/A' }}
                  </span>
                </div>
                <div class="vital-item">
                  <span class="vital-label">CLS:</span>
                  <span class="vital-value" [class]="'vital-' + getCoreWebVitalsStatus().cls">
                    {{ getCoreWebVitals().cls ? getCoreWebVitals().cls!.toFixed(3) : 'N/A' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card h-100">
            <div class="card-body">
              <h5 class="card-title">Usuarios por número de compras</h5>
              <ul class="mb-0">
                <li *ngFor="let kv of metrics().usersByPurchases | keyvalue">
                  {{ kv.key }}: {{ kv.value }} compras
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card h-100">
            <div class="card-body">
              <h5 class="card-title">Ventas por hora y día</h5>
              <div class="row">
                <div class="col-6">
                  <h6>Por hora</h6>
                  <ul>
                    <li *ngFor="let kv of metrics().salesByHour | keyvalue">
                      {{ kv.key }}:00 → {{ kv.value }}
                    </li>
                  </ul>
                </div>
                <div class="col-6">
                  <h6>Por día (0=Dom)</h6>
                  <ul>
                    <li *ngFor="let kv of metrics().salesByWeekday | keyvalue">
                      {{ kv.key }}: {{ kv.value }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card mt-3">
        <div class="card-body">
          <h5 class="card-title">Eventos recientes</h5>
          <pre class="small" style="max-height: 300px; overflow: auto">{{ events() | json }}</pre>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .card-title {
        font-weight: 600;
      }
      ul {
        padding-left: 1.25rem;
      }
      .vitals-grid {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }
      .vital-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .vital-label {
        font-weight: 500;
        color: #6c757d;
      }
      .vital-value {
        font-weight: 600;
        padding: 0.25rem 0.5rem;
        border-radius: 0.25rem;
        font-size: 0.875rem;
      }
      .vital-good {
        background-color: #d4edda;
        color: #155724;
      }
      .vital-needs-improvement {
        background-color: #fff3cd;
        color: #856404;
      }
      .vital-poor {
        background-color: #f8d7da;
        color: #721c24;
      }
      .vital-unknown {
        background-color: #e2e3e5;
        color: #6c757d;
      }
    `,
  ],
})
export class TelemetryDashboardComponent {
  private refreshTick = signal(0);
  metrics = computed(() => {
    this.refreshTick();
    return this.telemetry.getAggregatedMetrics();
  });
  events = computed(() => {
    this.refreshTick();
    return this.telemetry.getEvents(200);
  });

  constructor(
    private telemetry: TelemetryService,
    private performance: PerformanceService,
  ) {}

  refresh(): void {
    this.refreshTick.update((v) => v + 1);
  }

  clear(): void {
    this.telemetry.clear();
    this.refresh();
  }

  getCoreWebVitals() {
    return this.performance.getCoreWebVitals();
  }

  getCoreWebVitalsStatus() {
    return this.performance.getCoreWebVitalsStatus();
  }
}
