import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/models/api-response.model';
import {
  DashboardData,
  SalesData,
  ProductsData,
  UsersData,
  TimeAnalysisData,
  RentabilidadData,
  SegmentacionData,
  EficienciaData,
  ReservasAnalisisData,
  PedidosAnalisisData,
  TelemetryParams,
} from '../../shared/models/telemetry.model';
import { HandleErrorService } from './handle-error.service';

// Interfaces para logging local
export interface TelemetryEvent {
  id: string;
  type: 'login_attempt' | 'login_success' | 'login_failure' | 'purchase' | 'http_request' | 'error';
  timestamp: number;
  userId?: number | null;
  message?: string;
  stack?: string;
  handled?: boolean;
  requestId?: string;
  method?: string;
  url?: string;
  ok?: boolean;
  status?: number;
  durationMs?: number;
  paymentMethodId?: number;
  paymentMethodLabel?: string;
  requiresDelivery?: boolean;
  items?: PurchaseItem[];
  subtotal?: number;
}

export interface PurchaseItem {
  productId: number;
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface PurchaseData {
  userId: number | null;
  paymentMethodId: number;
  paymentMethodLabel: string;
  requiresDelivery: boolean;
  items: PurchaseItem[];
  subtotal: number;
}

export interface AggregatedMetrics {
  login: {
    attempts: number;
    successes: number;
    failures: number;
  };
  purchasesByPaymentMethod: Record<string, number>;
  productsCount: Record<string, number>;
  usersByPurchases: Record<string, number>;
  salesByHour: Record<string, number>;
  salesByWeekday: Record<string, number>;
}

@Injectable({
  providedIn: 'root',
})
export class TelemetryService {
  private baseUrl = `${environment.apiUrl}/telemetria`;

  // Propiedades para logging local
  private readonly storageKey = 'app_telemetry_events';
  private readonly maxEvents = 1000;

  constructor(
    private http: HttpClient,
    private handleError: HandleErrorService,
  ) {}

  /**
   * Construye los parámetros HTTP para las peticiones
   */
  private buildParams(params?: TelemetryParams): HttpParams {
    let httpParams = new HttpParams();

    if (params?.periodo) {
      httpParams = httpParams.set('periodo', params.periodo);
    }

    if (params?.limit) {
      httpParams = httpParams.set('limit', params.limit.toString());
    }

    return httpParams;
  }

  /**
   * Obtiene el dashboard general con métricas principales
   */
  getDashboard(params?: TelemetryParams): Observable<ApiResponse<DashboardData>> {
    const httpParams = this.buildParams(params);
    return this.http
      .get<ApiResponse<DashboardData>>(`${this.baseUrl}/dashboard`, { params: httpParams })
      .pipe(catchError(this.handleError.handleError));
  }

  /**
   * Obtiene análisis de ventas por método de pago y tendencias
   */
  getSales(params?: TelemetryParams): Observable<ApiResponse<SalesData>> {
    const httpParams = this.buildParams(params);
    return this.http
      .get<ApiResponse<SalesData>>(`${this.baseUrl}/sales`, { params: httpParams })
      .pipe(catchError(this.handleError.handleError));
  }

  /**
   * Obtiene análisis de productos más y menos vendidos
   */
  getProducts(params?: TelemetryParams): Observable<ApiResponse<ProductsData>> {
    const httpParams = this.buildParams(params);
    return this.http
      .get<ApiResponse<ProductsData>>(`${this.baseUrl}/products`, { params: httpParams })
      .pipe(catchError(this.handleError.handleError));
  }

  /**
   * Obtiene análisis de usuarios frecuentes e inactivos
   */
  getUsers(params?: TelemetryParams): Observable<ApiResponse<UsersData>> {
    const httpParams = this.buildParams(params);
    return this.http
      .get<ApiResponse<UsersData>>(`${this.baseUrl}/users`, { params: httpParams })
      .pipe(catchError(this.handleError.handleError));
  }

  /**
   * Obtiene análisis temporal por horas, días y meses
   */
  getTimeAnalysis(params?: TelemetryParams): Observable<ApiResponse<TimeAnalysisData>> {
    const httpParams = this.buildParams(params);
    return this.http
      .get<ApiResponse<TimeAnalysisData>>(`${this.baseUrl}/time-analysis`, { params: httpParams })
      .pipe(catchError(this.handleError.handleError));
  }

  /**
   * Obtiene análisis de rentabilidad por productos
   */
  getRentabilidad(params?: TelemetryParams): Observable<ApiResponse<RentabilidadData>> {
    const httpParams = this.buildParams(params);
    return this.http
      .get<ApiResponse<RentabilidadData>>(`${this.baseUrl}/rentabilidad`, { params: httpParams })
      .pipe(catchError(this.handleError.handleError));
  }

  /**
   * Obtiene segmentación de clientes (VIP, regulares, nuevos)
   */
  getSegmentacion(params?: TelemetryParams): Observable<ApiResponse<SegmentacionData>> {
    const httpParams = this.buildParams(params);
    return this.http
      .get<ApiResponse<SegmentacionData>>(`${this.baseUrl}/segmentacion`, { params: httpParams })
      .pipe(catchError(this.handleError.handleError));
  }

  /**
   * Obtiene análisis de eficiencia y tiempos de entrega
   */
  getEficiencia(params?: TelemetryParams): Observable<ApiResponse<EficienciaData>> {
    const httpParams = this.buildParams(params);
    return this.http
      .get<ApiResponse<EficienciaData>>(`${this.baseUrl}/eficiencia`, { params: httpParams })
      .pipe(catchError(this.handleError.handleError));
  }

  /**
   * Obtiene análisis de reservas por tiempo
   */
  getReservasAnalisis(params?: TelemetryParams): Observable<ApiResponse<ReservasAnalisisData>> {
    const httpParams = this.buildParams(params);
    return this.http
      .get<
        ApiResponse<ReservasAnalisisData>
      >(`${this.baseUrl}/reservas-analisis`, { params: httpParams })
      .pipe(catchError(this.handleError.handleError));
  }

  /**
   * Obtiene análisis de pedidos completados por tiempo
   */
  getPedidosAnalisis(params?: TelemetryParams): Observable<ApiResponse<PedidosAnalisisData>> {
    const httpParams = this.buildParams(params);
    return this.http
      .get<
        ApiResponse<PedidosAnalisisData>
      >(`${this.baseUrl}/pedidos-analisis`, { params: httpParams })
      .pipe(catchError(this.handleError.handleError));
  }

  // ========================================
  // MÉTODOS DE LOGGING LOCAL
  // ========================================

  /**
   * Registra un evento genérico de telemetría local
   */
  logEvent(event: Partial<TelemetryEvent>): void {
    const fullEvent: TelemetryEvent = {
      id: event.id || this.generateId(),
      type: event.type!,
      timestamp: event.timestamp || Date.now(),
      ...event,
    };

    const events = this.readAll();
    events.push(fullEvent);

    // Mantener solo los últimos maxEvents
    if (events.length > this.maxEvents) {
      events.splice(0, events.length - this.maxEvents);
    }

    this.writeAll(events);
  }

  /**
   * Registra un intento de login
   */
  logLoginAttempt(userId?: number): void {
    this.logEvent({
      type: 'login_attempt',
      userId: userId ?? null,
    });
  }

  /**
   * Registra un login exitoso
   */
  logLoginSuccess(userId?: number | null): void {
    this.logEvent({
      type: 'login_success',
      userId: userId ?? null,
    });
  }

  /**
   * Registra un login fallido
   */
  logLoginFailure(userId?: number): void {
    this.logEvent({
      type: 'login_failure',
      userId: userId ?? null,
    });
  }

  /**
   * Registra una compra
   */
  logPurchase(data: PurchaseData): void {
    this.logEvent({
      type: 'purchase',
      userId: data.userId,
      paymentMethodId: data.paymentMethodId,
      paymentMethodLabel: data.paymentMethodLabel,
      requiresDelivery: data.requiresDelivery,
      items: data.items,
      subtotal: data.subtotal,
    });
  }

  /**
   * Registra una petición HTTP
   */
  logHttp(data: {
    method: string;
    url: string;
    ok: boolean;
    status: number;
    durationMs?: number;
    requestId?: string;
  }): void {
    this.logEvent({
      type: 'http_request',
      method: data.method,
      url: data.url,
      ok: data.ok,
      status: data.status,
      durationMs: data.durationMs,
      requestId: data.requestId,
    });
  }

  /**
   * Registra un error
   */
  logError(message: string, stack?: string, handled = true, requestId?: string): void {
    this.logEvent({
      type: 'error',
      message,
      stack,
      handled,
      requestId,
    });
  }

  /**
   * Obtiene todos los eventos de telemetría local
   */
  getEvents(limit?: number): TelemetryEvent[] {
    const events = this.readAll();
    return limit ? events.slice(-limit) : events;
  }

  /**
   * Obtiene métricas agregadas de los eventos locales
   */
  getAggregatedMetrics(): AggregatedMetrics {
    const events = this.readAll();
    const metrics: AggregatedMetrics = {
      login: { attempts: 0, successes: 0, failures: 0 },
      purchasesByPaymentMethod: {},
      productsCount: {},
      usersByPurchases: {},
      salesByHour: {},
      salesByWeekday: {},
    };

    events.forEach((event) => {
      switch (event.type) {
        case 'login_attempt':
          metrics.login.attempts++;
          break;
        case 'login_success':
          metrics.login.successes++;
          break;
        case 'login_failure':
          metrics.login.failures++;
          break;
        case 'purchase':
          if (event.paymentMethodLabel) {
            const method = event.paymentMethodLabel || String(event.paymentMethodId);
            metrics.purchasesByPaymentMethod[method] =
              (metrics.purchasesByPaymentMethod[method] || 0) + 1;
          }

          if (event.items) {
            event.items.forEach((item) => {
              const productKey = item.name || String(item.productId);
              metrics.productsCount[productKey] =
                (metrics.productsCount[productKey] || 0) + item.quantity;
            });
          }

          if (event.userId) {
            const userKey = String(event.userId);
            metrics.usersByPurchases[userKey] = (metrics.usersByPurchases[userKey] || 0) + 1;
          }

          // Análisis temporal
          const date = new Date(event.timestamp);
          const hour = String(date.getHours());
          const weekday = date.toLocaleDateString('es-ES', { weekday: 'long' });

          metrics.salesByHour[hour] = (metrics.salesByHour[hour] || 0) + (event.subtotal || 0);
          metrics.salesByWeekday[weekday] =
            (metrics.salesByWeekday[weekday] || 0) + (event.subtotal || 0);
          break;
      }
    });

    return metrics;
  }

  /**
   * Limpia todos los eventos de telemetría local
   */
  clear(): void {
    try {
      localStorage.removeItem(this.storageKey);
    } catch {
      // Ignorar errores de localStorage
    }
  }

  // ========================================
  // MÉTODOS PRIVADOS PARA LOGGING LOCAL
  // ========================================

  /**
   * Lee todos los eventos del localStorage
   */
  private readAll(): TelemetryEvent[] {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) return [];

      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  /**
   * Escribe todos los eventos al localStorage
   */
  private writeAll(events: TelemetryEvent[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(events));
    } catch {
      // Ignorar errores de localStorage
    }
  }

  /**
   * Genera un ID único para los eventos
   */
  private generateId(): string {
    if (typeof self !== 'undefined' && self.crypto?.randomUUID) {
      return self.crypto.randomUUID();
    }
    return this.uid();
  }

  /**
   * Genera un ID único fallback
   */
  private uid(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}
