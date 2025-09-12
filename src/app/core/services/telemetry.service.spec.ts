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
});
