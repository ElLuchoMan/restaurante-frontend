import { TestBed } from '@angular/core/testing';
import { NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';

import { PerformanceService } from './performance.service';

class MockRouter {
  public events = new Subject<any>();
}

describe('PerformanceService', () => {
  let router: MockRouter;
  let svc: PerformanceService;
  const originalPO = (global as any).PerformanceObserver;
  const originalNow = global.performance.now;
  const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

  let observerCallback: (list: { getEntries: () => PerformanceEntry[] }) => void;

  class FakePerformanceObserver {
    constructor(cb: any) {
      observerCallback = cb;
    }
    observe() {}
    disconnect() {}
  }

  beforeEach(() => {
    (global as any).PerformanceObserver = FakePerformanceObserver as any;
    // Evita redefinir hostname; asumimos jsdom por defecto ya es localhost
    jest.spyOn(global.performance, 'now').mockReturnValue(0);
    router = new MockRouter();
    TestBed.configureTestingModule({ providers: [{ provide: Router, useValue: router }] });
    svc = TestBed.inject(PerformanceService);
  });

  afterEach(() => {
    (global as any).PerformanceObserver = originalPO;
    // no-op
    (global.performance.now as any) = originalNow;
    consoleSpy.mockClear();
  });

  function emitEntry(
    entry: Partial<PerformanceEntry> & { entryType: string; name?: string; [k: string]: any },
  ) {
    observerCallback({ getEntries: () => [entry as PerformanceEntry] });
  }

  it('registra Core Web Vitals y métricas de navegación', () => {
    emitEntry({ entryType: 'largest-contentful-paint', startTime: 1200, name: 'lcp' });
    emitEntry({ entryType: 'first-input', startTime: 50, processingStart: 120 });
    emitEntry({ entryType: 'layout-shift', value: 0.05, hadRecentInput: false });
    emitEntry({ entryType: 'paint', name: 'first-contentful-paint', startTime: 800 });
    emitEntry({
      entryType: 'navigation',
      responseStart: 200,
      requestStart: 100,
      domContentLoadedEventEnd: 900,
      fetchStart: 0,
      loadEventEnd: 1500,
    } as any);

    const vitals = svc.getCoreWebVitals();
    expect(vitals.lcp).toBe(1200);
    expect(vitals.fid).toBe(70);
    expect(vitals.cls).toBeDefined();

    const status = svc.getCoreWebVitalsStatus();
    expect(['good', 'needs-improvement', 'poor', 'unknown']).toContain(status.lcp);
  });

  it('no rompe cuando PerformanceObserver no está soportado', () => {
    (global as any).PerformanceObserver = undefined;
    router = new MockRouter();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [{ provide: Router, useValue: router }] });
    expect(() => TestBed.inject(PerformanceService)).not.toThrow();
  });

  it('avisa cuando PerformanceObserver lanza error al inicializar', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    class ThrowingObserver {
      constructor() {
        throw new Error('observer-error');
      }
      observe() {}
    }
    const localRouter = new MockRouter();
    (global as any).PerformanceObserver = ThrowingObserver as any;

    expect(() => new PerformanceService(localRouter as unknown as Router)).not.toThrow();
    expect(warnSpy).toHaveBeenCalledWith('Performance Observer not supported:', expect.any(Error));
    warnSpy.mockRestore();
  });

  it('getMetricStatus retorna needs-improvement y poor para umbrales', () => {
    // Fuerza métricas previas
    emitEntry({ entryType: 'largest-contentful-paint', startTime: 3000 });
    let status = svc.getCoreWebVitalsStatus();
    expect(status.lcp).toBe('needs-improvement');

    emitEntry({ entryType: 'largest-contentful-paint', startTime: 4500 });
    status = svc.getCoreWebVitalsStatus();
    expect(status.lcp).toBe('poor');
  });

  it('limita a 50 métricas y retorna unknown cuando no hay últimas métricas', () => {
    // clear y forzar 55 entradas distintas para probar recorte
    (svc as any).clearMetrics?.();
    for (let i = 0; i < 55; i++) {
      (svc as any).recordMetrics({ url: `/u${i}`, lcp: i });
    }
    const arr = svc.getMetrics();
    expect(arr.length).toBe(50);

    // Forzar sin métricas
    (svc as any).clearMetrics();
    expect(svc.getCoreWebVitals()).toEqual({});
    const status = svc.getCoreWebVitalsStatus();
    expect(status.lcp).toBe('unknown');
  });

  it('maneja estado unknown cuando no hay métricas', () => {
    const status = svc.getCoreWebVitalsStatus();
    expect(status.lcp).toBe('unknown');
    expect(status.fid).toBe('unknown');
    expect(status.cls).toBe('unknown');
  });

  it('registra cambios de ruta y permite limpiar métricas', () => {
    // navegar: start -> end
    (performance.now as jest.Mock).mockReturnValueOnce(1000); // start
    router.events.next({}); // cualquier evento para setear navigationStartTime

    (performance.now as jest.Mock).mockReturnValueOnce(1500); // end
    router.events.next(new NavigationEnd(1, '/from', '/to'));

    const byUrl = svc.getMetricsForUrl('/to');
    expect(byUrl?.routeChangeTime).toBe(500);

    expect(svc.getMetrics().length).toBeGreaterThan(0);
    svc.clearMetrics();
    expect(svc.getMetrics().length).toBe(0);
  });

  it('no registra métricas en consola cuando hostname no es localhost', () => {
    consoleSpy.mockClear();
    const originalLocation = window.location;
    Object.defineProperty(window, 'location', {
      value: { hostname: 'example.com' } as any,
      configurable: true,
    });

    try {
      (svc as any).recordMetrics({ url: '/externa', lcp: 10 });
      expect(consoleSpy).not.toHaveBeenCalled();
    } finally {
      Object.defineProperty(window, 'location', {
        value: originalLocation,
        configurable: true,
      });
    }
  });
});
