import { TestBed } from '@angular/core/testing';

import { PedidoClienteService } from './pedido-cliente.service';

describe('PedidoClienteService', () => {
  let service: PedidoClienteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PedidoClienteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
