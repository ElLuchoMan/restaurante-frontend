import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { MetodosPagoService } from './metodos-pago.service';

describe('MetodosPagoService', () => {
  let service: MetodosPagoService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(MetodosPagoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
