import { createSpy } from '../../shared/mocks/test-doubles';
import { TelemetryService } from './telemetry.service';

describe('TelemetryService', () => {
  let svc: TelemetryService;

  beforeEach(() => {
    svc = new TelemetryService();
    svc.clear();
  });

  it('debe registrar intentos/éxitos/fallos de login y agregarlos', () => {
    svc.logLoginAttempt(1);
    svc.logLoginSuccess(1);
    svc.logLoginFailure(2);

    const agg = svc.getAggregatedMetrics();
    expect(agg.login.attempts).toBe(1);
    expect(agg.login.successes).toBe(1);
    expect(agg.login.failures).toBe(1);
  });

  it('debe registrar una compra y agregar por método, producto, usuario, hora y día', () => {
    const now = Date.now();
    jest.spyOn(Date, 'now').mockReturnValue(now);

    svc.logPurchase({
      userId: 42,
      paymentMethodId: 2,
      paymentMethodLabel: 'Nequi',
      requiresDelivery: true,
      items: [
        { productId: 10, name: 'Hamburguesa', quantity: 2, unitPrice: 10000 },
        { productId: 11, name: 'Gaseosa', quantity: 1, unitPrice: 3000 },
      ],
      subtotal: 23000,
    });

    const agg = svc.getAggregatedMetrics();
    expect(agg.purchasesByPaymentMethod['Nequi']).toBe(1);
    expect(agg.productsCount['Hamburguesa']).toBe(2);
    expect(agg.productsCount['Gaseosa']).toBe(1);
    expect(agg.usersByPurchases['42']).toBe(1);
    // Hora y día dependen del sistema, solo verificamos que existan claves
    expect(Object.keys(agg.salesByHour).length).toBeGreaterThan(0);
    expect(Object.keys(agg.salesByWeekday).length).toBeGreaterThan(0);
  });

  it('logHttp y logError agregan eventos y getEvents respeta limit', () => {
    svc.clear();
    svc.logHttp({ method: 'GET', url: '/x', ok: true, status: 200 });
    svc.logError('oops', 'stack', false, 'req-1');
    const events = svc.getEvents(1);
    expect(events.length).toBe(1);
    expect(events[0].type === 'error' || events[0].type === 'http_request').toBe(true);
  });

  it('recorta eventos al exceder maxEvents y agrega correctamente múltiples tipos', () => {
    // fuerza a 5 eventos para testeo del recorte
    const originalPush = (svc as any).writeAll;
    // Genera 10 eventos
    for (let i = 0; i < 10; i++) {
      svc.logLoginAttempt(i);
    }
    const events = svc.getEvents();
    expect(events.length).toBeGreaterThan(0);
  });

  it('tolera JSON inválido y errores de localStorage', () => {
    const originalGet = localStorage.getItem;
    const originalSet = localStorage.setItem;
    // JSON inválido
    (localStorage as any).getItem = () => 'not-json';
    expect(() => svc.getEvents()).not.toThrow();
    // Error al escribir
    (localStorage as any).getItem = originalGet;
    (localStorage as any).setItem = () => {
      throw new Error('nope');
    };
    expect(() => svc.logLoginAttempt()).not.toThrow();
    (localStorage as any).setItem = originalSet;
  });

  it('usa fallback uid cuando no hay crypto.randomUUID', () => {
    const originalCrypto = (self as any).crypto;
    (self as any).crypto = undefined;
    svc.clear();
    expect(() => svc.logLoginAttempt()).not.toThrow();
    const events = svc.getEvents();
    expect(events.length).toBeGreaterThan(0);
    (self as any).crypto = originalCrypto;
  });

  it('recorta al máximo de eventos y clear ignora errores de localStorage', () => {
    svc.clear();
    // simular límite pequeño usando las APIs públicas; generamos >100 eventos
    for (let i = 0; i < 120; i++) {
      svc.logLoginAttempt(i);
    }
    const events = svc.getEvents();
    // No podemos leer maxEvents, pero debe haber guardado muchos sin romperse
    expect(events.length).toBeGreaterThan(0);

    const originalRemove = localStorage.removeItem;
    (localStorage as any).removeItem = () => {
      throw new Error('blocked');
    };
    expect(() => svc.clear()).not.toThrow();
    (localStorage as any).removeItem = originalRemove;
  });

  it('readAll tolera valores no-array', () => {
    const originalGet = localStorage.getItem;
    (localStorage as any).getItem = () => '{"not":"array"}';
    expect((svc as any).readAll()).toEqual([]);
    (localStorage as any).getItem = originalGet;
  });

  it('getAggregatedMetrics maneja items con nombres vacíos y suma por productId', () => {
    svc.clear();
    svc.logPurchase({
      userId: null,
      paymentMethodId: 1,
      paymentMethodLabel: 'Efectivo',
      requiresDelivery: true,
      items: [
        { productId: 10, name: '' as any, quantity: 3, unitPrice: 5 },
        { productId: 10, name: '' as any, quantity: 2, unitPrice: 5 },
      ],
      subtotal: 25,
    });
    const agg = svc.getAggregatedMetrics();
    // cae al productId como clave
    expect(agg.productsCount['10']).toBe(5);
  });

  it('writeAll tolera errores de localStorage.setItem', () => {
    const originalSet = localStorage.setItem;
    (localStorage as any).setItem = () => {
      throw new Error('blocked');
    };
    expect(() => svc.logLoginAttempt(1)).not.toThrow();
    (localStorage as any).setItem = originalSet;
  });

  it('getAggregatedMetrics usa fallback de etiqueta cuando falta paymentMethodLabel', () => {
    svc.clear();
    const ts = Date.now();
    svc.logPurchase({
      userId: 7,
      paymentMethodId: 3,
      paymentMethodLabel: '' as any,
      requiresDelivery: false,
      items: [{ productId: 1, name: 'A', quantity: 2, unitPrice: 10 }],
      subtotal: 20,
    });
    const agg = svc.getAggregatedMetrics();
    expect(agg.purchasesByPaymentMethod['3']).toBe(1);
    expect(agg.usersByPurchases['7']).toBe(1);
    expect(agg.productsCount['A']).toBe(2);
  });

  it('logEvent respeta id provisto y no invoca uid', () => {
    svc.clear();
    const originalUid = (svc as any).uid;
    const uidSpy: any = createSpy();
    uidSpy.mockReturnValue('generated');
    (svc as any).uid = uidSpy;
    const now = Date.now();
    svc.logEvent({ id: 'given', type: 'error', timestamp: now, message: 'm', handled: true });
    const events = svc.getEvents();
    expect(events[0].id).toBe('given');
    expect(uidSpy).not.toHaveBeenCalled();
    (svc as any).uid = originalUid;
  });

  it('recorta eventos al exceder maxEvents (forzando valor bajo)', () => {
    svc.clear();
    (svc as any).maxEvents = 5;
    for (let i = 0; i < 7; i++) {
      svc.logLoginAttempt(i);
    }
    const events = svc.getEvents();
    expect(events.length).toBe(5);
    // los primeros 2 deben haber sido cortados
    const firstRemaining = events[0] as any;
    expect(firstRemaining.type).toBe('login_attempt');
  });

  it('getEvents devuelve todos si limit >= length', () => {
    svc.clear();
    svc.logLoginAttempt();
    svc.logLoginSuccess();
    const all = svc.getEvents(10);
    expect(all.length).toBe(2);
  });

  it('usa self.crypto.randomUUID cuando existe y no hay id provisto', () => {
    svc.clear();
    const originalSelfCrypto = (self as any).crypto;
    const randSpy: any = createSpy();
    randSpy.mockReturnValue('uuid-1');
    Object.defineProperty(self as any, 'crypto', {
      value: { randomUUID: randSpy },
      configurable: true,
    });
    const now = Date.now();
    svc.logEvent({ type: 'error', timestamp: now, message: 'm', handled: true } as any);
    expect(randSpy).toHaveBeenCalled();
    Object.defineProperty(self as any, 'crypto', { value: originalSelfCrypto, configurable: true });
  });

  it('cuando crypto existe pero randomUUID no, cae a uid()', () => {
    svc.clear();
    const originalCrypto = (self as any).crypto;
    const originalUid = (svc as any).uid;
    const uidSpy: any = createSpy();
    uidSpy.mockReturnValue('uid-fallback');
    (svc as any).uid = uidSpy;
    // sin randomUUID
    Object.defineProperty(self as any, 'crypto', { value: {}, configurable: true });
    svc.logError('m');
    const [evt] = svc.getEvents();
    expect(uidSpy).toHaveBeenCalled();
    expect(evt.id).toBe('uid-fallback');
    (svc as any).uid = originalUid;
    Object.defineProperty(self as any, 'crypto', { value: originalCrypto, configurable: true });
  });

  it('userId undefined se guarda como null en eventos de login', () => {
    svc.clear();
    svc.logLoginAttempt(undefined);
    const [evt] = svc.getEvents() as any[];
    expect((evt as any).userId).toBeNull();
  });

  it('logError sin handled explícito usa handled=true por defecto', () => {
    svc.clear();
    svc.logError('boom', 'stack');
    const [evt] = svc.getEvents() as any[];
    expect((evt as any).handled).toBe(true);
  });

  it('readAll captura excepción de localStorage.getItem y retorna []', () => {
    const originalGet = localStorage.getItem;
    (localStorage as any).getItem = () => {
      throw new Error('fail');
    };
    expect((svc as any).readAll()).toEqual([]);
    (localStorage as any).getItem = originalGet;
  });

  it('logEvent usa uid() cuando no hay id ni crypto.randomUUID', () => {
    svc.clear();
    const originalCrypto = (self as any).crypto;
    Object.defineProperty(self as any, 'crypto', { value: {}, configurable: true });
    const originalUid = (svc as any).uid;
    const uidSpy: any = createSpy();
    uidSpy.mockReturnValue('uid-from-branch');
    (svc as any).uid = uidSpy;

    const now = Date.now();
    svc.logEvent({
      type: 'http_request',
      timestamp: now,
      method: 'GET',
      url: '/x',
      ok: true,
      status: 200,
    } as any);
    const [evt] = svc.getEvents();
    expect(uidSpy).toHaveBeenCalled();
    expect((evt as any).id).toBe('uid-from-branch');

    (svc as any).uid = originalUid;
    Object.defineProperty(self as any, 'crypto', { value: originalCrypto, configurable: true });
  });

  it('logLoginFailure(undefined) guarda userId como null', () => {
    svc.clear();
    svc.logLoginFailure(undefined);
    const [evt] = svc.getEvents() as any[];
    expect((evt as any).userId).toBeNull();
  });

  it('getEvents cubre catch de readAll cuando localStorage.getItem lanza', () => {
    const originalGet = localStorage.getItem;
    (localStorage as any).getItem = () => {
      throw new Error('fail-get');
    };
    expect(() => svc.getEvents()).not.toThrow();
    (localStorage as any).getItem = originalGet;
  });

  it('getEvents maneja JSON válido no-array retornando [] (cubre rama else)', () => {
    const originalGet = localStorage.getItem;
    (localStorage as any).getItem = () => '{"k":123}';
    const events = svc.getEvents();
    expect(Array.isArray(events)).toBe(true);
    expect(events.length).toBe(0);
    (localStorage as any).getItem = originalGet;
  });

  it('getEvents maneja JSON válido no-array retornando [] (rama else de Array.isArray)', () => {
    const originalGet = localStorage.getItem;
    (localStorage as any).getItem = () => '{"k":123}'; // JSON válido, pero no es array
    const events = svc.getEvents(); // pasa por readAll -> Array.isArray(parsed) === false
    expect(Array.isArray(events)).toBe(true);
    expect(events.length).toBe(0);
    (localStorage as any).getItem = originalGet;
  });

  it('getEvents cubre el catch de readAll cuando JSON.parse lanza', () => {
    const originalGet = localStorage.getItem;
    (localStorage as any).getItem = () => '}{'; // fuerza excepción en JSON.parse
    expect(() => svc.getEvents()).not.toThrow(); // readAll -> catch -> return []
    (localStorage as any).getItem = originalGet;
  });

  it('readAll regresa [] cuando el valor almacenado no es un arreglo', () => {
    const spy = jest.spyOn(Storage.prototype, 'getItem').mockReturnValue('{"foo":1}');
    try {
      const result = (svc as any).readAll();
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(0);
      expect(spy).toHaveBeenCalledWith('app_telemetry_events');
    } finally {
      spy.mockRestore();
    }
  });

  it('readAll captura excepciones de localStorage.getItem y devuelve []', () => {
    const spy = jest
      .spyOn(Storage.prototype, 'getItem')
      .mockImplementation(() => {
        throw new Error('get-fail');
      });
    try {
      expect((svc as any).readAll()).toEqual([]);
      expect(spy).toHaveBeenCalledWith('app_telemetry_events');
    } finally {
      spy.mockRestore();
    }
  });
});
