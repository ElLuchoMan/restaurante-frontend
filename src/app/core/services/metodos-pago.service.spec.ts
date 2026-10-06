import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import {
  mockMetodoPagoBody,
  mockMetodoPagoCreateResponse,
  mockMetodoPagoDeleteResponse,
  mockMetodoPagoRespone,
  mockMetodoPagoUpdateBody,
  mockMetodoPagoUpdateResponse,
  mockMetodosPagoRespone,
} from '../../shared/mocks/metodo-pago.mock';
import { MetodosPagoService } from './metodos-pago.service';

describe('MetodosPagoService', () => {
  let service: MetodosPagoService;
  let http: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/metodos_pago`;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(MetodosPagoService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('gets all methods', () => {
    service.getAll().subscribe((res) => expect(res).toEqual(mockMetodosPagoRespone));
    const req = http.expectOne(baseUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockMetodosPagoRespone);
  });

  it('gets method by id', () => {
    service.getById(5).subscribe((res) => expect(res).toEqual(mockMetodoPagoRespone));
    const req = http.expectOne(`${baseUrl}/search?id=5`);
    expect(req.request.method).toBe('GET');
    req.flush(mockMetodoPagoRespone);
  });

  it('creates a method', () => {
    service
      .create(mockMetodoPagoBody)
      .subscribe((res) => expect(res).toEqual(mockMetodoPagoCreateResponse));
    const req = http.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockMetodoPagoBody);
    req.flush(mockMetodoPagoCreateResponse);
  });

  it('updates a method', () => {
    service
      .update(1, mockMetodoPagoUpdateBody)
      .subscribe((res) => expect(res).toEqual(mockMetodoPagoUpdateResponse));
    const req = http.expectOne(`${baseUrl}?id=1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(mockMetodoPagoUpdateBody);
    req.flush(mockMetodoPagoUpdateResponse);
  });

  it('updates a method with a partial body (merge)', () => {
    service.update(1, { detalle: '3007654321' }).subscribe();
    const req = http.expectOne(`${baseUrl}?id=1`);
    expect(req.request.body).toEqual({ detalle: '3007654321' });
    req.flush(mockMetodoPagoUpdateResponse);
  });

  it('deletes a method', () => {
    service.delete(1).subscribe((res) => expect(res).toEqual(mockMetodoPagoDeleteResponse));
    const req = http.expectOne(`${baseUrl}?id=1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(mockMetodoPagoDeleteResponse);
  });
});
