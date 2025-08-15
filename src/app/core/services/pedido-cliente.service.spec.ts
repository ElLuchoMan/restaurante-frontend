import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { PedidoClienteService } from './pedido-cliente.service';

describe('PedidoClienteService', () => {
  let service: PedidoClienteService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(PedidoClienteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
