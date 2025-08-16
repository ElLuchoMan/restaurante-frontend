import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProductoPedidoService } from './producto-pedido.service';
import { environment } from '../../../environments/environment';

describe('ProductoPedidoService', () => {
  let service: ProductoPedidoService;
  let http: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/producto_pedido`;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(ProductoPedidoService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('creates producto pedido', () => {
    const payload: any = {
      PK_ID_PEDIDO: 1,
      DETALLES_PRODUCTOS: [
        { PK_ID_PRODUCTO: 1, NOMBRE: 'A', CANTIDAD: 1, PRECIO_UNITARIO: 10, SUBTOTAL: 10 }
      ]
    };
    const mock = { code: 200, message: 'ok', data: {} };
    service.create(payload).subscribe(res => expect(res).toEqual(mock));
    const req = http.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      PK_ID_PEDIDO: 1,
      DETALLES_PRODUCTOS: JSON.stringify(payload.DETALLES_PRODUCTOS)
    });
    req.flush(mock);
  });
});
