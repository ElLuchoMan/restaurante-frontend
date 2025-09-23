import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { PerformanceService } from '../../../core/services/performance.service';
import { TelemetryService } from '../../../core/services/telemetry.service';
import { mockDashboardData } from '../../../shared/mocks/telemetry.mock';
import {
  createPerformanceServiceMock,
  createTelemetryServiceMock,
} from '../../../shared/mocks/test-doubles';
import { TelemetryDashboardComponent } from './telemetry-dashboard.component';

describe('TelemetryDashboardComponent', () => {
  let component: TelemetryDashboardComponent;
  let fixture: ComponentFixture<TelemetryDashboardComponent>;
  let telemetry: jest.Mocked<TelemetryService>;

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

    // Configurar mocks para métodos del backend
    telemetryMock.getDashboard.mockReturnValue(of(mockDashboardData));
    telemetryMock.getSales.mockReturnValue(of({ code: 200, message: 'OK', data: {} as any }));
    telemetryMock.getProducts.mockReturnValue(of({ code: 200, message: 'OK', data: {} as any }));
    telemetryMock.getUsers.mockReturnValue(of({ code: 200, message: 'OK', data: {} as any }));
    telemetryMock.getTimeAnalysis.mockReturnValue(
      of({ code: 200, message: 'OK', data: {} as any }),
    );

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
    fixture.detectChanges();
  });

  it('should create and load dashboard data', () => {
    expect(component).toBeTruthy();
    expect(telemetry.getDashboard).toHaveBeenCalledWith({ periodo: 'ultimo_mes' });
    expect(component.dashboardData()).toEqual(mockDashboardData.data);
  });

  it('should switch tabs and load appropriate data', () => {
    component.setActiveTab('sales');
    expect(component.activeTab()).toBe('sales');
    expect(telemetry.getSales).toHaveBeenCalled();
  });

  it('should refresh local telemetry data', () => {
    component.refreshLocal();
    expect(component.localMetrics()).toBeDefined();
  });

  it('should clear local telemetry data', () => {
    component.clearLocal();
    expect(telemetry.clear).toHaveBeenCalled();
  });
});
