import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TelemetryService } from '../../../core/services/telemetry.service';
import { createTelemetryServiceMock } from '../../../shared/mocks/test-doubles';
import { TelemetryDashboardComponent } from './telemetry-dashboard.component';

describe('TelemetryDashboardComponent', () => {
  let component: TelemetryDashboardComponent;
  let fixture: ComponentFixture<TelemetryDashboardComponent>;
  let telemetry: jest.Mocked<TelemetryService>;

  beforeEach(async () => {
    const telemetryMock = createTelemetryServiceMock() as jest.Mocked<TelemetryService>;
    telemetryMock.getAggregatedMetrics.mockReturnValue({
      login: { attempts: 3, successes: 2, failures: 1 },
      purchasesByPaymentMethod: { Nequi: 2, Efectivo: 1 },
      productsCount: { Hamburguesa: 2, Gaseosa: 1 },
      usersByPurchases: { '42': 2 },
      salesByHour: { '10': 1, '11': 2 },
      salesByWeekday: { '1': 3 },
    });
    telemetryMock.getEvents.mockReturnValue([]);

    await TestBed.configureTestingModule({
      imports: [TelemetryDashboardComponent],
      providers: [{ provide: TelemetryService, useValue: telemetryMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(TelemetryDashboardComponent);
    component = fixture.componentInstance;
    telemetry = TestBed.inject(TelemetryService) as jest.Mocked<TelemetryService>;
    fixture.detectChanges();
  });

  it('should create and render aggregated metrics', () => {
    expect(component).toBeTruthy();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Inicios de sesión');
    expect(compiled.textContent).toContain('Intentos: 3');
    expect(compiled.textContent).toContain('Éxitos: 2');
    expect(compiled.textContent).toContain('Fallos: 1');
    expect(compiled.textContent).toContain('Nequi: 2');
  });
});
