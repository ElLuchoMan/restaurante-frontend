import { HttpClient, HttpHandler } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { LoggingService, LogLevel } from '../../../core/services/logging.service';
import { RestauranteService } from '../../../core/services/restaurante.service';
import {
  mockCambioHorarioAbiertoResponse,
  mockCambioHorarioResponse,
  mockRestauranteResponse,
} from '../../mocks/restaurante.mock';
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
    const restauranteServiceMock = {
      getRestauranteInfo: jest.fn(),
      getCambiosHorario: jest.fn(),
    };

    const loggingServiceMock = {
      log: jest.fn(),
    } as unknown as jest.Mocked<LoggingService>;

    await TestBed.configureTestingModule({
      imports: [FooterComponent],
      providers: [
        { provide: RestauranteService, useValue: restauranteServiceMock },
        { provide: LoggingService, useValue: loggingServiceMock },
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
        } as unknown as Date),
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
        } as unknown as Date),
    );

    fixture.detectChanges();

    expect(component.estadoActual).toBe('Abierto');

    dateSpy.mockRestore();
  });
});
