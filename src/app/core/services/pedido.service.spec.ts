import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { EstadoPedido } from '../../shared/constants';
import {
  mockCheckoutBody,
  mockCheckoutResponse,
  mockPedidoBody,
  mockPedidoDetalle,
  mockPedidosFiltroResponse,
  mockPedidosResponse,
} from '../../shared/mocks/pedido.mock';
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
    const mock = { ...mockPedidosResponse, data: mockPedidosResponse.data[0] };
    service.createPedido(mockPedidoBody).subscribe((res) => expect(res).toEqual(mock));
    const req = http.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockPedidoBody);
    req.flush(mock);
  });

  it('handles error on createPedido', () => {
    service.createPedido({ delivery: false }).subscribe({
      next: () => fail('should have failed'),
      error: (err) => expect(err).toBeTruthy(),
    });
    const req = http.expectOne(baseUrl);
    req.error(new ErrorEvent('Network error'));
    expect(mockHandleErrorService.handleError).toHaveBeenCalled();
  });

  it('checks out in a single POST and returns the order with the server amount', () => {
    service.checkout(mockCheckoutBody).subscribe((res) => {
      expect(res).toEqual(mockCheckoutResponse);
      expect(res.data.monto).toBe(50000);
    });
    const req = http.expectOne(`${baseUrl}/checkout`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockCheckoutBody);
    req.flush(mockCheckoutResponse);
  });

  it('keeps the per-product detail of a 409 inventory error on checkout', () => {
    const data = [{ productoId: 1, requerido: 5, disponible: 2 }];
    let error: unknown;
    service.checkout(mockCheckoutBody).subscribe({ error: (e) => (error = e) });
    http
      .expectOne(`${baseUrl}/checkout`)
      .flush(
        { code: 409, message: 'Inventario insuficiente para uno o más productos', data },
        { status: 409, statusText: 'Conflict' },
      );
    expect(error).toEqual({
      code: 409,
      message: 'Inventario insuficiente para uno o más productos',
      cause: 'No especificado',
      data,
    });
    expect(mockHandleErrorService.handleError).not.toHaveBeenCalled();
  });

  it('uses default message and cause for a 409 inventory error without them', () => {
    let error: any;
    service.checkout(mockCheckoutBody).subscribe({ error: (e) => (error = e) });
    http
      .expectOne(`${baseUrl}/checkout`)
      .flush({ data: [] }, { status: 409, statusText: 'Conflict' });
    expect(error).toEqual({
      code: 409,
      message: 'Inventario insuficiente',
      cause: 'No especificado',
      data: [],
    });
  });

  it.each([
    [409, { message: 'conflicto' }],
    [403, { message: 'otro cliente', data: [] }],
    [500, null],
  ])(
    'delegates a %s without inventory detail to HandleErrorService on checkout',
    (status, body) => {
      service.checkout(mockCheckoutBody).subscribe({ error: (err) => expect(err).toBeTruthy() });
      http.expectOne(`${baseUrl}/checkout`).flush(body, { status, statusText: 'Error' });
      expect(mockHandleErrorService.handleError).toHaveBeenCalled();
    },
  );

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
    service.getPedidoDetalles(7).subscribe((res) => expect(res).toEqual(mockPedidoDetalle));
    const req = http.expectOne(`${baseUrl}/detalles?pedido_id=7`);
    expect(req.request.method).toBe('GET');
    req.flush(mockPedidoDetalle);
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

  it('getPedidos ignora filtros null o undefined', () => {
    const mock = { code: 200, message: 'ok', data: [] };
    service
      .getPedidos({ fecha: '2025-09-15', metodo_pago: null as unknown as string, mes: undefined })
      .subscribe((res) => expect(res).toEqual(mock));
    const req = http.expectOne((r) => r.url === baseUrl);
    expect(req.request.params.keys()).toEqual(['fecha']);
    req.flush(mock);
  });

  it('updates estado of pedido', () => {
    service
      .updateEstado(77, EstadoPedido.EstadoPedidoTerminado)
      .subscribe((res) => expect(res).toEqual({ code: 200 }));
    const req = http.expectOne(`${baseUrl}/actualizar-estado?pedido_id=77&estado=TERMINADO`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toBeNull();
    req.flush({ code: 200 });
  });

  it('handles error on updateEstado', () => {
    service.updateEstado(77, EstadoPedido.EstadoPedidoCancelado).subscribe({
      next: () => fail('should have failed'),
      error: (err) => expect(err).toBeTruthy(),
    });
    const req = http.expectOne(`${baseUrl}/actualizar-estado?pedido_id=77&estado=CANCELADO`);
    req.error(new ErrorEvent('Network error'));
    expect(mockHandleErrorService.handleError).toHaveBeenCalled();
  });

  it('handles error on getPedidos', () => {
    service.getPedidos({ mes: 3, anio: 2025 }).subscribe({
      next: () => fail('should have failed'),
      error: (err) => expect(err).toBeTruthy(),
    });
    const req = http.expectOne((r) => r.url === baseUrl);
    expect(req.request.params.get('mes')).toBe('3');
    expect(req.request.params.get('anio')).toBe('2025');
    req.error(new ErrorEvent('Network error'));
    expect(mockHandleErrorService.handleError).toHaveBeenCalled();
  });
});
