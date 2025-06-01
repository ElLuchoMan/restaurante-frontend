import { TestBed } from '@angular/core/testing';

import { ProductoPedidoService } from './producto-pedido.service';

describe('ProductoPedidoService', () => {
  let service: ProductoPedidoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductoPedidoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
