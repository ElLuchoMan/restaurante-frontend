import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { mockPedidosFiltroResponse } from '../../shared/mocks/pedido.mock';
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

  it('assigns pago with default cambiar_estado=false', () => {
    const mock = { code: 200, message: 'ok' };
    service.assignPago(1, 2).subscribe((res) => expect(res).toEqual(mock));
    const req = http.expectOne(
      `${baseUrl}/asignar-pago?pedido_id=1&pago_id=2&cambiar_estado=false`,
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toBeNull();
    req.flush(mock);
  });

  it('assigns pago with cambiar_estado=true', () => {
    const mock = { code: 200, message: 'ok' };
    service.assignPago(1, 2, true).subscribe((res) => expect(res).toEqual(mock));
    const req = http.expectOne(`${baseUrl}/asignar-pago?pedido_id=1&pago_id=2&cambiar_estado=true`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toBeNull();
    req.flush(mock);
  });

  it('handles error on assignPago', () => {
    service.assignPago(1, 2).subscribe({
      next: () => fail('should have failed'),
      error: (err) => expect(err).toBeTruthy(),
    });
    const req = http.expectOne(
      `${baseUrl}/asignar-pago?pedido_id=1&pago_id=2&cambiar_estado=false`,
    );
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

  it('gets pedidos with filters', () => {
    service
      .getPedidos({ fecha: '2025-09-15', cliente: 101, domicilio: true, metodo_pago: 'NEQUI' })
      .subscribe((res) => expect(res).toEqual(mockPedidosFiltroResponse));

    const req = http.expectOne(
      (r) =>
        r.url === `${baseUrl}` &&
        r.params.get('fecha') === '2025-09-15' &&
        r.params.get('cliente') === '101' &&
        r.params.get('domicilio') === 'true' &&
        r.params.get('metodo_pago') === 'NEQUI',
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockPedidosFiltroResponse);
  });

  it('getPedidos sin filtros utiliza HttpParams vacío', () => {
    const mock = { code: 200, message: 'ok', data: [] };
    service.getPedidos().subscribe((res) => expect(res).toEqual(mock));
    const req = http.expectOne((r) => r.url === baseUrl && r.params.keys().length === 0);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  it('updates estado of pedido', () => {
    service.updateEstado(77, 'TERMINADO').subscribe((res) => expect(res).toEqual({ code: 200 }));
    const req = http.expectOne(`${baseUrl}/actualizar-estado?pedido_id=77&estado=TERMINADO`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toBeNull();
    req.flush({ code: 200 });
  });

  it('updatePedido envía body parcial con id en query', () => {
    const body = { estadoPedido: 'EN_CURSO' } as any;
    const mock = { code: 200, message: 'ok', data: {} };
    service.updatePedido(5, body).subscribe((res) => expect(res).toEqual(mock));
    const req = http.expectOne(`${baseUrl}?id=5`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(body);
    req.flush(mock);
  });

  it('deletePedido envía id como query', () => {
    const mock = { code: 200, message: 'ok', data: {} };
    service.deletePedido(9).subscribe((res) => expect(res).toEqual(mock));
    const req = http.expectOne(`${baseUrl}?id=9`);
    expect(req.request.method).toBe('DELETE');
    req.flush(mock);
  });
});
