import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { mockCambioHorarioResponse } from '../../shared/mocks/cambios-horario.mock';
import {
  mockRestauranteResponse,
  mockRestaurantesResponse,
} from '../../shared/mocks/restaurante.mock';
import { RestauranteService } from './restaurante.service';

describe('RestauranteService', () => {
  let service: RestauranteService;
  let httpTestingController: HttpTestingController;

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

    const req = httpTestingController.expectOne(`${service['baseUrl']}/restaurantes/search?id=1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockRestauranteResponse);
  });

  it('should return cambios horario data from getCambiosHorario', () => {
    service.getCambiosHorario().subscribe((response) => {
      expect(response).toEqual(mockCambioHorarioResponse);
    });

    const req = httpTestingController.expectOne(`${service['baseUrl']}/cambios_horario/actual`);
    expect(req.request.method).toBe('GET');
    req.flush(mockCambioHorarioResponse);
  });

  it('should list restaurantes', () => {
    service.listRestaurantes().subscribe((response) => {
      expect(response).toEqual(mockRestaurantesResponse);
    });

    const req = httpTestingController.expectOne(`${service['baseUrl']}/restaurantes`);
    expect(req.request.method).toBe('GET');
    req.flush(mockRestaurantesResponse);
  });
});
