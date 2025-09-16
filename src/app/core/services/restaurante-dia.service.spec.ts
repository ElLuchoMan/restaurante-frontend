import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { createHandleErrorServiceMock } from '../../shared/mocks/test-doubles';
import { HandleErrorService } from './handle-error.service';
import { RestauranteDiaService } from './restaurante-dia.service';

describe('RestauranteDiaService', () => {
  let service: RestauranteDiaService;
  let http: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/restaurante_dia`;
  const mockHandle = createHandleErrorServiceMock();

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [RestauranteDiaService, { provide: HandleErrorService, useValue: mockHandle }],
    });
    service = TestBed.inject(RestauranteDiaService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lists con filtros', () => {
    const mock = { code: 200, message: 'ok', data: [] };
    service.list(1, 'Lunes').subscribe((res) => expect(res).toEqual(mock));
    const req = http.expectOne(`${baseUrl}?restaurante_id=1&dia=Lunes`);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  it('get by id', () => {
    const mock = { code: 200, message: 'ok', data: { restauranteId: 1 } } as any;
    service.getById(9).subscribe((res) => expect(res).toEqual(mock));
    const req = http.expectOne(`${baseUrl}/search?id=9`);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });
});
