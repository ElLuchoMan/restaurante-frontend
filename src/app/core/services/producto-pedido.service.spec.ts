import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { ProductoPedidoService } from './producto-pedido.service';

describe('ProductoPedidoService', () => {
  let service: ProductoPedidoService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(ProductoPedidoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
