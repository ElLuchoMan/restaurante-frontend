import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { estadoDomicilio } from '../../shared/constants';
import { createHandleErrorServiceMock } from '../../shared/mocks/test-doubles';
import { ApiResponse } from '../../shared/models/api-response.model';
import { DomicilioDetalle } from '../../shared/models/domicilio.model';
import {
  mockDomicilioBody,
  mockDomicilioRespone,
  mockDomiciliosRespone,
  mockDomicilioUpdateBody,
  mockDomicilioUpdateResponse,
} from './../../shared/mocks/domicilio.mock';
import { DomicilioService } from './domicilio.service';
import { HandleErrorService } from './handle-error.service';

describe('DomicilioService', () => {
  let service: DomicilioService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/domicilios`;

  const mockHandleErrorService = createHandleErrorServiceMock();

  beforeEach(() => {
    mockHandleErrorService.handleError.mockReset();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        DomicilioService,
        { provide: HandleErrorService, useValue: mockHandleErrorService },
      ],
    });
    service = TestBed.inject(DomicilioService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getDomicilios', () => {
    it('should GET domicilios sin parámetros', () => {
      const mockResponse = mockDomiciliosRespone;

      service.getDomicilios().subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(
        (req) => req.url === baseUrl && req.params.keys().length === 0,
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should GET domicilios with query params', () => {
      const mockResponse = mockDomiciliosRespone;
      service
        .getDomicilios({
          direccion: 'Carrera',
          telefono: '3006543210',
          fecha: '2024-12-30',
          estado: estadoDomicilio.EN_CAMINO,
          updated_by: 'admin',
          trabajador: 1015466495,
        })
        .subscribe((response) => {
          expect(response).toEqual(mockResponse);
        });

      const req = httpMock.expectOne((req) => req.url === baseUrl);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('direccion')).toBe('Carrera');
      expect(req.request.params.get('telefono')).toBe('3006543210');
      expect(req.request.params.get('fecha')).toBe('2024-12-30');
      expect(req.request.params.get('estado')).toBe('EN_CAMINO');
      expect(req.request.params.get('updated_by')).toBe('admin');
      expect(req.request.params.get('trabajador')).toBe('1015466495');
      req.flush(mockResponse);
    });

    it('should omit null/undefined filters', () => {
      service
        .getDomicilios({ direccion: undefined, fecha: null as unknown as string, telefono: '1' })
        .subscribe();
      const req = httpMock.expectOne((req) => req.url === baseUrl);
      expect(req.request.params.keys()).toEqual(['telefono']);
      req.flush(mockDomiciliosRespone);
    });

    it('should handle error when GET domicilios', () => {
      service.getDomicilios({ direccion: 'test' }).subscribe({
        error: (error) => {
          expect(error).toBeTruthy();
        },
      });
      const req = httpMock.expectOne(
        (r) => r.url === baseUrl && r.params.get('direccion') === 'test',
      );
      req.error(new ErrorEvent('API error'));
      expect(mockHandleErrorService.handleError).toHaveBeenCalled();
    });
  });

  describe('getDomicilioById', () => {
    it('should GET a domicilio by id', () => {
      const id = 1;
      const mockResponse: ApiResponse<DomicilioDetalle> = {
        code: 200,
        message: 'Domicilio encontrado',
        data: {
          domicilio: mockDomicilioRespone.data,
          cliente: { documento: 1015466495, nombre: 'Ana', apellido: 'Gómez' },
          pedido: {
            pedidoId: 3,
            pagoId: null,
            montoPago: 0,
            subtotalProductos: 6000,
            total: 6000,
            productos: [
              { pk_id_producto: 7, nombre: 'Arepa', cantidad: 2, precio: 3000, subtotal: 6000 },
            ],
          },
        },
      };

      service.getDomicilioById(id).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/search?id=${id}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle error when GET domicilio by id', () => {
      const id = 1;
      service.getDomicilioById(id).subscribe({
        error: (error) => {
          expect(error).toBeTruthy();
        },
      });
      const req = httpMock.expectOne(`${baseUrl}/search?id=${id}`);
      req.error(new ErrorEvent('API error'));
      expect(mockHandleErrorService.handleError).toHaveBeenCalled();
    });
  });

  describe('createDomicilio', () => {
    it('should POST a new domicilio', () => {
      const newDomicilio = mockDomicilioBody;
      const mockResponse = mockDomicilioRespone;

      service.createDomicilio(newDomicilio).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newDomicilio);
      req.flush(mockResponse);
    });

    it('should handle error when POST domicilio', () => {
      service.createDomicilio(mockDomicilioBody).subscribe({
        error: (error) => {
          expect(error).toBeTruthy();
        },
      });
      const req = httpMock.expectOne(baseUrl);
      req.error(new ErrorEvent('API error'));
      expect(mockHandleErrorService.handleError).toHaveBeenCalled();
    });
  });

  describe('updateDomicilio', () => {
    it('should PUT updated domicilio', () => {
      const id = 1;
      const updatedData = { ...mockDomicilioUpdateBody, direccion: 'Nueva Direccion' };
      const mockResponse = mockDomicilioUpdateResponse;

      service.updateDomicilio(id, updatedData).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}?id=${id}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updatedData);
      req.flush(mockResponse);
    });

    it('should handle error when PUT domicilio', () => {
      const id = 1;
      const updatedData = { direccion: 'Dir' };
      service.updateDomicilio(id, updatedData).subscribe({
        error: (error) => {
          expect(error).toBeTruthy();
        },
      });
      const req = httpMock.expectOne(`${baseUrl}?id=${id}`);
      req.error(new ErrorEvent('API error'));
      expect(mockHandleErrorService.handleError).toHaveBeenCalled();
    });
  });

  describe('deleteDomicilio', () => {
    it('should DELETE a domicilio', () => {
      const id = 1;
      const mockResponse: ApiResponse<undefined> = {
        code: 200,
        message: 'Domicilio eliminado',
        data: undefined,
      };

      service.deleteDomicilio(id).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}?id=${id}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);
    });

    it('should handle error when DELETE domicilio', () => {
      const id = 1;
      service.deleteDomicilio(id).subscribe({
        error: (error) => {
          expect(error).toBeTruthy();
        },
      });
      const req = httpMock.expectOne(`${baseUrl}?id=${id}`);
      req.error(new ErrorEvent('API error'));
      expect(mockHandleErrorService.handleError).toHaveBeenCalled();
    });
  });

  describe('asignarDomiciliario', () => {
    it('should POST to asignar un domiciliario', () => {
      const domicilioId = 1;
      const trabajadorId = 2;
      const mockResponse = mockDomicilioRespone;

      service.asignarDomiciliario(domicilioId, trabajadorId).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const expectedUrl = `${baseUrl}/asignar?domicilio_id=${domicilioId}&trabajador_id=${trabajadorId}`;
      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({});
      req.flush(mockResponse);
    });

    it('should handle error when POST asignar domiciliario', () => {
      const domicilioId = 1;
      const trabajadorId = 2;
      service.asignarDomiciliario(domicilioId, trabajadorId).subscribe({
        error: (error) => {
          expect(error).toBeTruthy();
        },
      });
      const expectedUrl = `${baseUrl}/asignar?domicilio_id=${domicilioId}&trabajador_id=${trabajadorId}`;
      const req = httpMock.expectOne(expectedUrl);
      req.error(new ErrorEvent('API error'));
      expect(mockHandleErrorService.handleError).toHaveBeenCalled();
    });
  });
});
