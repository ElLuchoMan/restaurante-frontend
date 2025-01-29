import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FooterComponent } from './footer.component';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { RestauranteService } from '../../../core/services/restaurante.service';
import { of, throwError } from 'rxjs';

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

  const mockRestauranteResponse = {
    code: 200,
    message: 'Restaurante obtenido correctamente',
    data: {
      restauranteId: 1,
      nombreRestaurante: 'Restaurante Prueba',
      horaApertura: '09:00',
      diasLaborales: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']
    },
  };

  const mockCambioHorarioResponse = {
    code: 200,
    message: 'Cambios de horario obtenidos correctamente',
    data: {
      cambioHorarioId: 1,
      fechaCambioHorario: '2025-01-20',
      horaApertura: '00:00',
      horaCierre: '23:59',
      abierto: false
    }
  };

  const mockCambioHorarioAbiertoResponse = {
    code: 200,
    message: 'Cambios de horario obtenidos correctamente',
    data: {
      cambioHorarioId: 2,
      fechaCambioHorario: '2021-08-01',
      horaApertura: '09:00',
      horaCierre: '18:00',
      abierto: true
    }
  };

  const mockError = new Error('Test error');

  beforeEach(async () => {
    const restauranteServiceMock = {
      getRestauranteInfo: jest.fn(),
      getCambiosHorario: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [FooterComponent],
      providers: [
        { provide: RestauranteService, useValue: restauranteServiceMock },
        HttpClient,
        HttpHandler
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    restauranteService = TestBed.inject(RestauranteService) as jest.Mocked<RestauranteService>;

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

  it('should set horario and estado correctly when changes are received and status is "Abierto"', () => {
    restauranteService.getCambiosHorario.mockReturnValue(of(mockCambioHorarioAbiertoResponse));
    fixture.detectChanges();

    expect(component.horaApertura).toBe('09:00');
    expect(component.horaCierre).toBe('18:00');
    expect(component.estado).toBe('Abierto');
    expect(component.cambioHorario).toEqual(mockCambioHorarioAbiertoResponse);
  });

  it('should log an error when getCambiosHorario fails', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    restauranteService.getCambiosHorario.mockReturnValue(throwError(() => mockError));
    fixture.detectChanges();

    expect(consoleSpy).toHaveBeenCalledWith(mockError);
    consoleSpy.mockRestore();
  });
  it('should set estadoActual to "Cerrado" when current time is outside of opening hours', () => {
    restauranteService.getRestauranteInfo.mockReturnValue(of(mockRestauranteResponse));
    restauranteService.getCambiosHorario.mockReturnValue(of(mockCambioHorarioResponse));
    component.horaApertura = '08:00';
    component.horaCierre = '20:00';

    jest.spyOn(globalThis, 'Date').mockImplementation(() =>
    ({
      toLocaleTimeString: () => '21:00'
    } as unknown as Date)
    );

    fixture.detectChanges();

    expect(component.estadoActual).toBe('Cerrado');
  });
});
