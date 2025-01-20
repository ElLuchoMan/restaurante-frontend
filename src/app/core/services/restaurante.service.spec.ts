import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { RestauranteService } from './restaurante.service';
import { ApiResponse } from '../../shared/models/api-response.model';
import { Restaurante } from '../../shared/models/restaurante.model';
import { CambioHorario } from '../../shared/models/cambio-horario.model';

describe('RestauranteService', () => {
  let service: RestauranteService;
  let httpTestingController: HttpTestingController;

  const mockRestauranteResponse: ApiResponse<Restaurante> = {
    code: 200,
    message: 'Restaurante obtenido correctamente',
    data: {
      pk_id_restaurante: 1,
      nombre_restaurante: 'Restaurante Prueba',
      HORA_APERTURA: '09:00',
      dias_laborales: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
    },
  };

  const mockCambioHorarioResponse: ApiResponse<CambioHorario> = {
    code: 200,
    message: 'Cambios de horario obtenidos correctamente',
    data: {
      PK_ID_CAMBIO_HORARIO: 1,
      FECHA: '2025-01-20',
      HORA_APERTURA: '00:00',
      HORA_CIERRE: '23:59',
      ABIERTO: false,
    },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [RestauranteService],
    });

    service = TestBed.inject(RestauranteService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return restaurante data from getRestauranteInfo', () => {
    service.getRestauranteInfo().subscribe((response) => {
      expect(response).toEqual(mockRestauranteResponse);
    });

    const req = httpTestingController.expectOne(`${service['baseUrl']}restaurantes/search?id=1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockRestauranteResponse);
  });

  it('should return cambios horario data from getCambiosHorario', () => {
    service.getCambiosHorario().subscribe((response) => {
      expect(response).toEqual(mockCambioHorarioResponse);
    });

    const req = httpTestingController.expectOne(`${service['baseUrl']}cambios_horario/actual`);
    expect(req.request.method).toBe('GET');
    req.flush(mockCambioHorarioResponse); 
  });
});
