import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { estadoPago } from '../../shared/constants';
import {
  mockPagoBody,
  mockPagoResponse,
  mockPagosResponse,
  mockPagoUpdateBody,
  mockPagoUpdateResponse,
} from '../../shared/mocks/pago.mock';
import { createHandleErrorServiceMock } from '../../shared/mocks/test-doubles';
import { HandleErrorService } from './handle-error.service';
import { PagoService } from './pago.service';

describe('PagoService', () => {
  let service: PagoService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/pagos`;
  const mockHandleErrorService = createHandleErrorServiceMock();

  beforeEach(() => {
    mockHandleErrorService.handleError.mockReset();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: HandleErrorService, useValue: mockHandleErrorService }],
    });
    service = TestBed.inject(PagoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('createPago llama POST con el cuerpo del pago', () => {
    service.createPago(mockPagoBody).subscribe((resp) => {
      expect(resp).toEqual(mockPagoResponse);
    });
    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockPagoBody);
    req.flush(mockPagoResponse);
  });

  it('createPago maneja errores', () => {
    service.createPago(mockPagoBody).subscribe({
      next: () => fail('should have failed'),
      error: (err) => expect(err).toBeTruthy(),
    });
    httpMock.expectOne(baseUrl).error(new ErrorEvent('Network error'));
    expect(mockHandleErrorService.handleError).toHaveBeenCalled();
  });

  it('getPagos sin filtros no agrega parámetros', () => {
    service.getPagos().subscribe((resp) => expect(resp).toEqual(mockPagosResponse));
    const req = httpMock.expectOne((r) => r.url === baseUrl && r.params.keys().length === 0);
    expect(req.request.method).toBe('GET');
    req.flush(mockPagosResponse);
  });

  it('getPagos envía los filtros con los nombres del back y omite null/undefined', () => {
    service
      .getPagos({
        fecha: '2024-12-24',
        dia: 24,
        mes: 12,
        anio: 2024,
        estado: estadoPago.PAGADO,
        metodo_pago: 1,
      })
      .subscribe();
    const req = httpMock.expectOne((r) => r.url === baseUrl);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('fecha')).toBe('2024-12-24');
    expect(req.request.params.get('dia')).toBe('24');
    expect(req.request.params.get('mes')).toBe('12');
    expect(req.request.params.get('anio')).toBe('2024');
    expect(req.request.params.get('estado')).toBe('PAGADO');
    expect(req.request.params.get('metodo_pago')).toBe('1');
    req.flush(mockPagosResponse);

    service.getPagos({ mes: 1, estado: undefined, dia: null as unknown as number }).subscribe();
    const req2 = httpMock.expectOne((r) => r.url === baseUrl);
    expect(req2.request.params.keys()).toEqual(['mes']);
    req2.flush(mockPagosResponse);
  });

  it('getPagos maneja errores', () => {
    service.getPagos().subscribe({
      next: () => fail('should have failed'),
      error: (err) => expect(err).toBeTruthy(),
    });
    httpMock.expectOne((r) => r.url === baseUrl).error(new ErrorEvent('Network error'));
    expect(mockHandleErrorService.handleError).toHaveBeenCalled();
  });

  it('getPagoById llama GET con query', () => {
    service.getPagoById(7).subscribe((resp) => expect(resp).toEqual(mockPagoResponse));
    const req = httpMock.expectOne(`${baseUrl}/search?id=7`);
    expect(req.request.method).toBe('GET');
    req.flush(mockPagoResponse);
  });

  it('getPagoById maneja errores', () => {
    service.getPagoById(7).subscribe({
      next: () => fail('should have failed'),
      error: (err) => expect(err).toBeTruthy(),
    });
    httpMock.expectOne(`${baseUrl}/search?id=7`).error(new ErrorEvent('Network error'));
    expect(mockHandleErrorService.handleError).toHaveBeenCalled();
  });

  it('updatePago llama PUT con fecha/hora del contrato de actualización', () => {
    service.updatePago(9, mockPagoUpdateBody).subscribe((resp) => {
      expect(resp).toEqual(mockPagoUpdateResponse);
    });
    const req = httpMock.expectOne(`${baseUrl}?id=9`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(mockPagoUpdateBody);
    req.flush(mockPagoUpdateResponse);
  });

  it('updatePago maneja errores', () => {
    service.updatePago(9, mockPagoUpdateBody).subscribe({
      next: () => fail('should have failed'),
      error: (err) => expect(err).toBeTruthy(),
    });
    httpMock.expectOne(`${baseUrl}?id=9`).error(new ErrorEvent('Network error'));
    expect(mockHandleErrorService.handleError).toHaveBeenCalled();
  });

  it('deletePago llama DELETE', () => {
    service.deletePago(5).subscribe();
    const req = httpMock.expectOne(`${baseUrl}?id=5`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ code: 200, message: 'Pago eliminado' });
  });

  it('deletePago maneja errores', () => {
    service.deletePago(5).subscribe({
      next: () => fail('should have failed'),
      error: (err) => expect(err).toBeTruthy(),
    });
    httpMock.expectOne(`${baseUrl}?id=5`).error(new ErrorEvent('Network error'));
    expect(mockHandleErrorService.handleError).toHaveBeenCalled();
  });
});
