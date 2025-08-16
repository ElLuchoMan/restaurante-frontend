import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PedidoService } from './pedido.service';
import { environment } from '../../../environments/environment';

describe('PedidoService', () => {
  let service: PedidoService;
  let http: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/pedidos`;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(PedidoService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('creates pedido', () => {
    const pedido = { total: 100 } as any;
    const mock = { code: 200, message: 'ok', data: {} };
    service.createPedido(pedido).subscribe(res => expect(res).toEqual(mock));
    const req = http.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(pedido);
    req.flush(mock);
  });

  it('assigns pago', () => {
    const mock = { code: 200, message: 'ok' };
    service.assignPago(1, 2).subscribe(res => expect(res).toEqual(mock));
    const req = http.expectOne(`${baseUrl}/asignar-pago?pedido_id=1&pago_id=2`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toBeNull();
    req.flush(mock);
  });

  it('assigns domicilio', () => {
    const mock = { code: 200, message: 'ok' };
    service.assignDomicilio(1, 3).subscribe(res => expect(res).toEqual(mock));
    const req = http.expectOne(`${baseUrl}/asignar-domicilio?pedido_id=1&domicilio_id=3`);
    expect(req.request.method).toBe('POST');
    req.flush(mock);
  });

  it('gets mis pedidos', () => {
    const mock = { code: 200, message: 'ok', data: [] };
    service.getMisPedidos(5).subscribe(res => expect(res).toEqual(mock));
    const req = http.expectOne(`${baseUrl}?cliente=5`);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  it('gets pedido detalles', () => {
    const mock = { code: 200, message: 'ok', data: {} };
    service.getPedidoDetalles(7).subscribe(res => expect(res).toEqual(mock));
    const req = http.expectOne(`${baseUrl}/detalles?pedido_id=7`);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });
});
