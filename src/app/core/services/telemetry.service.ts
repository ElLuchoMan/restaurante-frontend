import { Injectable } from '@angular/core';

export type TelemetryEventType =
  | 'login_attempt'
  | 'login_success'
  | 'login_failure'
  | 'purchase_completed'
  | 'http_request'
  | 'error';

export interface TelemetryBaseEvent {
  id: string;
  type: TelemetryEventType;
  timestamp: number; // epoch ms
}

export interface LoginEvent extends TelemetryBaseEvent {
  type: 'login_attempt' | 'login_success' | 'login_failure';
  userId?: number | null;
}

export interface PurchaseItemSnapshot {
  productId: number;
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface PurchaseEvent extends TelemetryBaseEvent {
  type: 'purchase_completed';
  userId: number | null;
  paymentMethodId: number;
  paymentMethodLabel: string;
  requiresDelivery: boolean;
  items: PurchaseItemSnapshot[];
  subtotal: number;
}

export interface HttpEvent extends TelemetryBaseEvent {
  type: 'http_request';
  method: string;
  url: string;
  ok: boolean;
  status: number;
  durationMs?: number;
  requestId?: string;
}

export interface ErrorEvent extends TelemetryBaseEvent {
  type: 'error';
  message: string;
  stack?: string;
  handled: boolean;
  requestId?: string;
}

export type TelemetryEvent = LoginEvent | PurchaseEvent | HttpEvent | ErrorEvent;

export interface AggregatedMetrics {
  login: {
    attempts: number;
    successes: number;
    failures: number;
  };
  purchasesByPaymentMethod: Record<string, number>; // label -> count
  productsCount: Record<string, number>; // name -> totalQuantity
  usersByPurchases: Record<string, number>; // userId -> count
  salesByHour: Record<string, number>; // "0".."23"
  salesByWeekday: Record<string, number>; // 0..6 (0 Domingo)
}

@Injectable({ providedIn: 'root' })
export class TelemetryService {
  private readonly storageKey = 'app_telemetry_events';
  private readonly maxEvents = 5000;

  logEvent(event: TelemetryEvent): void {
    const events = this.readAll();
    events.push({ ...event, id: event.id ?? self.crypto?.randomUUID?.() ?? this.uid() });
    // recortar si excede
    if (events.length > this.maxEvents) {
      const overflow = events.length - this.maxEvents;
      events.splice(0, overflow);
    }
    this.writeAll(events);
  }

  logLoginAttempt(userId?: number | null): void {
    this.logEvent({
      id: this.uid(),
      type: 'login_attempt',
      timestamp: Date.now(),
      userId: userId ?? null,
    });
  }

  logLoginSuccess(userId?: number | null): void {
    this.logEvent({
      id: this.uid(),
      type: 'login_success',
      timestamp: Date.now(),
      userId: userId ?? null,
    });
  }

  logLoginFailure(userId?: number | null): void {
    this.logEvent({
      id: this.uid(),
      type: 'login_failure',
      timestamp: Date.now(),
      userId: userId ?? null,
    });
  }

  logPurchase(payload: Omit<PurchaseEvent, 'id' | 'type' | 'timestamp'>): void {
    const evt: PurchaseEvent = {
      id: this.uid(),
      type: 'purchase_completed',
      timestamp: Date.now(),
      ...payload,
    };
    this.logEvent(evt);
  }

  logHttp(data: Omit<HttpEvent, 'id' | 'type' | 'timestamp'>): void {
    this.logEvent({ id: this.uid(), type: 'http_request', timestamp: Date.now(), ...data });
  }

  logError(message: string, stack?: string, handled = true, requestId?: string): void {
    this.logEvent({
      id: this.uid(),
      type: 'error',
      timestamp: Date.now(),
      message,
      stack,
      handled,
      requestId,
    });
  }

  getEvents(limit?: number): TelemetryEvent[] {
    const events = this.readAll();
    if (!limit || limit >= events.length) return events;
    return events.slice(events.length - limit);
  }

  clear(): void {
    try {
      localStorage.removeItem(this.storageKey);
    } catch {
      // ignore
    }
  }

  getAggregatedMetrics(): AggregatedMetrics {
    const events = this.readAll();
    const agg: AggregatedMetrics = {
      login: { attempts: 0, successes: 0, failures: 0 },
      purchasesByPaymentMethod: {},
      productsCount: {},
      usersByPurchases: {},
      salesByHour: {},
      salesByWeekday: {},
    };

    for (const evt of events) {
      if (evt.type === 'login_attempt') agg.login.attempts += 1;
      if (evt.type === 'login_success') agg.login.successes += 1;
      if (evt.type === 'login_failure') agg.login.failures += 1;

      if (evt.type === 'purchase_completed') {
        const hour = new Date(evt.timestamp).getHours().toString();
        const weekday = new Date(evt.timestamp).getDay().toString();
        agg.salesByHour[hour] = (agg.salesByHour[hour] ?? 0) + 1;
        agg.salesByWeekday[weekday] = (agg.salesByWeekday[weekday] ?? 0) + 1;

        const label = evt.paymentMethodLabel || String(evt.paymentMethodId);
        agg.purchasesByPaymentMethod[label] = (agg.purchasesByPaymentMethod[label] ?? 0) + 1;

        const userKey = String(evt.userId ?? 'anon');
        agg.usersByPurchases[userKey] = (agg.usersByPurchases[userKey] ?? 0) + 1;

        for (const item of evt.items) {
          const key = item.name || String(item.productId);
          agg.productsCount[key] = (agg.productsCount[key] ?? 0) + item.quantity;
        }
      }
    }

    return agg;
  }

  private readAll(): TelemetryEvent[] {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as TelemetryEvent[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private writeAll(events: TelemetryEvent[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(events));
    } catch {
      // ignore write failures
    }
  }

  private uid(): string {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }
}
