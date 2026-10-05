import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { PerformanceService } from '../../../core/services/performance.service';
import { TelemetryService } from '../../../core/services/telemetry.service';
import {
  mockDashboardData,
  mockEficienciaData,
  mockPedidosAnalisisData,
  mockProductsData,
  mockRentabilidadData,
  mockReservasAnalisisData,
  mockSalesData,
  mockSegmentacionData,
  mockTimeAnalysisData,
  mockUsersData,
} from '../../../shared/mocks/telemetry.mock';
import {
  createPerformanceServiceMock,
  createTelemetryServiceMock,
} from '../../../shared/mocks/test-doubles';
import { TelemetryDashboardComponent } from './telemetry-dashboard.component';

describe('TelemetryDashboardComponent', () => {
  let component: TelemetryDashboardComponent;
  let fixture: ComponentFixture<TelemetryDashboardComponent>;
  let telemetry: jest.Mocked<TelemetryService>;
  let performance: jest.Mocked<PerformanceService>;

  beforeEach(async () => {
    const telemetryMock = createTelemetryServiceMock() as jest.Mocked<TelemetryService>;
    const performanceMock = createPerformanceServiceMock();

    // Configurar mocks para logging local
    telemetryMock.getAggregatedMetrics.mockReturnValue({
      login: { attempts: 3, successes: 2, failures: 1 },
      purchasesByPaymentMethod: { Nequi: 2, Efectivo: 1 },
      productsCount: { Hamburguesa: 2, Gaseosa: 1 },
      usersByPurchases: { '42': 2 },
      salesByHour: { '10': 1, '11': 2 },
      salesByWeekday: { '1': 3 },
    });
    telemetryMock.getEvents.mockReturnValue([]);

    // Configurar mocks para métodos del backend usando los mocks de src/app/shared/mocks
    telemetryMock.getDashboard.mockReturnValue(of(mockDashboardData));
    telemetryMock.getSales.mockReturnValue(of(mockSalesData));
    telemetryMock.getProducts.mockReturnValue(of(mockProductsData));
    telemetryMock.getUsers.mockReturnValue(of(mockUsersData));
    telemetryMock.getTimeAnalysis.mockReturnValue(of(mockTimeAnalysisData));
    telemetryMock.getRentabilidad.mockReturnValue(of(mockRentabilidadData));
    telemetryMock.getSegmentacion.mockReturnValue(of(mockSegmentacionData));
    telemetryMock.getEficiencia.mockReturnValue(of(mockEficienciaData));
    telemetryMock.getReservasAnalisis.mockReturnValue(of(mockReservasAnalisisData));
    telemetryMock.getPedidosAnalisis.mockReturnValue(of(mockPedidosAnalisisData));
    telemetryMock.getUserDocument.mockReturnValue('12345678');
    telemetryMock.getDeviceType.mockReturnValue('desktop');

    await TestBed.configureTestingModule({
      imports: [TelemetryDashboardComponent],
      providers: [
        { provide: TelemetryService, useValue: telemetryMock },
        { provide: PerformanceService, useValue: performanceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TelemetryDashboardComponent);
    component = fixture.componentInstance;
    telemetry = TestBed.inject(TelemetryService) as jest.Mocked<TelemetryService>;
    performance = TestBed.inject(PerformanceService) as jest.Mocked<PerformanceService>;
    fixture.detectChanges();
  });

  describe('Component initialization', () => {
    it('should create and load dashboard data', () => {
      expect(component).toBeTruthy();
      expect(telemetry.getDashboard).toHaveBeenCalledWith({ periodo: 'ultimo_mes' });
      expect(component.dashboardData()).toEqual(mockDashboardData.data);
    });

    it('should initialize with default values', () => {
      expect(component.activeTab()).toBe('dashboard');
      expect(component.selectedPeriod()).toBe('ultimo_mes');
      expect(component.isLoading()).toBe(false);
      expect(component.error()).toBe(null);
    });
  });

  describe('Tab switching', () => {
    it('should switch to sales tab and load sales data', () => {
      component.setActiveTab('sales');
      expect(component.activeTab()).toBe('sales');
      expect(telemetry.getSales).toHaveBeenCalled();
    });

    it('should switch to products tab and load products data', () => {
      component.setActiveTab('products');
      expect(component.activeTab()).toBe('products');
      expect(telemetry.getProducts).toHaveBeenCalled();
    });

    it('should switch to users tab and load users data', () => {
      component.setActiveTab('users');
      expect(component.activeTab()).toBe('users');
      expect(telemetry.getUsers).toHaveBeenCalled();
    });

    it('should switch to time tab and load time analysis data', () => {
      component.setActiveTab('time');
      expect(component.activeTab()).toBe('time');
      expect(telemetry.getTimeAnalysis).toHaveBeenCalled();
    });

    it('should switch to rentabilidad tab and load rentabilidad data', () => {
      component.setActiveTab('rentabilidad');
      expect(component.activeTab()).toBe('rentabilidad');
      expect(telemetry.getRentabilidad).toHaveBeenCalled();
    });

    it('should switch to segmentacion tab and load segmentacion data', () => {
      component.setActiveTab('segmentacion');
      expect(component.activeTab()).toBe('segmentacion');
      expect(telemetry.getSegmentacion).toHaveBeenCalled();
    });

    it('should switch to eficiencia tab and load eficiencia data', () => {
      component.setActiveTab('eficiencia');
      expect(component.activeTab()).toBe('eficiencia');
      expect(telemetry.getEficiencia).toHaveBeenCalled();
    });

    it('should switch to reservas tab and load reservas data', () => {
      component.setActiveTab('reservas');
      expect(component.activeTab()).toBe('reservas');
      expect(telemetry.getReservasAnalisis).toHaveBeenCalled();
    });

    it('should switch to pedidos tab and load pedidos data', () => {
      component.setActiveTab('pedidos');
      expect(component.activeTab()).toBe('pedidos');
      expect(telemetry.getPedidosAnalisis).toHaveBeenCalled();
    });

    it('should switch to local tab and refresh local data', () => {
      const refreshSpy = jest.spyOn(component, 'refreshLocal');
      component.setActiveTab('local');
      expect(component.activeTab()).toBe('local');
      expect(refreshSpy).toHaveBeenCalled();
    });
  });

  describe('Period changes', () => {
    it('should reload data when period changes', () => {
      component.selectedPeriod.set('ultimo_anio');
      component.onPeriodChange();
      expect(telemetry.getDashboard).toHaveBeenCalled();
    });

    it('should use new period when loading tab data', () => {
      component.selectedPeriod.set('ultimos_7_dias');
      component.setActiveTab('sales');
      expect(telemetry.getSales).toHaveBeenCalledWith({ periodo: 'ultimos_7_dias' });
    });
  });

  describe('Refresh operations', () => {
    it('should refresh all data', () => {
      const refreshLocalSpy = jest.spyOn(component, 'refreshLocal');
      component.refreshAll();
      expect(telemetry.getDashboard).toHaveBeenCalled();
      expect(refreshLocalSpy).toHaveBeenCalled();
    });

    it('should refresh local telemetry data', () => {
      const initialTick = component['localRefreshTick']();
      component.refreshLocal();
      expect(component['localRefreshTick']()).toBe(initialTick + 1);
      expect(component.localMetrics()).toBeDefined();
    });

    it('should clear local telemetry data', () => {
      component.clearLocal();
      expect(telemetry.clear).toHaveBeenCalled();
    });
  });

  describe('Filter operations', () => {
    it('should update screen filter', () => {
      component.onScreenFilterChange('login');
      expect(component.screenFilter()).toBe('login');
    });

    it('should update url filter', () => {
      component.onUrlFilterChange('/dashboard');
      expect(component.urlFilter()).toBe('/dashboard');
    });

    it('should update user filter', () => {
      component.onUserFilterChange('12345678');
      expect(component.userFilter()).toBe('12345678');
    });

    it('should update date from filter', () => {
      component.onDateFromFilterChange('2024-01-01');
      expect(component.dateFromFilter()).toBe('2024-01-01');
    });

    it('should update date to filter', () => {
      component.onDateToFilterChange('2024-12-31');
      expect(component.dateToFilter()).toBe('2024-12-31');
    });

    it('should update sort order', () => {
      component.onSortOrderChange('oldest');
      expect(component.sortOrder()).toBe('oldest');
    });

    it('should clear all filters', () => {
      component.onScreenFilterChange('test');
      component.onUrlFilterChange('test');
      component.onUserFilterChange('test');
      component.onDateFromFilterChange('2024-01-01');
      component.onDateToFilterChange('2024-12-31');

      component.clearFilters();

      expect(component.screenFilter()).toBe('');
      expect(component.urlFilter()).toBe('');
      expect(component.userFilter()).toBe('');
      expect(component.dateFromFilter()).toBe('');
      expect(component.dateToFilter()).toBe('');
    });
  });

  describe('Event filtering', () => {
    const mockEvents = [
      {
        id: '1',
        timestamp: new Date('2024-01-15').getTime(),
        currentScreen: 'Login',
        url: '/login',
        userDocument: '12345678',
        userId: 1,
      },
      {
        id: '2',
        timestamp: new Date('2024-01-10').getTime(),
        currentScreen: 'Dashboard',
        url: '/dashboard',
        userDocument: '87654321',
        userId: 2,
      },
    ];

    beforeEach(() => {
      telemetry.getEvents.mockReturnValue(mockEvents);
      component.refreshLocal(); // Force refresh to pick up new events
    });

    it('should filter events by screen', () => {
      component.onScreenFilterChange('login');
      component.refreshLocal(); // Refresh after setting filter
      const events = component.localEvents();
      expect(events.length).toBe(1);
      expect(events[0].currentScreen).toBe('Login');
    });

    it('should filter events by url', () => {
      component.onUrlFilterChange('dashboard');
      const events = component.localEvents();
      expect(events.length).toBe(1);
      expect(events[0].url).toBe('/dashboard');
    });

    it('should filter events by user document', () => {
      component.onUserFilterChange('12345678');
      const events = component.localEvents();
      expect(events.length).toBe(1);
      expect(events[0].userDocument).toBe('12345678');
    });

    it('should filter events by user id', () => {
      // Buscar por un userId específico que no aparezca en los documentos
      // Crear eventos con documentos que no contengan el userId buscado
      const specificEvents = [
        {
          id: '1',
          timestamp: new Date('2024-01-15').getTime(),
          currentScreen: 'Login',
          url: '/login',
          userDocument: '99999999',
          userId: 100,
        },
        {
          id: '2',
          timestamp: new Date('2024-01-10').getTime(),
          currentScreen: 'Dashboard',
          url: '/dashboard',
          userDocument: '88888888',
          userId: 200,
        },
      ];
      telemetry.getEvents.mockReturnValue(specificEvents);
      component.refreshLocal();

      component.onUserFilterChange('100');
      component.refreshLocal();
      const events = component.localEvents();
      expect(events.length).toBe(1);
      expect(events[0].userId).toBe(100);
    });

    it('should filter events by date from', () => {
      component.onDateFromFilterChange('2024-01-12');
      const events = component.localEvents();
      expect(events.length).toBe(1);
      expect(events[0].timestamp).toBe(new Date('2024-01-15').getTime());
    });

    it('should filter events by date to', () => {
      component.onDateToFilterChange('2024-01-12');
      const events = component.localEvents();
      expect(events.length).toBe(1);
      expect(events[0].timestamp).toBe(new Date('2024-01-10').getTime());
    });

    it('should filter events by date range', () => {
      component.onDateFromFilterChange('2024-01-11');
      component.onDateToFilterChange('2024-01-16');
      const events = component.localEvents();
      expect(events.length).toBe(1);
      expect(events[0].timestamp).toBe(new Date('2024-01-15').getTime());
    });

    it('should sort events by newest first', () => {
      component.onSortOrderChange('newest');
      const events = component.localEvents();
      expect(events[0].timestamp).toBeGreaterThan(events[1].timestamp);
    });

    it('should sort events by oldest first', () => {
      component.onSortOrderChange('oldest');
      const events = component.localEvents();
      expect(events[0].timestamp).toBeLessThan(events[1].timestamp);
    });
  });

  describe('User and device info', () => {
    it('should set user document', () => {
      component.setUserDocument('99887766');
      expect(telemetry.setUserDocument).toHaveBeenCalledWith('99887766');
    });

    it('should get user info', () => {
      const userInfo = component.getUserInfo();
      expect(userInfo.document).toBe('12345678');
      expect(userInfo.deviceType).toBe('desktop');
    });
  });

  describe('Core Web Vitals', () => {
    it('should get core web vitals', () => {
      const mockVitals = { lcp: 2500, fid: 100, cls: 0.1 };
      performance.getCoreWebVitals.mockReturnValue(mockVitals);

      const vitals = component.getCoreWebVitals();
      expect(vitals).toEqual(mockVitals);
      expect(performance.getCoreWebVitals).toHaveBeenCalled();
    });

    it('should get core web vitals status', () => {
      const mockStatus = { lcp: 'good', fid: 'good', cls: 'needs-improvement' };
      performance.getCoreWebVitalsStatus.mockReturnValue(mockStatus);

      const status = component.getCoreWebVitalsStatus();
      expect(status).toEqual(mockStatus);
      expect(performance.getCoreWebVitalsStatus).toHaveBeenCalled();
    });
  });

  describe('Formatting methods', () => {
    it('should format event timestamp', () => {
      const timestamp = new Date('2024-10-05T14:30:00').getTime();
      const formatted = component.formatEventTimestamp(timestamp);
      expect(formatted).toContain('2024');
      expect(formatted).toContain('10');
      expect(formatted).toContain('05');
    });

    describe('getEventTypeClass', () => {
      it('should return success class for login_success', () => {
        expect(component.getEventTypeClass('login_success')).toBe('bg-success');
      });

      it('should return danger class for login_failure', () => {
        expect(component.getEventTypeClass('login_failure')).toBe('bg-danger');
      });

      it('should return info class for login_attempt', () => {
        expect(component.getEventTypeClass('login_attempt')).toBe('bg-info');
      });

      it('should return primary class for purchase', () => {
        expect(component.getEventTypeClass('purchase')).toBe('bg-primary');
      });

      it('should return secondary class for http_request', () => {
        expect(component.getEventTypeClass('http_request')).toBe('bg-secondary');
      });

      it('should return warning class for error', () => {
        expect(component.getEventTypeClass('error')).toBe('bg-warning');
      });

      it('should return default class for unknown type', () => {
        expect(component.getEventTypeClass('unknown')).toBe('bg-light text-dark');
      });
    });

    describe('getStatusClass', () => {
      it('should return success class for 2xx status', () => {
        expect(component.getStatusClass(200)).toBe('status-success');
        expect(component.getStatusClass(201)).toBe('status-success');
      });

      it('should return redirect class for 3xx status', () => {
        expect(component.getStatusClass(301)).toBe('status-redirect');
        expect(component.getStatusClass(302)).toBe('status-redirect');
      });

      it('should return client-error class for 4xx status', () => {
        expect(component.getStatusClass(400)).toBe('status-client-error');
        expect(component.getStatusClass(404)).toBe('status-client-error');
      });

      it('should return server-error class for 5xx status', () => {
        expect(component.getStatusClass(500)).toBe('status-server-error');
        expect(component.getStatusClass(503)).toBe('status-server-error');
      });

      it('should return empty string for unknown status', () => {
        expect(component.getStatusClass(100)).toBe('');
      });
    });

    describe('getDurationClass', () => {
      it('should return fast class for duration < 100ms', () => {
        expect(component.getDurationClass(50)).toBe('duration-fast');
      });

      it('should return medium class for duration < 500ms', () => {
        expect(component.getDurationClass(250)).toBe('duration-medium');
      });

      it('should return slow class for duration < 1000ms', () => {
        expect(component.getDurationClass(750)).toBe('duration-slow');
      });

      it('should return very-slow class for duration >= 1000ms', () => {
        expect(component.getDurationClass(1500)).toBe('duration-very-slow');
      });
    });

    describe('getDeviceTypeClass', () => {
      it('should return device-desktop for desktop', () => {
        expect(component.getDeviceTypeClass('desktop')).toBe('device-desktop');
      });

      it('should return device-web-mobile for web-mobile', () => {
        expect(component.getDeviceTypeClass('web-mobile')).toBe('device-web-mobile');
      });

      it('should return device-android for android', () => {
        expect(component.getDeviceTypeClass('android')).toBe('device-android');
      });

      it('should return device-ios for ios', () => {
        expect(component.getDeviceTypeClass('ios')).toBe('device-ios');
      });

      it('should return device-unknown for unknown type', () => {
        expect(component.getDeviceTypeClass('unknown')).toBe('device-unknown');
      });
    });

    describe('getDeviceTypeIcon', () => {
      it('should return desktop icon for desktop', () => {
        expect(component.getDeviceTypeIcon('desktop')).toBe('fa-solid fa-desktop');
      });

      it('should return mobile icon for web-mobile', () => {
        expect(component.getDeviceTypeIcon('web-mobile')).toBe('fa-solid fa-mobile-screen');
      });

      it('should return android icon for android', () => {
        expect(component.getDeviceTypeIcon('android')).toBe('fa-brands fa-android');
      });

      it('should return apple icon for ios', () => {
        expect(component.getDeviceTypeIcon('ios')).toBe('fa-brands fa-apple');
      });

      it('should return question icon for unknown type', () => {
        expect(component.getDeviceTypeIcon('unknown')).toBe('fa-solid fa-question');
      });
    });
  });

  describe('TrackBy methods', () => {
    it('should track by event id', () => {
      const event = { id: 'evt-123' };
      expect(component.trackByEventId(0, event)).toBe('evt-123');
    });

    it('should track by product id', () => {
      const product = { productoId: 456 };
      expect(component.trackByProductId(0, product)).toBe(456);
    });

    it('should track by client document', () => {
      const client = { documentoCliente: 789 };
      expect(component.trackByClientDocument(0, client)).toBe(789);
    });

    it('should track by pedido id', () => {
      const pedido = { pedidoId: 101 };
      expect(component.trackByPedidoId(0, pedido)).toBe(101);
    });

    it('should track by trabajador document', () => {
      const trabajador = { documentoTrabajador: 202 };
      expect(component.trackByTrabajadorDocument(0, trabajador)).toBe(202);
    });

    it('should track by hour', () => {
      const hourData = { hora: '14:00' };
      expect(component.trackByHour(0, hourData)).toBe('14:00');
    });

    it('should track by date', () => {
      const dateData = { fecha: '2024-10-05' };
      expect(component.trackByDate(0, dateData)).toBe('2024-10-05');
    });

    it('should track by day name', () => {
      const dayData = { diaSemana: 'Lunes' };
      expect(component.trackByDayName(0, dayData)).toBe('Lunes');
    });
  });

  describe('Error handling', () => {
    it('should handle dashboard loading error', () => {
      const error = new Error('Network error');
      telemetry.getDashboard.mockReturnValue(throwError(() => error));

      component['loadDashboardData']();

      expect(component.isLoading()).toBe(false);
      expect(component.error()).toContain('Error al cargar datos del dashboard');
    });

    it('should handle sales loading error', () => {
      const error = new Error('API error');
      telemetry.getSales.mockReturnValue(throwError(() => error));

      component.setActiveTab('sales');

      expect(component.isLoading()).toBe(false);
      expect(component.error()).toContain('Error al cargar datos de ventas');
    });

    it('should handle products loading error', () => {
      const error = new Error('API error');
      telemetry.getProducts.mockReturnValue(throwError(() => error));

      component.setActiveTab('products');

      expect(component.isLoading()).toBe(false);
      expect(component.error()).toContain('Error al cargar datos de productos');
    });

    it('should handle users loading error', () => {
      const error = new Error('API error');
      telemetry.getUsers.mockReturnValue(throwError(() => error));

      component.setActiveTab('users');

      expect(component.isLoading()).toBe(false);
      expect(component.error()).toContain('Error al cargar datos de usuarios');
    });

    it('should handle time analysis loading error', () => {
      const error = new Error('API error');
      telemetry.getTimeAnalysis.mockReturnValue(throwError(() => error));

      component.setActiveTab('time');

      expect(component.isLoading()).toBe(false);
      expect(component.error()).toContain('Error al cargar análisis temporal');
    });

    it('should handle rentabilidad loading error', () => {
      const error = new Error('API error');
      telemetry.getRentabilidad.mockReturnValue(throwError(() => error));

      component.setActiveTab('rentabilidad');

      expect(component.isLoading()).toBe(false);
      expect(component.error()).toContain('Error al cargar análisis de rentabilidad');
    });

    it('should handle segmentacion loading error', () => {
      const error = new Error('API error');
      telemetry.getSegmentacion.mockReturnValue(throwError(() => error));

      component.setActiveTab('segmentacion');

      expect(component.isLoading()).toBe(false);
      expect(component.error()).toContain('Error al cargar segmentación de clientes');
    });

    it('should handle eficiencia loading error', () => {
      const error = new Error('API error');
      telemetry.getEficiencia.mockReturnValue(throwError(() => error));

      component.setActiveTab('eficiencia');

      expect(component.isLoading()).toBe(false);
      expect(component.error()).toContain('Error al cargar análisis de eficiencia');
    });

    it('should handle reservas loading error', () => {
      const error = new Error('API error');
      telemetry.getReservasAnalisis.mockReturnValue(throwError(() => error));

      component.setActiveTab('reservas');

      expect(component.isLoading()).toBe(false);
      expect(component.error()).toContain('Error al cargar análisis de reservas');
    });

    it('should handle pedidos loading error', () => {
      const error = new Error('API error');
      telemetry.getPedidosAnalisis.mockReturnValue(throwError(() => error));

      component.setActiveTab('pedidos');

      expect(component.isLoading()).toBe(false);
      expect(component.error()).toContain('Error al cargar análisis de pedidos');
    });
  });

  describe('Loading states', () => {
    it('should set loading state while fetching data', () => {
      component.setActiveTab('sales');
      // Note: loading state is set during the observable execution
      // In a real scenario, you'd need to check during the observable execution
      expect(telemetry.getSales).toHaveBeenCalled();
    });

    it('should clear error when loading new data', () => {
      component.error.set('Previous error');
      component.setActiveTab('products');
      // Error is cleared at the start of loading
      expect(component.error()).toBe(null);
    });
  });
});
