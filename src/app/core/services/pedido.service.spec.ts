import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { createHandleErrorServiceMock } from '../../shared/mocks/test-doubles';
import { HandleErrorService } from './handle-error.service';
import { PedidoService } from './pedido.service';

describe('PedidoService', () => {
  let service: PedidoService;
  let http: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/pedidos`;
  const mockHandleErrorService = createHandleErrorServiceMock();

  beforeEach(() => {
    mockHandleErrorService.handleError.mockReset();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: HandleErrorService, useValue: mockHandleErrorService }],
    });
    service = TestBed.inject(PedidoService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('creates pedido', () => {
    const pedido = { delivery: true } as any;
    const mock = { code: 200, message: 'ok', data: {} };
    service.createPedido(pedido).subscribe((res) => expect(res).toEqual(mock));
    const req = http.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(pedido);
    req.flush(mock);
  });

  it('handles error on createPedido', () => {
    const pedido = { delivery: true } as any;
    service.createPedido(pedido).subscribe({
      next: () => fail('should have failed'),
      error: (err) => expect(err).toBeTruthy(),
    });
    const req = http.expectOne(baseUrl);
    req.error(new ErrorEvent('Network error'));
    expect(mockHandleErrorService.handleError).toHaveBeenCalled();
  });

  it('assigns pago', () => {
    const mock = { code: 200, message: 'ok' };
    service.assignPago(1, 2).subscribe((res) => expect(res).toEqual(mock));
    const req = http.expectOne(`${baseUrl}/asignar-pago?pedido_id=1&pago_id=2`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toBeNull();
    req.flush(mock);
  });

  it('handles error on assignPago', () => {
    service.assignPago(1, 2).subscribe({
      next: () => fail('should have failed'),
      error: (err) => expect(err).toBeTruthy(),
    });
    const req = http.expectOne(`${baseUrl}/asignar-pago?pedido_id=1&pago_id=2`);
    req.error(new ErrorEvent('Network error'));
    expect(mockHandleErrorService.handleError).toHaveBeenCalled();
  });

  it('assigns domicilio', () => {
    const mock = { code: 200, message: 'ok', data: { delivery: true, estadoPedido: 'EN CURSO' } };
    service.assignDomicilio(1, 3).subscribe((res) => expect(res).toEqual(mock));
    const req = http.expectOne(`${baseUrl}/asignar-domicilio?pedido_id=1&domicilio_id=3`);
    expect(req.request.method).toBe('POST');
    req.flush(mock);
  });

  it('handles error on assignDomicilio', () => {
    service.assignDomicilio(1, 3).subscribe({
      next: () => fail('should have failed'),
      error: (err) => expect(err).toBeTruthy(),
    });
    const req = http.expectOne(`${baseUrl}/asignar-domicilio?pedido_id=1&domicilio_id=3`);
    req.error(new ErrorEvent('Network error'));
    expect(mockHandleErrorService.handleError).toHaveBeenCalled();
  });

  it('gets mis pedidos', () => {
    const mock = { code: 200, message: 'ok', data: [] };
    service.getMisPedidos(5).subscribe((res) => expect(res).toEqual(mock));
    const req = http.expectOne(`${baseUrl}?cliente=5`);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  it('handles error on getMisPedidos', () => {
    service.getMisPedidos(5).subscribe({
      next: () => fail('should have failed'),
      error: (err) => expect(err).toBeTruthy(),
    });
    const req = http.expectOne(`${baseUrl}?cliente=5`);
    req.error(new ErrorEvent('Network error'));
    expect(mockHandleErrorService.handleError).toHaveBeenCalled();
  });

  it('gets pedido detalles', () => {
    const mock = { code: 200, message: 'ok', data: {} };
    service.getPedidoDetalles(7).subscribe((res) => expect(res).toEqual(mock));
    const req = http.expectOne(`${baseUrl}/detalles?pedido_id=7`);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  it('handles error on getPedidoDetalles', () => {
    service.getPedidoDetalles(7).subscribe({
      next: () => fail('should have failed'),
      error: (err) => expect(err).toBeTruthy(),
    });
    const req = http.expectOne(`${baseUrl}/detalles?pedido_id=7`);
    req.error(new ErrorEvent('Network error'));
    expect(mockHandleErrorService.handleError).toHaveBeenCalled();
  });
});
