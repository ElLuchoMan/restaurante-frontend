import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { mockDescuentoAplicado, mockPedidoDescuento } from '../../shared/mocks/descuento.mock';
import { createHandleErrorServiceMock } from '../../shared/mocks/test-doubles';
import { AplicarDescuentoRequest } from '../../shared/models/descuento.model';
import { DescuentoService } from './descuento.service';
import { HandleErrorService } from './handle-error.service';

describe('DescuentoService', () => {
  let service: DescuentoService;
  let http: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/descuentos/pedidos`;
  const mockHandleErrorService = createHandleErrorServiceMock();

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: HandleErrorService, useValue: mockHandleErrorService }],
    });
    service = TestBed.inject(DescuentoService);
    http = TestBed.inject(HttpTestingController);
    jest.clearAllMocks();
  });

  afterEach(() => http.verify());

  it('aplica descuento con POST /descuentos/pedidos?pedido_id= sin enviar monto', () => {
    const body: AplicarDescuentoRequest = { cuponId: 1 };
    service.aplicar(5, body).subscribe((res) => {
      expect(res).toEqual(mockDescuentoAplicado);
      // La respuesta trae los importes recalculados por el servidor.
      expect(res.data.subtotal).toBe(20000);
      expect(res.data.montoDescuento).toBe(2000);
      expect(res.data.total).toBe(18000);
      expect(res.data.pagoId).toBe(4);
      expect(res.data.descuento).toEqual(mockPedidoDescuento);
    });
    const req = http.expectOne(`${baseUrl}?pedido_id=5`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    expect(req.request.body).not.toHaveProperty('montoDescuento');
    req.flush(mockDescuentoAplicado);
  });

  it('un trabajador aplica una oferta en nombre de un cliente (clienteId + detalle)', () => {
    const body: AplicarDescuentoRequest = {
      ofertaId: 2,
      clienteId: 1015466495,
      detalle: { nota: 'x' },
    };
    service.aplicar(5, body).subscribe();
    const req = http.expectOne(`${baseUrl}?pedido_id=5`);
    expect(req.request.body).toEqual(body);
    req.flush(mockDescuentoAplicado);
  });

  it('lista descuentos de pedido con GET /descuentos/pedidos?pedido_id=', () => {
    service.listarPorPedido(9).subscribe((res) => expect(res.data).toEqual([]));
    const req = http.expectOne(`${baseUrl}?pedido_id=9`);
    expect(req.request.method).toBe('GET');
    req.flush({ code: 200, message: 'ok', data: [] });
  });

  it('listarPorPedido devuelve [] cuando el pedido no tiene descuentos', () => {
    service.listarPorPedido(9).subscribe((res) => expect(res.data).toEqual([]));
    http.expectOne(`${baseUrl}?pedido_id=9`).flush({ code: 200, message: 'ok', data: [] });
  });

  it('listarPorPedido propaga 404 (pedido inexistente) como error HTTP', () => {
    service.listarPorPedido(9).subscribe({ error: (err) => expect(err).toBeTruthy() });
    http
      .expectOne(`${baseUrl}?pedido_id=9`)
      .flush(
        { code: 404, message: 'Pedido no encontrado' },
        { status: 404, statusText: 'Not Found' },
      );
    expect(mockHandleErrorService.handleError.mock.calls[0][0]).toMatchObject({ status: 404 });
  });

  it.each([
    [400, 'clienteId ausente'],
    [401, 'sin sesión'],
    [403, 'pedido de otro cliente'],
    [404, 'cupón inexistente'],
    [409, 'ya aplicado o cupón agotado'],
    [422, 'cupón no aplicable'],
  ])('aplicar propaga %i (%s) como error HTTP', (status, message) => {
    service.aplicar(5, { ofertaId: 2 }).subscribe({ error: (err) => expect(err).toBeTruthy() });
    http
      .expectOne(`${baseUrl}?pedido_id=5`)
      .flush({ code: status, message }, { status, statusText: message });
    expect(mockHandleErrorService.handleError.mock.calls[0][0]).toMatchObject({ status });
  });

  it('listarPorPedido propaga 403 (pedido de otro cliente) como error HTTP', () => {
    service.listarPorPedido(9).subscribe({ error: (err) => expect(err).toBeTruthy() });
    http
      .expectOne(`${baseUrl}?pedido_id=9`)
      .flush({ code: 403, message: 'ajeno' }, { status: 403, statusText: 'Forbidden' });
    expect(mockHandleErrorService.handleError.mock.calls[0][0]).toMatchObject({ status: 403 });
  });

  it('propaga errores HTTP a HandleErrorService', () => {
    service.aplicar(5, { ofertaId: 2 }).subscribe({
      error: (err) => expect(err).toBeTruthy(),
    });
    http.expectOne(`${baseUrl}?pedido_id=5`).error(new ErrorEvent('Network error'));
    expect(mockHandleErrorService.handleError).toHaveBeenCalled();
  });
});
