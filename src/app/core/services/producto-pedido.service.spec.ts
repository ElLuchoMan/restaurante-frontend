import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { HandleErrorService } from './handle-error.service';
import { ProductoPedidoService } from './producto-pedido.service';

describe('ProductoPedidoService', () => {
  let service: ProductoPedidoService;
  let http: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/producto_pedido`;
  const mockHandleErrorService = {
    handleError: jest.fn((error: any) => {
      throw error;
    }),
  };

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
    const payload: any = {
      pedidoId: 1,
      DETALLES_PRODUCTOS: [
        { PK_ID_PRODUCTO: 1, NOMBRE: 'A', CANTIDAD: 1, PRECIO_UNITARIO: 10, SUBTOTAL: 10 },
      ],
    };
    const mock = { code: 200, message: 'ok', data: {} };
    service.create(payload).subscribe((res) => expect(res).toEqual(mock));
    const req = http.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      pedidoId: undefined,
      detallesProductos: payload.DETALLES_PRODUCTOS,
    });
    expect(Array.isArray(req.request.body.DETALLES_PRODUCTOS)).toBe(false);
    req.flush(mock);
  });

  it('handles error on create', () => {
    const payload: any = {
      pedidoId: 1,
      DETALLES_PRODUCTOS: [
        { PK_ID_PRODUCTO: 1, NOMBRE: 'A', CANTIDAD: 1, PRECIO_UNITARIO: 10, SUBTOTAL: 10 },
      ],
    };
    service.create(payload).subscribe({
      next: () => fail('should have failed'),
      error: (err) => expect(err).toBeTruthy(),
    });
    const req = http.expectOne(baseUrl);
    req.error(new ErrorEvent('Network error'));
    expect(mockHandleErrorService.handleError).toHaveBeenCalled();
  });
});
