import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { createHandleErrorServiceMock } from '../../shared/mocks/test-doubles';
import { DescuentoService } from './descuento.service';
import { HandleErrorService } from './handle-error.service';

describe('DescuentoService', () => {
  let service: DescuentoService;
  let http: HttpTestingController;
  const baseUrl = `${environment.apiUrl}`;
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

  it('aplica descuento a pedido', () => {
    const body = { cuponId: 1, montoDescuento: 2000 } as any;
    service.aplicar(5, body).subscribe();
    const req = http.expectOne(`${baseUrl}/pedidos/5/descuentos`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush({ code: 200, message: 'ok', data: {} });
  });

  it('lista descuentos de pedido', () => {
    service.listarPorPedido(9).subscribe();
    const req = http.expectOne(`${baseUrl}/pedidos/9/descuentos`);
    expect(req.request.method).toBe('GET');
    req.flush({ code: 200, message: 'ok', data: [] });
  });
});
