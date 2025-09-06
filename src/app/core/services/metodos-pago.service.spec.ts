import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { MetodosPagoService } from './metodos-pago.service';

describe('MetodosPagoService', () => {
  let service: MetodosPagoService;
  let http: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/metodos_pago`;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(MetodosPagoService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('gets all methods', () => {
    const mock = { code: 200, message: 'ok', data: [] };
    service.getAll().subscribe((res) => expect(res).toEqual(mock));
    const req = http.expectOne(baseUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  it('gets method by id', () => {
    const mock = { code: 200, message: 'ok', data: {} };
    service.getById(5).subscribe((res) => expect(res).toEqual(mock));
    const req = http.expectOne(`${baseUrl}/search?id=5`);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });
});
