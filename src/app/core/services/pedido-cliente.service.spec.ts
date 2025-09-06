import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { createHandleErrorServiceMock } from '../../shared/mocks/test-doubles';
import { HandleErrorService } from './handle-error.service';
import { PedidoClienteService } from './pedido-cliente.service';

describe('PedidoClienteService', () => {
  let service: PedidoClienteService;
  let http: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/pedido_clientes`;
  const mockHandleErrorService = createHandleErrorServiceMock();

  beforeEach(() => {
    mockHandleErrorService.handleError.mockReset();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: HandleErrorService, useValue: mockHandleErrorService }],
    });
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
    service.create(payload).subscribe((res) => expect(res).toEqual(mock));
    const req = http.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(mock);
  });

  it('handles error on create', () => {
    const payload = { pedidoId: 1, clienteId: 2 } as any;
    service.create(payload).subscribe({
      next: () => fail('should have failed'),
      error: (err) => expect(err).toBeTruthy(),
    });
    const req = http.expectOne(baseUrl);
    req.error(new ErrorEvent('Network error'));
    expect(mockHandleErrorService.handleError).toHaveBeenCalled();
  });

  it('gets pedido cliente', () => {
    const mock = { code: 200, message: 'ok', data: {} };
    service.getPedidoCliente(3, 4).subscribe((res) => expect(res).toEqual(mock));
    const req = http.expectOne(`${baseUrl}?pedido_id=3&cliente_id=4`);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  it('handles error on getPedidoCliente', () => {
    service.getPedidoCliente(3, 4).subscribe({
      next: () => fail('should have failed'),
      error: (err) => expect(err).toBeTruthy(),
    });
    const req = http.expectOne(`${baseUrl}?pedido_id=3&cliente_id=4`);
    req.error(new ErrorEvent('Network error'));
    expect(mockHandleErrorService.handleError).toHaveBeenCalled();
  });
});
