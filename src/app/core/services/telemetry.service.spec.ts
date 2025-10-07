import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { environment } from '../../../environments/environment';
import {
  mockDashboardData,
  mockEficienciaData,
  mockPedidosAnalisisData,
  mockProductosPopularesData,
  mockProductsData,
  mockRentabilidadData,
  mockReservasAnalisisData,
  mockSalesData,
  mockSegmentacionData,
  mockTimeAnalysisData,
  mockUsersData,
} from '../../shared/mocks/telemetry.mock';
import {
  createHandleErrorServiceMock,
  createStorageErrorMock,
} from '../../shared/mocks/test-doubles';
import { PurchaseData, TelemetryParams } from '../../shared/models/telemetry.model';
import { HandleErrorService } from './handle-error.service';
import { TelemetryService } from './telemetry.service';

class MockRouter {
  private currentUrl = '/';

  navigate(): Promise<boolean> {
    return Promise.resolve(true);
  }

  get url(): string {
    return this.currentUrl;
  }

  setUrl(url: string): void {
    this.currentUrl = url;
  }
}

describe('TelemetryService', () => {
  let service: TelemetryService;
  let httpTestingController: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/telemetria`;
  const mockHandleErrorService = createHandleErrorServiceMock();
  let routerMock: MockRouter;

  beforeEach(() => {
    routerMock = new MockRouter();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        TelemetryService,
        { provide: HandleErrorService, useValue: mockHandleErrorService },
        { provide: Router, useValue: routerMock },
      ],
    });

    service = TestBed.inject(TelemetryService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
    jest.restoreAllMocks();
    mockHandleErrorService.handleError.mockReset();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getDashboard', () => {
    it('should get dashboard data without parameters', () => {
      service.getDashboard().subscribe((response) => {
        expect(response).toEqual(mockDashboardData);
      });

      const req = httpTestingController.expectOne(`${baseUrl}/dashboard`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.keys().length).toBe(0);
      req.flush(mockDashboardData);
    });

    it('should get dashboard data with parameters', () => {
      const params: TelemetryParams = { periodo: 'ultimo_mes', limit: 10 };

      service.getDashboard(params).subscribe((response) => {
        expect(response).toEqual(mockDashboardData);
      });

      const req = httpTestingController.expectOne(
        `${baseUrl}/dashboard?periodo=ultimo_mes&limit=10`,
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockDashboardData);
    });

    it('should handle dashboard error', () => {
      service.getDashboard().subscribe();

      const req = httpTestingController.expectOne(`${baseUrl}/dashboard`);
      req.error(new ErrorEvent('Network error'));

      expect(mockHandleErrorService.handleError).toHaveBeenCalled();
    });
  });

  describe('getSales', () => {
    it('should get sales data', () => {
      service.getSales().subscribe((response) => {
        expect(response).toEqual(mockSalesData);
      });

      const req = httpTestingController.expectOne(`${baseUrl}/sales`);
      expect(req.request.method).toBe('GET');
      req.flush(mockSalesData);
    });

    it('should get sales data with periodo parameter', () => {
      const params: TelemetryParams = { periodo: 'ultimos_3_meses' };

      service.getSales(params).subscribe((response) => {
        expect(response).toEqual(mockSalesData);
      });

      const req = httpTestingController.expectOne(`${baseUrl}/sales?periodo=ultimos_3_meses`);
      expect(req.request.method).toBe('GET');
      req.flush(mockSalesData);
    });
  });

  describe('getProducts', () => {
    it('should get products data', () => {
      service.getProducts().subscribe((response) => {
        expect(response).toEqual(mockProductsData);
      });

      const req = httpTestingController.expectOne(`${baseUrl}/products`);
      expect(req.request.method).toBe('GET');
      req.flush(mockProductsData);
    });

    it('should get products data with limit parameter', () => {
      const params: TelemetryParams = { limit: 5 };

      service.getProducts(params).subscribe((response) => {
        expect(response).toEqual(mockProductsData);
      });

      const req = httpTestingController.expectOne(`${baseUrl}/products?limit=5`);
      expect(req.request.method).toBe('GET');
      req.flush(mockProductsData);
    });
  });

  describe('getRentabilidad', () => {
    it('should get rentabilidad data', () => {
      service.getRentabilidad().subscribe((response) => {
        expect(response).toEqual(mockRentabilidadData);
      });

      const req = httpTestingController.expectOne(`${baseUrl}/rentabilidad`);
      expect(req.request.method).toBe('GET');
      req.flush(mockRentabilidadData);
    });
  });

  describe('getSegmentacion', () => {
    it('should get segmentacion data', () => {
      service.getSegmentacion().subscribe((response) => {
        expect(response).toEqual(mockSegmentacionData);
      });

      const req = httpTestingController.expectOne(`${baseUrl}/segmentacion`);
      expect(req.request.method).toBe('GET');
      req.flush(mockSegmentacionData);
    });
  });

  describe('getEficiencia', () => {
    it('should get eficiencia data', () => {
      service.getEficiencia().subscribe((response) => {
        expect(response).toEqual(mockEficienciaData);
      });

      const req = httpTestingController.expectOne(`${baseUrl}/eficiencia`);
      expect(req.request.method).toBe('GET');
      req.flush(mockEficienciaData);
    });
  });

  describe('getReservasAnalisis', () => {
    it('should get reservas analisis data', () => {
      service.getReservasAnalisis().subscribe((response) => {
        expect(response).toEqual(mockReservasAnalisisData);
      });

      const req = httpTestingController.expectOne(`${baseUrl}/reservas-analisis`);
      expect(req.request.method).toBe('GET');
      req.flush(mockReservasAnalisisData);
    });
  });

  describe('getPedidosAnalisis', () => {
    it('should get pedidos analisis data', () => {
      service.getPedidosAnalisis().subscribe((response) => {
        expect(response).toEqual(mockPedidosAnalisisData);
      });

      const req = httpTestingController.expectOne(`${baseUrl}/pedidos-analisis`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPedidosAnalisisData);
    });
  });

  describe('getUsers', () => {
    it('should get users data', () => {
      service.getUsers().subscribe((response) => {
        expect(response).toEqual(mockUsersData);
      });

      const req = httpTestingController.expectOne(`${baseUrl}/users`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUsersData);
    });
  });

  describe('getTimeAnalysis', () => {
    it('should get time analysis data', () => {
      service.getTimeAnalysis().subscribe((response) => {
        expect(response).toEqual(mockTimeAnalysisData);
      });

      const req = httpTestingController.expectOne(`${baseUrl}/time-analysis`);
      expect(req.request.method).toBe('GET');
      req.flush(mockTimeAnalysisData);
    });
  });

  describe('getProductosPopulares', () => {
    it('should get popular products data', () => {
      service.getProductosPopulares().subscribe((response) => {
        expect(response).toEqual(mockProductosPopularesData);
      });

      const req = httpTestingController.expectOne(`${environment.apiUrl}/productos-populares`);
      expect(req.request.method).toBe('GET');
      req.flush(mockProductosPopularesData);
    });
  });

  describe('Error handling', () => {
    it('should handle network errors', () => {
      service.getDashboard().subscribe();

      const req = httpTestingController.expectOne(`${baseUrl}/dashboard`);
      req.error(new ErrorEvent('Network error'));

      expect(mockHandleErrorService.handleError).toHaveBeenCalled();
    });
  });

  describe('Parameter building', () => {
    it('should build params correctly with only periodo', () => {
      const params: TelemetryParams = { periodo: 'hoy' };

      service.getDashboard(params).subscribe();

      const req = httpTestingController.expectOne(`${baseUrl}/dashboard?periodo=hoy`);
      expect(req.request.method).toBe('GET');
      req.flush(mockDashboardData);
    });

    it('should build params correctly with only limit', () => {
      const params: TelemetryParams = { limit: 25 };

      service.getProducts(params).subscribe();

      const req = httpTestingController.expectOne(`${baseUrl}/products?limit=25`);
      expect(req.request.method).toBe('GET');
      req.flush(mockProductsData);
    });

    it('should handle empty params object', () => {
      const params: TelemetryParams = {};

      service.getSales(params).subscribe();

      const req = httpTestingController.expectOne(`${baseUrl}/sales`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.keys().length).toBe(0);
      req.flush(mockSalesData);
    });

    it('should build params with advanced filters', () => {
      const params: TelemetryParams = {
        periodo: 'personalizado',
        limit: 15,
        mes: 5,
        año: 2024,
        fecha_inicio: '2024-01-01',
        fecha_fin: '2024-01-31',
        hora_inicio: '08:00',
        hora_fin: '18:00',
      };

      service.getSegmentacion(params).subscribe();

      const req = httpTestingController.expectOne(
        (request) => request.url === `${baseUrl}/segmentacion`,
      );
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('periodo')).toBe('personalizado');
      expect(req.request.params.get('limit')).toBe('15');
      expect(req.request.params.get('mes')).toBe('5');
      expect(req.request.params.get('año')).toBe('2024');
      expect(req.request.params.get('fecha_inicio')).toBe('2024-01-01');
      expect(req.request.params.get('fecha_fin')).toBe('2024-01-31');
      expect(req.request.params.get('hora_inicio')).toBe('08:00');
      expect(req.request.params.get('hora_fin')).toBe('18:00');
      req.flush(mockSegmentacionData);
    });
  });

  // ========================================
  // TESTS PARA LOGGING LOCAL
  // ========================================

  describe('Local Logging Methods', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    describe('logLoginAttempt', () => {
      it('should log login attempt without userId', () => {
        service.logLoginAttempt();
        const events = service.getEvents();

        expect(events).toHaveLength(1);
        expect(events[0].type).toBe('login_attempt');
        expect(events[0].userId).toBeNull();
      });

      it('should log login attempt with userId', () => {
        service.logLoginAttempt(123);
        const events = service.getEvents();

        expect(events).toHaveLength(1);
        expect(events[0].type).toBe('login_attempt');
        expect(events[0].userId).toBe(123);
      });
    });

    describe('logLoginSuccess', () => {
      it('should log login success', () => {
        service.logLoginSuccess(456);
        const events = service.getEvents();

        expect(events).toHaveLength(1);
        expect(events[0].type).toBe('login_success');
        expect(events[0].userId).toBe(456);
      });
    });

    describe('logLoginFailure', () => {
      it('should log login failure', () => {
        service.logLoginFailure();
        const events = service.getEvents();

        expect(events).toHaveLength(1);
        expect(events[0].type).toBe('login_failure');
        expect(events[0].userId).toBeNull();
      });
    });

    describe('logPurchase', () => {
      it('should log purchase data', () => {
        const purchaseData: PurchaseData = {
          userId: 789,
          paymentMethodId: 1,
          paymentMethodLabel: 'EFECTIVO',
          requiresDelivery: true,
          items: [
            { productId: 1, name: 'Bandeja Paisa', quantity: 2, unitPrice: 25000 },
            { productId: 2, name: 'Gaseosa', quantity: 1, unitPrice: 3000 },
          ],
          subtotal: 53000,
        };

        service.logPurchase(purchaseData);
        const events = service.getEvents();

        expect(events).toHaveLength(1);
        expect(events[0].type).toBe('purchase');
        expect(events[0].userId).toBe(789);
        expect(events[0].paymentMethodLabel).toBe('EFECTIVO');
        expect(events[0].subtotal).toBe(53000);
        expect(events[0].items).toHaveLength(2);
      });
    });

    describe('logHttp', () => {
      it('should log HTTP request', () => {
        service.logHttp({
          method: 'GET',
          url: '/api/test',
          ok: true,
          status: 200,
          durationMs: 150,
          requestId: 'req-123',
        });

        const events = service.getEvents();

        expect(events).toHaveLength(1);
        expect(events[0].type).toBe('http_request');
        expect(events[0].method).toBe('GET');
        expect(events[0].url).toBe('/api/test');
        expect(events[0].ok).toBe(true);
        expect(events[0].status).toBe(200);
        expect(events[0].durationMs).toBe(150);
        expect(events[0].requestId).toBe('req-123');
      });
    });

    describe('logError', () => {
      it('should log error with default handled=true', () => {
        service.logError('Test error', 'stack trace');
        const events = service.getEvents();

        expect(events).toHaveLength(1);
        expect(events[0].type).toBe('error');
        expect(events[0].message).toBe('Test error');
        expect(events[0].stack).toBe('stack trace');
        expect(events[0].handled).toBe(true);
      });

      it('should log error with handled=false', () => {
        service.logError('Unhandled error', undefined, false, 'req-456');
        const events = service.getEvents();

        expect(events).toHaveLength(1);
        expect(events[0].type).toBe('error');
        expect(events[0].message).toBe('Unhandled error');
        expect(events[0].handled).toBe(false);
        expect(events[0].requestId).toBe('req-456');
      });
    });

    describe('getEvents', () => {
      it('should return empty array when there are no events stored', () => {
        expect(service.getEvents()).toEqual([]);
      });

      it('should return all events when no limit', () => {
        service.logLoginAttempt();
        service.logLoginSuccess();
        service.logLoginFailure();

        const events = service.getEvents();
        expect(events).toHaveLength(3);
      });

      it('should return limited events when limit provided', () => {
        service.logLoginAttempt();
        service.logLoginSuccess();
        service.logLoginFailure();

        const events = service.getEvents(2);
        expect(events).toHaveLength(2);
        // Should return the last 2 events
        expect(events[0].type).toBe('login_success');
        expect(events[1].type).toBe('login_failure');
      });
    });

    describe('getAggregatedMetrics', () => {
      it('should aggregate login metrics', () => {
        service.logLoginAttempt();
        service.logLoginAttempt();
        service.logLoginSuccess();
        service.logLoginFailure();

        const metrics = service.getAggregatedMetrics();

        expect(metrics.login.attempts).toBe(2);
        expect(metrics.login.successes).toBe(1);
        expect(metrics.login.failures).toBe(1);
      });

      it('should aggregate purchase metrics', () => {
        const purchaseData: PurchaseData = {
          userId: 123,
          paymentMethodId: 1,
          paymentMethodLabel: 'EFECTIVO',
          requiresDelivery: true,
          items: [{ productId: 1, name: 'Bandeja Paisa', quantity: 2, unitPrice: 25000 }],
          subtotal: 50000,
        };

        service.logPurchase(purchaseData);
        const metrics = service.getAggregatedMetrics();

        expect(metrics.purchasesByPaymentMethod['EFECTIVO']).toBe(1);
        expect(metrics.productsCount['Bandeja Paisa']).toBe(2);
        expect(metrics.usersByPurchases['123']).toBe(1);
      });

      it('should aggregate purchase metrics without payment method label', () => {
        const fixedTimestamp = Date.UTC(2024, 0, 5, 10, 0, 0);

        service.logEvent({
          type: 'purchase',
          paymentMethodId: 9,
          subtotal: 42000,
          timestamp: fixedTimestamp,
          items: [{ productId: 99, quantity: 3 }],
          userId: 777,
        });

        const metrics = service.getAggregatedMetrics();

        expect(metrics.purchasesByPaymentMethod).toEqual({});
        expect(metrics.productsCount['99']).toBe(3);
        expect(metrics.usersByPurchases['777']).toBe(1);
        expect(Object.values(metrics.salesByHour)[0]).toBe(42000);
        expect(Object.values(metrics.salesByWeekday)[0]).toBe(42000);
      });
    });

    describe('clear', () => {
      it('should clear all events', () => {
        service.logLoginAttempt();
        service.logLoginSuccess();

        expect(service.getEvents()).toHaveLength(2);

        service.clear();

        expect(service.getEvents()).toHaveLength(0);
      });

      it('should handle localStorage errors gracefully', () => {
        const originalRemoveItem = localStorage.removeItem;
        const mockRemoveItem = createStorageErrorMock();
        localStorage.removeItem = mockRemoveItem as any;

        expect(() => service.clear()).not.toThrow();

        localStorage.removeItem = originalRemoveItem;
      });
    });

    describe('Event management', () => {
      it('should maintain maximum events limit', () => {
        // Force a small limit for testing
        (service as any).maxEvents = 3;

        service.logLoginAttempt();
        service.logLoginSuccess();
        service.logLoginFailure();
        service.logLoginAttempt(); // This should remove the first event

        const events = service.getEvents();
        expect(events).toHaveLength(3);
        // First event should be removed
        expect(events[0].type).toBe('login_success');
      });

      it('should handle localStorage read errors', () => {
        const originalGetItem = localStorage.getItem;
        const mockGetItem = createStorageErrorMock();
        localStorage.getItem = mockGetItem as any;

        expect(() => service.getEvents()).not.toThrow();
        expect(service.getEvents()).toEqual([]);

        localStorage.getItem = originalGetItem;
      });

      it('should handle localStorage write errors', () => {
        const originalSetItem = localStorage.setItem;
        const mockSetItem = createStorageErrorMock();
        localStorage.setItem = mockSetItem as any;

        expect(() => service.logLoginAttempt()).not.toThrow();

        localStorage.setItem = originalSetItem;
      });

      it('should handle invalid JSON in localStorage', () => {
        localStorage.setItem('app_telemetry_events', 'invalid json');

        expect(() => service.getEvents()).not.toThrow();
        expect(service.getEvents()).toEqual([]);
      });

      it('should handle non-array data in localStorage', () => {
        localStorage.setItem('app_telemetry_events', '{"not": "array"}');

        expect(() => service.getEvents()).not.toThrow();
        expect(service.getEvents()).toEqual([]);
      });
    });
  });

  describe('Device Detection & User Info', () => {
    describe('initializeDeviceType', () => {
      it('should skip initialization when window is undefined', () => {
        const originalWindow = (globalThis as any).window;
        delete (globalThis as any).window;

        const getItemSpy = jest.spyOn(Storage.prototype, 'getItem');
        service['initializeDeviceType']();

        expect(getItemSpy).not.toHaveBeenCalled();

        getItemSpy.mockRestore();
        (globalThis as any).window = originalWindow;
      });

      it('should use stored device type without detecting again', () => {
        localStorage.setItem(service['deviceTypeKey'], 'android');
        const detectSpy = jest.spyOn<any, any>(service, 'detectDeviceType');
        const setDeviceTypeSpy = jest.spyOn(service, 'setDeviceType');

        service['initializeDeviceType']();

        expect(detectSpy).not.toHaveBeenCalled();
        expect(setDeviceTypeSpy).not.toHaveBeenCalled();

        detectSpy.mockRestore();
        setDeviceTypeSpy.mockRestore();
      });

      it('should detect and store device type when missing', () => {
        localStorage.removeItem(service['deviceTypeKey']);
        const detectSpy = jest
          .spyOn<any, any>(service, 'detectDeviceType')
          .mockReturnValue('web-mobile');
        const setDeviceTypeSpy = jest.spyOn(service, 'setDeviceType');

        service['initializeDeviceType']();

        expect(detectSpy).toHaveBeenCalled();
        expect(setDeviceTypeSpy).toHaveBeenCalledWith('web-mobile');

        detectSpy.mockRestore();
        setDeviceTypeSpy.mockRestore();
      });
    });

    describe('setUserDocument / getUserDocument', () => {
      it('should set and get user document from localStorage', () => {
        service.setUserDocument('1234567890');
        expect(service.getUserDocument()).toBe('1234567890');
      });

      it('should return null if user document is not set', () => {
        expect(service.getUserDocument()).toBeNull();
      });
    });

    describe('setDeviceType / getDeviceType', () => {
      it('should set and get device type from localStorage', () => {
        service.setDeviceType('android');
        expect(service.getDeviceType()).toBe('android');
      });

      it('should return "desktop" if device type is not set', () => {
        expect(service.getDeviceType()).toBe('desktop');
      });

      it('should set device type to "ios"', () => {
        service.setDeviceType('ios');
        expect(service.getDeviceType()).toBe('ios');
      });

      it('should set device type to "web-mobile"', () => {
        service.setDeviceType('web-mobile');
        expect(service.getDeviceType()).toBe('web-mobile');
      });
    });

    describe('clearUserInfo', () => {
      it('should clear user document and device type from localStorage', () => {
        service.setUserDocument('9876543210');
        service.setDeviceType('android');

        expect(service.getUserDocument()).toBe('9876543210');
        expect(service.getDeviceType()).toBe('android');

        service.clearUserInfo();

        expect(service.getUserDocument()).toBeNull();
        expect(localStorage.getItem('app_telemetry_user_document')).toBeNull();
        expect(localStorage.getItem('app_telemetry_device_type')).toBeNull();
      });

      it('should handle localStorage errors gracefully when clearing', () => {
        const originalRemoveItem = localStorage.removeItem;
        const mockRemoveItem = createStorageErrorMock();
        localStorage.removeItem = mockRemoveItem as any;

        expect(() => service.clearUserInfo()).not.toThrow();

        localStorage.removeItem = originalRemoveItem;
      });
    });

    describe('detectDeviceType (private method tested via reflection)', () => {
      let originalNavigator: Navigator;
      let originalWindow: Window & typeof globalThis;

      beforeEach(() => {
        originalNavigator = global.navigator;
        originalWindow = global.window;
      });

      afterEach(() => {
        global.navigator = originalNavigator;
        global.window = originalWindow;
      });

      it('should detect android with Capacitor', () => {
        Object.defineProperty(global, 'navigator', {
          writable: true,
          value: { userAgent: 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36' },
        });
        Object.defineProperty(global, 'window', {
          writable: true,
          value: { Capacitor: {} },
        });

        const result = (service as any).detectDeviceType();
        expect(result).toBe('android');
      });

      it('should detect ios with Capacitor (iPhone)', () => {
        Object.defineProperty(global, 'navigator', {
          writable: true,
          value: { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0)' },
        });
        Object.defineProperty(global, 'window', {
          writable: true,
          value: { Capacitor: {} },
        });

        const result = (service as any).detectDeviceType();
        expect(result).toBe('ios');
      });

      it('should detect ios with Capacitor (iPad)', () => {
        Object.defineProperty(global, 'navigator', {
          writable: true,
          value: { userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_0)' },
        });
        Object.defineProperty(global, 'window', {
          writable: true,
          value: { Capacitor: {} },
        });

        const result = (service as any).detectDeviceType();
        expect(result).toBe('ios');
      });

      it('should detect web-mobile for Android browser', () => {
        Object.defineProperty(global, 'navigator', {
          writable: true,
          value: {
            userAgent: 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 Mobile',
          },
        });
        Object.defineProperty(global, 'window', {
          writable: true,
          value: {},
        });

        const result = (service as any).detectDeviceType();
        expect(result).toBe('web-mobile');
      });

      it('should detect web-mobile for iPhone browser', () => {
        Object.defineProperty(global, 'navigator', {
          writable: true,
          value: { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0)' },
        });
        Object.defineProperty(global, 'window', {
          writable: true,
          value: {},
        });

        const result = (service as any).detectDeviceType();
        expect(result).toBe('web-mobile');
      });

      it('should detect desktop for tablet (iPad)', () => {
        Object.defineProperty(global, 'navigator', {
          writable: true,
          value: { userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_0)' },
        });
        Object.defineProperty(global, 'window', {
          writable: true,
          value: {},
        });

        const result = (service as any).detectDeviceType();
        expect(result).toBe('desktop');
      });

      it('should detect desktop for standard browser', () => {
        Object.defineProperty(global, 'navigator', {
          writable: true,
          value: {
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0.4472.124',
          },
        });
        Object.defineProperty(global, 'window', {
          writable: true,
          value: {},
        });

        const result = (service as any).detectDeviceType();
        expect(result).toBe('desktop');
      });

      it('should return desktop when window is undefined', () => {
        const originalWindow = (globalThis as any).window;
        (globalThis as any).window = undefined;

        const result = (service as any).detectDeviceType();
        expect(result).toBe('desktop');

        (globalThis as any).window = originalWindow;
      });
    });
  });

  describe('getCurrentScreen', () => {
    it('should return mapped screen name for exact route match', () => {
      jest.spyOn(service['router'], 'url', 'get').mockReturnValue('/admin/dashboard');
      expect(service.getCurrentScreen()).toBe('Dashboard Admin');
    });

    it('should return mapped screen name for telemetry route', () => {
      jest.spyOn(service['router'], 'url', 'get').mockReturnValue('/admin/telemetry');
      expect(service.getCurrentScreen()).toBe('Telemetría');
    });

    it('should return mapped screen name for client menu', () => {
      jest.spyOn(service['router'], 'url', 'get').mockReturnValue('/client/menu');
      expect(service.getCurrentScreen()).toBe('Menú Cliente');
    });

    it('should return mapped screen name for public ubicacion', () => {
      jest.spyOn(service['router'], 'url', 'get').mockReturnValue('/public/ubicacion');
      expect(service.getCurrentScreen()).toBe('Ubicación');
    });

    it('should return mapped screen name for partial match (dynamic routes)', () => {
      jest.spyOn(service['router'], 'url', 'get').mockReturnValue('/admin/productos/123');
      expect(service.getCurrentScreen()).toBe('Gestión Productos');
    });

    it('should return formatted route for unmapped routes', () => {
      jest.spyOn(service['router'], 'url', 'get').mockReturnValue('/some/nested/route');
      expect(service.getCurrentScreen()).toBe('some > nested > route');
    });

    it('should return "Inicio" for root route', () => {
      jest.spyOn(service['router'], 'url', 'get').mockReturnValue('/');
      expect(service.getCurrentScreen()).toBe('Inicio');
    });

    it('should return null on error', () => {
      jest.spyOn(service['router'], 'url', 'get').mockImplementation(() => {
        throw new Error('Router error');
      });
      expect(service.getCurrentScreen()).toBeNull();
    });
  });

  describe('generateId and uid', () => {
    it('should use crypto.randomUUID when available', () => {
      // Mockear crypto.randomUUID en el objeto global self
      let randomUUIDCalled = false;
      const mockRandomUUID = () => {
        randomUUIDCalled = true;
        return 'uuid-123';
      };
      const originalCrypto = self.crypto;
      Object.defineProperty(self, 'crypto', {
        value: { randomUUID: mockRandomUUID },
        writable: true,
        configurable: true,
      });

      const id = (service as any).generateId();

      expect(randomUUIDCalled).toBe(true);
      expect(id).toBe('uuid-123');

      // Restaurar
      Object.defineProperty(self, 'crypto', {
        value: originalCrypto,
        writable: true,
        configurable: true,
      });
    });

    it('should fallback to uid when crypto.randomUUID is unavailable', () => {
      const originalSelf = (globalThis as any).self;
      (globalThis as any).self = undefined;
      const uidSpy = jest.spyOn<any, any>(service, 'uid');

      const id = (service as any).generateId();

      expect(uidSpy).toHaveBeenCalled();
      expect(typeof id).toBe('string');

      uidSpy.mockRestore();
      (globalThis as any).self = originalSelf;
    });

    it('should generate a unique id using uid()', () => {
      const first = (service as any).uid();
      const second = (service as any).uid();

      expect(first).not.toBe(second);
      expect(typeof first).toBe('string');
      expect(typeof second).toBe('string');
    });
  });

  describe('LocalStorage fallback behavior', () => {
    let originalLocalStorage: Storage | undefined;

    beforeEach(() => {
      originalLocalStorage = (globalThis as any).localStorage;
      (globalThis as any).localStorage = undefined;
    });

    afterEach(() => {
      (globalThis as any).localStorage = originalLocalStorage;
    });

    it('should safely handle methods when localStorage is unavailable', () => {
      expect(service.getEvents()).toEqual([]);
      expect(service.getUserDocument()).toBeNull();
      expect(service.getDeviceType()).toBe('desktop');

      expect(() => service.setUserDocument('999')).not.toThrow();
      expect(() => service.setDeviceType('android')).not.toThrow();
      expect(() => service.clearUserInfo()).not.toThrow();
      expect(() => service.clear()).not.toThrow();
    });
  });
});
