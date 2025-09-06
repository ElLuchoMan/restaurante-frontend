import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
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
    const detalles = [
      { PK_ID_PRODUCTO: 1, NOMBRE: 'A', CANTIDAD: 1, PRECIO_UNITARIO: 10, SUBTOTAL: 10 },
    ];
    const mock = { code: 200, message: 'ok', data: {} };
    service.create(1, detalles).subscribe((res) => expect(res).toEqual(mock));
    const req = http.expectOne(`${baseUrl}?pedido_id=1`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ detallesProductos: detalles });
    req.flush(mock);
  });

  it('handles error on create', () => {
    const detalles = [
      { PK_ID_PRODUCTO: 1, NOMBRE: 'A', CANTIDAD: 1, PRECIO_UNITARIO: 10, SUBTOTAL: 10 },
    ];
    service.create(1, detalles).subscribe({
      next: () => fail('should have failed'),
      error: (err) => expect(err).toBeTruthy(),
    });
    const req = http.expectOne(`${baseUrl}?pedido_id=1`);
    req.error(new ErrorEvent('Network error'));
    expect(mockHandleErrorService.handleError).toHaveBeenCalled();
  });
});
