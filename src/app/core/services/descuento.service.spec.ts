import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { mockDescuentoAplicado } from '../../shared/mocks/descuento.mock';
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

  it('aplica descuento con POST /descuentos/pedidos?pedido_id=', () => {
    const body: AplicarDescuentoRequest = { cuponId: 1, montoDescuento: 2000 };
    service.aplicar(5, body).subscribe((res) => expect(res).toEqual(mockDescuentoAplicado));
    const req = http.expectOne(`${baseUrl}?pedido_id=5`);
    expect(req.request.method).toBe('POST');
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

  it('aplicar propaga 409 (descuento ya aplicado) como error HTTP', () => {
    service.aplicar(5, { ofertaId: 2, montoDescuento: 1 }).subscribe({
      error: (err) => expect(err).toBeTruthy(),
    });
    http
      .expectOne(`${baseUrl}?pedido_id=5`)
      .flush({ code: 409, message: 'ya aplicado' }, { status: 409, statusText: 'Conflict' });
    expect(mockHandleErrorService.handleError.mock.calls[0][0]).toMatchObject({ status: 409 });
  });

  it('propaga errores HTTP a HandleErrorService', () => {
    service.aplicar(5, { ofertaId: 2, montoDescuento: 1 }).subscribe({
      error: (err) => expect(err).toBeTruthy(),
    });
    http.expectOne(`${baseUrl}?pedido_id=5`).error(new ErrorEvent('Network error'));
    expect(mockHandleErrorService.handleError).toHaveBeenCalled();
  });
});
