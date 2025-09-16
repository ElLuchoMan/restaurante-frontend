import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import {
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
    const detalles = [{ productoId: 1, cantidad: 1 }];
    const mock = { code: 200, message: 'ok', data: {} };
    service.create(1, detalles as any).subscribe((res) => expect(res).toEqual(mock));
    const req = http.expectOne(`${baseUrl}`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ pedidoId: 1, detalles });
    req.flush(mock);
  });

  it('handles error on create', () => {
    const detalles = [{ productoId: 1, cantidad: 1 }];
    service.create(1, detalles as any).subscribe({
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
      .update(55, mockProductoPedidoUpdateBody as any)
      .subscribe((res) => expect(res).toEqual({ code: 200 }));
    const req = http.expectOne(`${baseUrl}?pedido_id=55`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(mockProductoPedidoUpdateBody);
    req.flush({ code: 200 });
  });
});
