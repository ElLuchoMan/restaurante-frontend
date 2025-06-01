import { TestBed } from '@angular/core/testing';

import { MetodosPagoService } from './metodos-pago.service';

describe('MetodosPagoService', () => {
  let service: MetodosPagoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MetodosPagoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
