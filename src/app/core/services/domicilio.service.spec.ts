import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/models/api-response.model';
import { Domicilio, DomicilioRequest } from '../../shared/models/domicilio.model';
import {
  mockDomicilioBody,
  mockDomicilioRespone,
  mockDomiciliosRespone,
} from './../../shared/mocks/domicilio.mock';
import { DomicilioService } from './domicilio.service';
import { HandleErrorService } from './handle-error.service';

describe('DomicilioService', () => {
  let service: DomicilioService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/domicilios`;

  const mockHandleErrorService = {
    handleError: jest.fn((error: any) => {
      throw error;
    }),
  };

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
    it('should GET domicilios with query params', () => {
      const mockResponse = mockDomiciliosRespone;
      const params = { filter: 'test' };

      service.getDomicilios(params).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(
        (req) => req.url === baseUrl && req.params.get('filter') === 'test',
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle error when GET domicilios', () => {
      const params = { filter: 'test' };
      service.getDomicilios(params).subscribe({
        error: (error) => {
          expect(error).toBeTruthy();
        },
      });
      const req = httpMock.expectOne((r) => r.url === baseUrl && r.params.get('filter') === 'test');
      req.error(new ErrorEvent('API error'));
      expect(mockHandleErrorService.handleError).toHaveBeenCalled();
    });
  });

  describe('getDomicilioById', () => {
    it('should GET a domicilio by id', () => {
      const id = 1;
      const mockResponse = mockDomicilioRespone;

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
      const updatedData: DomicilioRequest = {
        ...mockDomicilioBody,
        direccion: 'Nueva Direccion',
      };
      const mockResponse = mockDomicilioRespone;

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
      const updatedData: Partial<DomicilioRequest> = { direccion: 'Dir' };
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
      const mockResponse: ApiResponse<any> = {
        code: 200,
        message: 'Deleted',
        data: null,
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
