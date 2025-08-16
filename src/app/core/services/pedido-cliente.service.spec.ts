import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PedidoClienteService } from './pedido-cliente.service';
import { environment } from '../../../environments/environment';

describe('PedidoClienteService', () => {
  let service: PedidoClienteService;
  let http: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/pedido_clientes`;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(PedidoClienteService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('creates relation', () => {
    const payload = { pedidoId: 1, clienteId: 2 } as any;
    const mock = { code: 200, message: 'ok', data: {} };
    service.create(payload).subscribe(res => expect(res).toEqual(mock));
    const req = http.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(mock);
  });

  it('gets pedido cliente', () => {
    const mock = { code: 200, message: 'ok', data: {} };
    service.getPedidoCliente(3, 4).subscribe(res => expect(res).toEqual(mock));
    const req = http.expectOne(`${baseUrl}/3/4`);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });
});
