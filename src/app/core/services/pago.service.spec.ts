import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { PagoService } from './pago.service';

describe('PagoService', () => {
  let service: PagoService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(PagoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('createPago debe llamar POST y manejar respuesta', () => {
    const payload = { monto: 10 } as any;
    service.createPago(payload as any).subscribe((resp) => {
      expect(resp).toEqual({ ok: true });
    });
    const req = httpMock.expectOne(`${environment.apiUrl}/pagos`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ ok: true });
  });

  it('getPagos debe llamar GET', () => {
    service.getPagos({ q: 'x' } as any).subscribe();
    const req = httpMock.expectOne((r) => r.url === `${environment.apiUrl}/pagos`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('q')).toBe('x');
    req.flush({ data: [] });
  });

  it('getPagoById debe llamar GET con query', () => {
    service.getPagoById(7).subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/pagos/search?id=7`);
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('updatePago debe llamar PUT', () => {
    service.updatePago(9, { a: 1 } as any).subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/pagos?id=9`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ a: 1 });
    req.flush({});
  });

  it('deletePago debe llamar DELETE', () => {
    service.deletePago(5).subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/pagos?id=5`);
    expect(req.request.method).toBe('DELETE');
    req.flush({});
  });

  afterEach(() => {
    httpMock.verify();
  });
});
