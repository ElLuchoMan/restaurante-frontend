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
    service
      .getProductos({ onlyActive: true, includeImage: false })
      .subscribe((res) => expect(res).toEqual(mock));
    const req = http.expectOne(`${baseUrl}?includeImage=false&onlyActive=true`);
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

  it('creates producto with File using FormData', () => {
    const producto = { nombre: 'test', precio: 1, cantidad: 1 } as any;
    const mock = { code: 200, message: 'ok', data: {} };
    const file = new Blob(['x'], { type: 'image/jpeg' }) as any as File;
    (file as any).name = 'a.jpg';
    service.createProducto(producto, file).subscribe((res) => expect(res).toEqual(mock));
    const req = http.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body instanceof FormData).toBe(true);
    req.flush(mock);
  });

  it('creates producto with File and optional fields in FormData', () => {
    const producto = {
      nombre: 'completo',
      precio: 10,
      cantidad: 3,
      calorias: 500,
      descripcion: 'rico',
      estadoProducto: 'DISPONIBLE',
      subcategoriaId: 9,
    } as any;
    const file = new Blob(['x'], { type: 'image/jpeg' }) as any as File;
    (file as any).name = 'b.jpg';
    const mock = { code: 200, message: 'ok', data: {} };
    service.createProducto(producto, file).subscribe((res) => expect(res).toEqual(mock));
    const req = http.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    const fd: FormData = req.request.body as any;
    expect(fd instanceof FormData).toBe(true);
    expect((fd as any).has('nombre')).toBe(true);
    expect((fd as any).has('precio')).toBe(true);
    expect((fd as any).has('cantidad')).toBe(true);
    expect((fd as any).has('calorias')).toBe(true);
    expect((fd as any).has('descripcion')).toBe(true);
    expect((fd as any).has('estadoProducto')).toBe(true);
    expect((fd as any).has('subcategoriaId')).toBe(true);
    expect((fd as any).has('imagen')).toBe(true);
    req.flush(mock);
  });

  it('gets producto by id', () => {
    const mock = { code: 200, message: 'ok', data: {} };
    service.getProductoById(2).subscribe((res) => expect(res).toEqual(mock));
    const req = http.expectOne(`${baseUrl}/search?id=2`);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  it('maps base64 image in list and respects http images', () => {
    const mock = {
      code: 200,
      message: 'ok',
      data: [
        { productoId: 1, imagen: 'RAWBASE64STRING' },
        { productoId: 2, imagen: 'http://example.com/x.jpg' },
      ],
    } as any;
    service.getProductos().subscribe((res) => {
      expect(res.data[0].imagen?.startsWith('data:image/jpeg;base64,')).toBe(true);
      expect(res.data[1].imagen).toBe('http://example.com/x.jpg');
    });
    const req = http.expectOne(`${baseUrl}`);
    req.flush(mock);
  });

  it('does not re-prefix data URL images in list', () => {
    const mock = {
      code: 200,
      message: 'ok',
      data: [{ productoId: 1, imagen: 'data:image/jpeg;base64,ABC' }],
    } as any;
    service.getProductos().subscribe((res) => {
      expect(res.data[0].imagen).toBe('data:image/jpeg;base64,ABC');
    });
    const req = http.expectOne(`${baseUrl}`);
    req.flush(mock);
  });

  it('handles undefined imagen in list using default fallback', () => {
    const mock = {
      code: 200,
      message: 'ok',
      data: [
        { productoId: 1, imagen: 'RAWBASE64STRING' },
        { productoId: 2, imagen: 'http://example.com/x.jpg' },
        { productoId: 3 },
      ],
    } as any;
    service.getProductos().subscribe((res) => {
      expect(res.data[2].imagen).toBe('assets/img/logo2.webp');
    });
    const req = http.expectOne(`${baseUrl}`);
    req.flush(mock);
  });

  it('maps null list responses to an empty array', () => {
    const mock = { code: 200, message: 'ok', data: null } as any;
    service.getProductos().subscribe((res) => {
      expect(Array.isArray(res.data)).toBe(true);
      expect(res.data).toHaveLength(0);
    });
    const req = http.expectOne(`${baseUrl}`);
    req.flush(mock);
  });

  it('does not re-prefix data URL in getById', () => {
    const mock = {
      code: 200,
      message: 'ok',
      data: { productoId: 7, imagen: 'data:image/jpeg;base64,ALREADY' },
    } as any;
    service.getProductoById(7).subscribe((res) => {
      expect(res.data.imagen).toBe('data:image/jpeg;base64,ALREADY');
    });
    const req = http.expectOne(`${baseUrl}/search?id=7`);
    req.flush(mock);
  });

  it('maps base64 image in getById', () => {
    const mock = {
      code: 200,
      message: 'ok',
      data: { productoId: 1, imagen: 'RAWBASE64' },
    } as any;
    service.getProductoById(1).subscribe((res) => {
      expect(res.data.imagen?.startsWith('data:image/jpeg;base64,')).toBe(true);
    });
    const req = http.expectOne(`${baseUrl}/search?id=1`);
    req.flush(mock);
  });

  it('passes through null data in getById', () => {
    const mock = { code: 200, message: 'ok', data: null } as any;
    service.getProductoById(1).subscribe((res) => {
      expect(res.data).toBeNull();
    });
    const req = http.expectOne(`${baseUrl}/search?id=1`);
    req.flush(mock);
  });

  it('getProductos sin params no agrega query params', () => {
    service.getProductos().subscribe();
    const req = http.expectOne(baseUrl);
    expect(req.request.params.keys().length).toBe(0);
    req.flush({ code: 200, message: 'ok', data: [] });
  });

  it('getProductos sólo envía includeImage', () => {
    service.getProductos({ includeImage: true }).subscribe();
    const req = http.expectOne((r) => r.url === baseUrl);
    expect(req.request.params.get('includeImage')).toBe('true');
    expect(req.request.params.has('onlyActive')).toBe(false);
    req.flush({ code: 200, message: 'ok', data: [] });
  });

  it('getProductos sólo envía onlyActive', () => {
    service.getProductos({ onlyActive: true }).subscribe();
    const req = http.expectOne((r) => r.url === baseUrl);
    expect(req.request.params.get('onlyActive')).toBe('true');
    expect(req.request.params.has('includeImage')).toBe(false);
    req.flush({ code: 200, message: 'ok', data: [] });
  });

  it('getProductos con objeto vacío no agrega query params', () => {
    service.getProductos({}).subscribe();
    const req = http.expectOne(baseUrl);
    expect(req.request.params.keys().length).toBe(0);
    req.flush({ code: 200, message: 'ok', data: [] });
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

  it('updates producto with File using FormData', () => {
    const producto = { nombre: 't', precio: 1, cantidad: 1 } as any;
    const mock = { code: 200, message: 'ok', data: {} };
    const file = new Blob(['x'], { type: 'image/jpeg' }) as any as File;
    (file as any).name = 'a.jpg';
    service.updateProducto(3, producto, file).subscribe((res) => expect(res).toEqual(mock));
    const req = http.expectOne(`${baseUrl}?id=3`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body instanceof FormData).toBe(true);
    req.flush(mock);
  });

  it('updates producto with File and optional fields in FormData', () => {
    const producto = {
      nombre: 'upd',
      precio: 2,
      cantidad: 4,
      calorias: 300,
      descripcion: 'desc',
      estadoProducto: 'NO_DISPONIBLE',
      subcategoriaId: 4,
    } as any;
    const file = new Blob(['x'], { type: 'image/jpeg' }) as any as File;
    (file as any).name = 'c.jpg';
    const mock = { code: 200, message: 'ok', data: {} };
    service.updateProducto(9, producto, file).subscribe((res) => expect(res).toEqual(mock));
    const req = http.expectOne(`${baseUrl}?id=9`);
    expect(req.request.method).toBe('PUT');
    const fd: FormData = req.request.body as any;
    expect(fd instanceof FormData).toBe(true);
    expect((fd as any).has('calorias')).toBe(true);
    expect((fd as any).has('descripcion')).toBe(true);
    expect((fd as any).has('estadoProducto')).toBe(true);
    expect((fd as any).has('cantidad')).toBe(true);
    expect((fd as any).has('subcategoriaId')).toBe(true);
    expect((fd as any).has('imagen')).toBe(true);
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

  it('deleteProducto elimina el recurso por id', () => {
    const mock = { code: 200, message: 'ok', data: {} };
    service.deleteProducto(12).subscribe((res) => expect(res).toEqual(mock));
    const req = http.expectOne(`${baseUrl}?id=12`);
    expect(req.request.method).toBe('DELETE');
    req.flush(mock);
  });

  it('createProducto con File omite campos opcionales ausentes (cantidad)', () => {
    const producto = { nombre: 'min', precio: 1 } as any;
    const file = new Blob(['x'], { type: 'image/jpeg' }) as any as File;
    (file as any).name = 'm.jpg';
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    service.createProducto(producto, file).subscribe();
    const req = http.expectOne(baseUrl);
    const fd: FormData = req.request.body as any;
    expect(fd.has('cantidad')).toBe(false);
    expect(fd.has('calorias')).toBe(false);
    expect(fd.has('subcategoriaId')).toBe(false);
    expect(fd.get('nombre')).toBe('min');
    req.flush({ code: 200, message: 'ok', data: {} });
  });

  it('updateProducto con File omite campos opcionales ausentes (cantidad)', () => {
    const producto = { nombre: 'min', precio: 1 } as any;
    const file = new Blob(['x'], { type: 'image/jpeg' }) as any as File;
    (file as any).name = 'm.jpg';
    service.updateProducto(5, producto, file).subscribe();
    const req = http.expectOne(`${baseUrl}?id=5`);
    const fd: FormData = req.request.body as any;
    expect(fd.has('cantidad')).toBe(false);
    expect(fd.has('estadoProducto')).toBe(false);
    expect(fd.get('nombre')).toBe('min');
    req.flush({ code: 200, message: 'ok', data: {} });
  });

  it('createProducto JSON quita el prefijo data URL de imagen (el back espera Base64 puro)', () => {
    const producto = {
      nombre: 'p',
      precio: 1,
      cantidad: 1,
      imagen: 'data:image/jpeg;base64,QUJD',
    } as any;
    service.createProducto(producto).subscribe();
    const req = http.expectOne(baseUrl);
    expect(req.request.body).toEqual({ ...producto, imagen: 'QUJD' });
    req.flush({ code: 201, message: 'ok', data: {} });
  });

  it('updateProducto JSON conserva imagen Base64 pura y calorias null', () => {
    const producto = { nombre: 'p', precio: 1, cantidad: 1, imagen: 'QUJD', calorias: null } as any;
    service.updateProducto(4, producto).subscribe();
    const req = http.expectOne(`${baseUrl}?id=4`);
    expect(req.request.body).toEqual(producto);
    req.flush({ code: 200, message: 'ok', data: {} });
  });

  it('FormData sólo contiene los campos que lee el back (no categoria/subcategoria/observaciones)', () => {
    const producto = {
      nombre: 'p',
      precio: 7,
      cantidad: 2,
      estadoProducto: 'DISPONIBLE',
      categoria: 'Bebidas',
      subcategoria: 'Gaseosas',
      observaciones: 'sin hielo',
      imagenBase64: 'XYZ',
    } as any;
    const file = new Blob(['x'], { type: 'image/jpeg' }) as any as File;
    service.createProducto(producto, file).subscribe();
    const req = http.expectOne(baseUrl);
    const fd = req.request.body as FormData;
    expect(Array.from(fd.keys()).sort()).toEqual(
      ['cantidad', 'estadoProducto', 'imagen', 'nombre', 'precio'].sort(),
    );
    expect(fd.get('precio')).toBe('7');
    req.flush({ code: 201, message: 'ok', data: {} });
  });
});
