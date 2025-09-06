import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { createHandleErrorServiceMock } from '../../shared/mocks/test-doubles';
import { HandleErrorService } from './handle-error.service';
import { ProductoService } from './producto.service';

describe('ProductoService', () => {
  let service: ProductoService;
  let http: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/productos`;

  const mockHandleErrorService = createHandleErrorServiceMock();

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: HandleErrorService, useValue: mockHandleErrorService }],
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
    service.getProductos({ categoria: '1' }).subscribe((res) => expect(res).toEqual(mock));
    const req = http.expectOne(`${baseUrl}?categoria=1`);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  it('creates producto', () => {
    const producto = { nombre: 'test', precio: 1, cantidad: 1 } as any;
    const mock = { code: 200, message: 'ok', data: {} };
    service.createProducto(producto).subscribe((res) => expect(res).toEqual(mock));
    const req = http.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(producto);
    req.flush(mock);
  });

  it('gets producto by id', () => {
    const mock = { code: 200, message: 'ok', data: {} };
    service.getProductoById(2).subscribe((res) => expect(res).toEqual(mock));
    const req = http.expectOne(`${baseUrl}/search?id=2`);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  it('updates producto', () => {
    const producto = { nombre: 't', precio: 1, cantidad: 1 } as any;
    const mock = { code: 200, message: 'ok', data: {} };
    service.updateProducto(3, producto).subscribe((res) => expect(res).toEqual(mock));
    const req = http.expectOne(`${baseUrl}?id=3`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(producto);
    req.flush(mock);
  });

  it('handles error on getProductos', () => {
    service.getProductos().subscribe({
      next: () => fail('should have failed'),
      error: (err) => expect(err).toBeTruthy(),
    });
    const req = http.expectOne(`${baseUrl}`);
    req.error(new ErrorEvent('Network error'));
    expect(mockHandleErrorService.handleError).toHaveBeenCalled();
  });

  it('handles error on createProducto', () => {
    const producto = { nombre: 't', precio: 1, cantidad: 1 } as any;
    service.createProducto(producto).subscribe({
      next: () => fail('should have failed'),
      error: (err) => expect(err).toBeTruthy(),
    });
    const req = http.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    req.error(new ErrorEvent('Network error'));
    expect(mockHandleErrorService.handleError).toHaveBeenCalled();
  });

  it('handles error on getProductoById', () => {
    service.getProductoById(2).subscribe({
      next: () => fail('should have failed'),
      error: (err) => expect(err).toBeTruthy(),
    });
    const req = http.expectOne(`${baseUrl}/search?id=2`);
    req.error(new ErrorEvent('Network error'));
    expect(mockHandleErrorService.handleError).toHaveBeenCalled();
  });

  it('handles error on updateProducto', () => {
    const producto = { nombre: 't', precio: 1, cantidad: 1 } as any;
    service.updateProducto(3, producto).subscribe({
      next: () => fail('should have failed'),
      error: (err) => expect(err).toBeTruthy(),
    });
    const req = http.expectOne(`${baseUrl}?id=3`);
    expect(req.request.method).toBe('PUT');
    req.error(new ErrorEvent('Network error'));
    expect(mockHandleErrorService.handleError).toHaveBeenCalled();
  });
});
