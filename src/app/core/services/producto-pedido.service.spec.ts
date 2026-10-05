import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import {
  mockProductoPedidoCreateBody,
  mockProductoPedidoResponse,
  mockProductoPedidoUpdateBody,
} from '../../shared/mocks/producto-pedido.mock';
import { createHandleErrorServiceMock } from '../../shared/mocks/test-doubles';
import { HandleErrorService } from './handle-error.service';
import { ProductoPedidoService } from './producto-pedido.service';

describe('ProductoPedidoService', () => {
  let service: ProductoPedidoService;
  let http: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/producto_pedido`;
  const mockHandleErrorService = createHandleErrorServiceMock();

  beforeEach(() => {
    mockHandleErrorService.handleError.mockReset();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: HandleErrorService, useValue: mockHandleErrorService }],
    });
    service = TestBed.inject(ProductoPedidoService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('creates producto pedido', () => {
    const { pedidoId, detalles } = mockProductoPedidoCreateBody;
    const mock = { ...mockProductoPedidoResponse, code: 201 };
    service.create(pedidoId, detalles).subscribe((res) => expect(res).toEqual(mock));
    const req = http.expectOne(`${baseUrl}`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ pedidoId, detalles });
    req.flush(mock);
  });

  it('handles error on create', () => {
    service.create(1, [{ productoId: 1, cantidad: 1 }]).subscribe({
      next: () => fail('should have failed'),
      error: (err) => expect(err).toBeTruthy(),
    });
    const req = http.expectOne(`${baseUrl}`);
    req.error(new ErrorEvent('Network error'));
    expect(mockHandleErrorService.handleError).toHaveBeenCalled();
  });

  it('gets producto pedido by pedido id', () => {
    service.getByPedido(42).subscribe((res) => expect(res).toEqual(mockProductoPedidoResponse));
    const req = http.expectOne(`${baseUrl}?pedido_id=42`);
    expect(req.request.method).toBe('GET');
    req.flush(mockProductoPedidoResponse);
  });

  it('updates producto pedido with detalles', () => {
    service
      .update(55, mockProductoPedidoUpdateBody)
      .subscribe((res) => expect(res).toEqual(mockProductoPedidoResponse));
    const req = http.expectOne(`${baseUrl}?pedido_id=55`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(mockProductoPedidoUpdateBody);
    req.flush(mockProductoPedidoResponse);
  });

  it('handles error on getByPedido', () => {
    service.getByPedido(42).subscribe({
      next: () => fail('should have failed'),
      error: (err) => expect(err).toBeTruthy(),
    });
    const req = http.expectOne(`${baseUrl}?pedido_id=42`);
    req.error(new ErrorEvent('Network error'));
    expect(mockHandleErrorService.handleError).toHaveBeenCalled();
  });

  it('handles error on update', () => {
    service.update(55, mockProductoPedidoUpdateBody).subscribe({
      next: () => fail('should have failed'),
      error: (err) => expect(err).toBeTruthy(),
    });
    const req = http.expectOne(`${baseUrl}?pedido_id=55`);
    req.error(new ErrorEvent('Network error'));
    expect(mockHandleErrorService.handleError).toHaveBeenCalled();
  });

  it('create convierte un code >= 400 con HTTP 200 (inventario insuficiente) en error', () => {
    let captured: unknown;
    service.create(1, [{ productoId: 1, cantidad: 99 }]).subscribe({
      next: () => fail('should have failed'),
      error: (err) => (captured = err),
    });
    http.expectOne(`${baseUrl}`).flush({
      code: 400,
      message: 'Inventario insuficiente para uno o más productos',
      data: [{ productoId: 1, requerido: 99, disponible: 3 }],
    });
    expect(captured).toEqual({
      code: 400,
      message: 'Inventario insuficiente para uno o más productos',
      cause: 'No especificado',
    });
    expect(mockHandleErrorService.handleError).not.toHaveBeenCalled();
  });

  it('update convierte un code >= 400 con HTTP 200 en error conservando la causa', () => {
    let captured: unknown;
    service.update(55, mockProductoPedidoUpdateBody).subscribe({
      next: () => fail('should have failed'),
      error: (err) => (captured = err),
    });
    http.expectOne(`${baseUrl}?pedido_id=55`).flush({
      code: 500,
      message: 'Error al actualizar los productos del pedido',
      cause: 'db down',
    });
    expect(captured).toEqual({
      code: 500,
      message: 'Error al actualizar los productos del pedido',
      cause: 'db down',
    });
  });
});
