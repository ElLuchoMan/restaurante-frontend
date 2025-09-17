import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import {
  mockCambioHorarioResponse,
  mockRestauranteCreateBody,
  mockRestauranteDeleteResponse,
  mockRestauranteResponse,
  mockRestaurantesResponse,
} from '../../shared/mocks/restaurante.mock';
import { ApiResponse } from '../../shared/models/api-response.model';
import { CambioHorario } from '../../shared/models/cambio-horario.model';
import { Restaurante } from '../../shared/models/restaurante.model';
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
    service.getRestauranteInfo().subscribe((response: ApiResponse<Restaurante>) => {
      expect(response).toEqual(mockRestaurantesResponse);
    });

    const req = httpTestingController.expectOne(`${service['baseUrl']}/restaurantes/search?id=1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockRestaurantesResponse);
  });

  it('should return cambios horario data from getCambiosHorario', () => {
    service.getCambiosHorario().subscribe((response: ApiResponse<CambioHorario>) => {
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

  it('should create a restaurante', () => {
    const payload: Partial<Restaurante> = { ...mockRestauranteCreateBody };
    const mockResponse = { ...mockRestauranteResponse, data: { ...mockRestauranteResponse.data, ...payload } };

    service.createRestaurante(payload).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpTestingController.expectOne(`${service['baseUrl']}/restaurantes`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(mockResponse);
  });

  it('should update a restaurante', () => {
    const payload: Partial<Restaurante> = { nombreRestaurante: 'Actualizado' };
    const mockResponse = { ...mockRestauranteResponse, data: { ...mockRestauranteResponse.data, ...payload } };

    service.updateRestaurante(5, payload).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpTestingController.expectOne(`${service['baseUrl']}/restaurantes?id=5`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(payload);
    req.flush(mockResponse);
  });

  it('should delete a restaurante', () => {
    service.deleteRestaurante(5).subscribe((response) => {
      expect(response).toEqual(mockRestauranteDeleteResponse);
    });

    const req = httpTestingController.expectOne(`${service['baseUrl']}/restaurantes?id=5`);
    expect(req.request.method).toBe('DELETE');
    req.flush(mockRestauranteDeleteResponse);
  });
});
