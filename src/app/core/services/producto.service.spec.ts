import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProductoService } from './producto.service';
import { environment } from '../../../environments/environment';
import { HandleErrorService } from './handle-error.service';

describe('ProductoService', () => {
  let service: ProductoService;
  let http: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/productos`;

  const mockHandleErrorService = {
    handleError: jest.fn((error: any) => { throw error; })
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: HandleErrorService, useValue: mockHandleErrorService }
      ]
    });
    service = TestBed.inject(ProductoService);
    http = TestBed.inject(HttpTestingController);
    jest.clearAllMocks();
  });

  afterEach(() => http.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('gets productos', () => {
    const mock = { code: 200, message: 'ok', data: [] };
    service.getProductos({ categoria: '1' }).subscribe(res => expect(res).toEqual(mock));
    const req = http.expectOne(`${baseUrl}?categoria=1`);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  it('creates producto', () => {
    const form = new FormData();
    form.append('nombre', 'test');
    const mock = { code: 200, message: 'ok', data: {} };
    service.createProducto(form).subscribe(res => expect(res).toEqual(mock));
    const req = http.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toBe(form);
    req.flush(mock);
  });

  it('gets producto by id', () => {
    const mock = { code: 200, message: 'ok', data: {} };
    service.getProductoById(2).subscribe(res => expect(res).toEqual(mock));
    const req = http.expectOne(`${baseUrl}/search?id=2`);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  it('updates producto', () => {
    const form = new FormData();
    const mock = { code: 200, message: 'ok', data: {} };
    service.updateProducto(3, form).subscribe(res => expect(res).toEqual(mock));
    const req = http.expectOne(`${baseUrl}?id=3`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toBe(form);
    req.flush(mock);
  });

  it('handles error on getProductos', () => {
    service.getProductos().subscribe({
      next: () => fail('should have failed'),
      error: err => expect(err).toBeTruthy()
    });
    const req = http.expectOne(`${baseUrl}`);
    req.error(new ErrorEvent('Network error'));
    expect(mockHandleErrorService.handleError).toHaveBeenCalled();
  });

  it('handles error on createProducto', () => {
    const form = new FormData();
    service.createProducto(form).subscribe({
      next: () => fail('should have failed'),
      error: err => expect(err).toBeTruthy()
    });
    const req = http.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    req.error(new ErrorEvent('Network error'));
    expect(mockHandleErrorService.handleError).toHaveBeenCalled();
  });

  it('handles error on getProductoById', () => {
    service.getProductoById(2).subscribe({
      next: () => fail('should have failed'),
      error: err => expect(err).toBeTruthy()
    });
    const req = http.expectOne(`${baseUrl}/search?id=2`);
    req.error(new ErrorEvent('Network error'));
    expect(mockHandleErrorService.handleError).toHaveBeenCalled();
  });

  it('handles error on updateProducto', () => {
    const form = new FormData();
    service.updateProducto(3, form).subscribe({
      next: () => fail('should have failed'),
      error: err => expect(err).toBeTruthy()
    });
    const req = http.expectOne(`${baseUrl}?id=3`);
    expect(req.request.method).toBe('PUT');
    req.error(new ErrorEvent('Network error'));
    expect(mockHandleErrorService.handleError).toHaveBeenCalled();
  });
});
