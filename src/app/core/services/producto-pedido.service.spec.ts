import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  mockInventarioInsuficiente,
  mockInventarioInsuficienteBody,
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

  it('create conserva el detalle del 409 por inventario insuficiente', () => {
    let captured: unknown;
    service.create(1, [{ productoId: 1, cantidad: 5 }]).subscribe({
      next: () => fail('should have failed'),
      error: (err) => (captured = err),
    });
    http
      .expectOne(`${baseUrl}`)
      .flush(mockInventarioInsuficienteBody, { status: 409, statusText: 'Conflict' });
    expect(captured).toEqual({
      code: 409,
      message: mockInventarioInsuficienteBody.message,
      cause: 'No especificado',
      data: mockInventarioInsuficiente,
    });
    expect(mockHandleErrorService.handleError).not.toHaveBeenCalled();
  });

  it('update conserva el detalle del 409 y la causa del back', () => {
    let captured: unknown;
    service.update(55, mockProductoPedidoUpdateBody).subscribe({
      next: () => fail('should have failed'),
      error: (err) => (captured = err),
    });
    http
      .expectOne(`${baseUrl}?pedido_id=55`)
      .flush(
        { ...mockInventarioInsuficienteBody, cause: 'stock' },
        { status: 409, statusText: 'Conflict' },
      );
    expect(captured).toEqual({
      code: 409,
      message: mockInventarioInsuficienteBody.message,
      cause: 'stock',
      data: mockInventarioInsuficiente,
    });
  });

  it('un 409 sin detalle (producto ya presente) usa HandleErrorService', () => {
    const formatted = { code: 409, message: 'ya existe', cause: 'x' };
    mockHandleErrorService.handleError.mockReturnValue(throwError(() => formatted));
    let captured: unknown;
    service.create(1, [{ productoId: 1, cantidad: 1 }]).subscribe({
      next: () => fail('should have failed'),
      error: (err) => (captured = err),
    });
    http
      .expectOne(`${baseUrl}`)
      .flush({ code: 409, message: 'ya existe' }, { status: 409, statusText: 'Conflict' });
    expect(mockHandleErrorService.handleError).toHaveBeenCalled();
    expect(captured).toEqual(formatted);
  });

  it('un 409 sin mensaje usa el texto por defecto', () => {
    let captured: { message?: string } | undefined;
    service.create(1, [{ productoId: 1, cantidad: 5 }]).subscribe({
      next: () => fail('should have failed'),
      error: (err) => (captured = err),
    });
    http
      .expectOne(`${baseUrl}`)
      .flush({ data: mockInventarioInsuficiente }, { status: 409, statusText: 'Conflict' });
    expect(captured?.message).toBe('Inventario insuficiente');
  });

  it('un 404 usa HandleErrorService', () => {
    mockHandleErrorService.handleError.mockReturnValue(throwError(() => ({ code: 404 })));
    service.update(55, mockProductoPedidoUpdateBody).subscribe({
      next: () => fail('should have failed'),
      error: (err) => expect(err).toEqual({ code: 404 }),
    });
    http
      .expectOne(`${baseUrl}?pedido_id=55`)
      .flush({ code: 404, message: 'no existe' }, { status: 404, statusText: 'Not Found' });
    expect(mockHandleErrorService.handleError).toHaveBeenCalled();
  });
});
