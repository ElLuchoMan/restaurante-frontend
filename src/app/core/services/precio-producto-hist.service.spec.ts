import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { createHandleErrorServiceMock } from '../../shared/mocks/test-doubles';
import { HandleErrorService } from './handle-error.service';
import { PrecioProductoHistService } from './precio-producto-hist.service';

describe('PrecioProductoHistService', () => {
  let service: PrecioProductoHistService;
  let http: HttpTestingController;
  const baseUrl = environment.apiUrl;
  const mockHandle = createHandleErrorServiceMock();

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PrecioProductoHistService, { provide: HandleErrorService, useValue: mockHandle }],
    });
    service = TestBed.inject(PrecioProductoHistService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('list sin filtros no agrega parámetros', () => {
    const mock = { code: 200, message: 'ok', data: [] };
    service.list().subscribe((res) => expect(res).toEqual(mock));
    const req = http.expectOne(`${baseUrl}/precio_producto_hist`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.keys().length).toBe(0);
    req.flush(mock);
  });

  it('lists with filters', () => {
    const mock = { code: 200, message: 'ok', data: [] };
    service.list(1, '2025-02-01').subscribe((res) => expect(res).toEqual(mock));
    const req = http.expectOne(`${baseUrl}/precio_producto_hist?producto_id=1&fecha=2025-02-01`);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  it('gets by id', () => {
    const mock = { code: 200, message: 'ok', data: { productoId: 1 } } as any;
    service.getById(9).subscribe((res) => expect(res).toEqual(mock));
    const req = http.expectOne(`${baseUrl}/precio_producto_hist/search?id=9`);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });
});
