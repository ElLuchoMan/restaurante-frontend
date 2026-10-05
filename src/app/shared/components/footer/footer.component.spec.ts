import { HttpClient, HttpHandler } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';

import { LoggingService, LogLevel } from '../../../core/services/logging.service';
import { RestauranteService } from '../../../core/services/restaurante.service';
import {
  mockCambioHorarioAbiertoResponse,
  mockCambioHorarioResponse,
} from '../../mocks/cambios-horario.mock';
import { mockRestauranteResponse } from '../../mocks/restaurante.mock';
import { createLoggingServiceMock, createRestauranteServiceMock } from '../../mocks/test-doubles';
import { FooterComponent } from './footer.component';

beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;
  let restauranteService: jest.Mocked<RestauranteService>;
  let loggingService: jest.Mocked<LoggingService>;

  const mockError = new Error('Test error');

  beforeEach(async () => {
    const restauranteServiceMock =
      createRestauranteServiceMock() as jest.Mocked<RestauranteService>;
    const loggingServiceMock = createLoggingServiceMock() as unknown as jest.Mocked<LoggingService>;

    await TestBed.configureTestingModule({
      imports: [FooterComponent],
      providers: [
        { provide: RestauranteService, useValue: restauranteServiceMock },
        { provide: LoggingService, useValue: loggingServiceMock },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              params: {},
              queryParams: {},
              data: {},
            },
          },
        },
        HttpClient,
        HttpHandler,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    restauranteService = TestBed.inject(RestauranteService) as jest.Mocked<RestauranteService>;
    loggingService = TestBed.inject(LoggingService) as jest.Mocked<LoggingService>;

    restauranteService.getRestauranteInfo.mockReturnValue(of(mockRestauranteResponse));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set restaurante data correctly', () => {
    restauranteService.getRestauranteInfo.mockReturnValue(of(mockRestauranteResponse));
    restauranteService.getCambiosHorario.mockReturnValue(of(mockCambioHorarioResponse));

    fixture.detectChanges();

    expect(component.restaurante).toEqual(mockRestauranteResponse);
  });

  it('should set horario and estado correctly when changes are received', () => {
    restauranteService.getCambiosHorario.mockReturnValue(of(mockCambioHorarioResponse));
    fixture.detectChanges();

    expect(component.estado).toBe('Cerrado');
    expect(component.horaApertura).toBe('No Aplica');
    expect(component.horaCierre).toBe('No Aplica');
    expect(component.cambioHorario).toEqual(mockCambioHorarioResponse);
  });

  it('should set horario and estado correctly when changes are received and status is "Cerrado"', () => {
    restauranteService.getCambiosHorario.mockReturnValue(of(mockCambioHorarioAbiertoResponse));
    fixture.detectChanges();

    expect(component.horaApertura).toBe('No Aplica');
    expect(component.horaCierre).toBe('No Aplica');
    expect(component.estado).toBe('Cerrado');
    expect(component.cambioHorario).toEqual(mockCambioHorarioAbiertoResponse);
  });

  it('should log an error when getCambiosHorario fails', () => {
    restauranteService.getCambiosHorario.mockReturnValue(throwError(() => mockError));
    fixture.detectChanges();

    expect(loggingService.log).toHaveBeenCalledWith(LogLevel.ERROR, mockError);
  });
  it('should set estadoActual to "Cerrado" when current time is outside of opening hours', () => {
    restauranteService.getRestauranteInfo.mockReturnValue(of(mockRestauranteResponse));
    restauranteService.getCambiosHorario.mockReturnValue(of(mockCambioHorarioResponse));
    component.horaApertura = '08:00';
    component.horaCierre = '20:00';

    jest.spyOn(globalThis, 'Date').mockImplementation(
      () =>
        ({
          toLocaleTimeString: () => '21:00',
          getFullYear: () => 2025,
        }) as unknown as Date,
    );

    fixture.detectChanges();

    expect(component.estadoActual).toBe('Cerrado');
  });
  it('should set estadoActual to "Abierto" when current time is within opening hours', () => {
    restauranteService.getRestauranteInfo.mockReturnValue(of(mockRestauranteResponse));
    restauranteService.getCambiosHorario.mockReturnValue(of(mockCambioHorarioResponse));

    component.horaApertura = '08:00';
    component.horaCierre = '20:00';
    const dateSpy = jest.spyOn(globalThis, 'Date').mockImplementation(
      () =>
        ({
          toLocaleTimeString: () => '12:00',
          getFullYear: () => 2025,
        }) as unknown as Date,
    );

    fixture.detectChanges();

    expect(component.estadoActual).toBe('Abierto');

    dateSpy.mockRestore();
  });

  describe('WebView detection', () => {
    beforeEach(() => {
      restauranteService.getCambiosHorario.mockReturnValue(of({ data: undefined } as any));
    });

    afterEach(() => {
      delete (window as any).Capacitor;
    });

    it('should be false when Capacitor is not defined', () => {
      delete (window as any).Capacitor;
      fixture.detectChanges();
      expect(component.isWebView).toBe(false);
    });

    it('should be false when Capacitor has no getPlatform function', () => {
      (window as any).Capacitor = {};
      fixture.detectChanges();
      expect(component.isWebView).toBe(false);
    });

    it('should be false when Capacitor platform is web', () => {
      (window as any).Capacitor = { getPlatform: () => 'web' };
      fixture.detectChanges();
      expect(component.isWebView).toBe(false);
    });

    it('should be true when Capacitor platform is native', () => {
      (window as any).Capacitor = { getPlatform: () => 'android' };
      fixture.detectChanges();
      expect(component.isWebView).toBe(true);
    });

    it('should skip detection when not running in the browser', () => {
      (window as any).Capacitor = { getPlatform: () => 'android' };
      (component as any).platformId = 'server';
      fixture.detectChanges();
      expect(component.isWebView).toBe(false);
    });
  });

  describe('horario edge cases', () => {
    it('should keep default hours when response.data is undefined', () => {
      restauranteService.getCambiosHorario.mockReturnValue(of({ data: undefined } as any));
      fixture.detectChanges();
      expect(component.horaApertura).toBe('08:00');
      expect(component.horaCierre).toBe('20:00');
      expect(component.estado).toBe('Abierto');
    });

    it('should use provided hours and keep estado when abierto is true', () => {
      restauranteService.getCambiosHorario.mockReturnValue(
        of({ data: { horaApertura: '09:00', horaCierre: '22:00', abierto: true } } as any),
      );
      fixture.detectChanges();
      expect(component.horaApertura).toBe('09:00');
      expect(component.horaCierre).toBe('22:00');
      expect(component.estado).toBe('Abierto');
    });

    it('should fall back to defaults when hours are null/undefined', () => {
      restauranteService.getCambiosHorario.mockReturnValue(
        of({ data: { horaApertura: null, horaCierre: undefined, abierto: true } } as any),
      );
      fixture.detectChanges();
      expect(component.horaApertura).toBe('08:00');
      expect(component.horaCierre).toBe('20:00');
    });

    it('should not compute estadoActual when hours are empty', () => {
      restauranteService.getCambiosHorario.mockReturnValue(of({ data: undefined } as any));
      component.horaApertura = '';
      component.horaCierre = '';
      component.estadoActual = 'Inicial';
      fixture.detectChanges();
      expect(component.estadoActual).toBe('Inicial');
    });
  });

  describe('esPaginaUbicacion', () => {
    it('should return true when the url contains /ubicacion', () => {
      (component as any).router = { url: '/ubicacion' };
      expect(component.esPaginaUbicacion()).toBe(true);
    });

    it('should return false otherwise', () => {
      (component as any).router = { url: '/home' };
      expect(component.esPaginaUbicacion()).toBe(false);
    });
  });
});
