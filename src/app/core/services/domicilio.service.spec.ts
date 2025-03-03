import { mockDomicilioBody, mockDomicilioRespone, mockDomiciliosRespone } from './../../shared/mocks/domicilio.mock';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DomicilioService } from './domicilio.service';
import { environment } from '../../../environments/environment';
import { Domicilio } from '../../shared/models/domicilio.model';
import { ApiResponse } from '../../shared/models/api-response.model';
import { estadoPago } from '../../shared/constants';

describe('DomicilioService', () => {
  let service: DomicilioService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/domicilios`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DomicilioService]
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

      service.getDomicilios(params).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(req =>
        req.url === baseUrl && req.params.get('filter') === 'test'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getDomicilioById', () => {
    it('should GET a domicilio by id', () => {
      const id = 1;
      const mockResponse = mockDomicilioRespone;

      service.getDomicilioById(id).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/search?id=${id}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('createDomicilio', () => {
    it('should POST a new domicilio', () => {
      const newDomicilio = mockDomicilioBody;
      const mockResponse = mockDomicilioRespone;

      service.createDomicilio(newDomicilio).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newDomicilio);
      req.flush(mockResponse);
    });
  });

  describe('updateDomicilio', () => {
    it('should PUT updated domicilio', () => {
      const id = 1;
      const updatedData: Partial<Domicilio> = { entregado: true };
      const mockResponse = mockDomicilioRespone;

      service.updateDomicilio(id, updatedData).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}?id=${id}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updatedData);
      req.flush(mockResponse);
    });
  });

  describe('deleteDomicilio', () => {
    it('should DELETE a domicilio', () => {
      const id = 1;
      const mockResponse: ApiResponse<any> = {
        code: 200,
        message: 'Deleted',
        data: null
      };

      service.deleteDomicilio(id).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}?id=${id}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);
    });
  });

  describe('asignarDomiciliario', () => {
    it('should POST to asignar un domiciliario', () => {
      const domicilioId = 1;
      const trabajadorId = 2;
      const mockResponse = mockDomicilioRespone;

      service.asignarDomiciliario(domicilioId, trabajadorId).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const expectedUrl = `${baseUrl}/asignar?domicilio_id=${domicilioId}&trabajador_id=${trabajadorId}`;
      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({});
      req.flush(mockResponse);
    });
  });
});
