import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  mockCuponBienvenida,
  mockListaCupones,
  mockRedencionCupon,
  mockValidarCuponExitoso,
} from '../../shared/mocks/cupon.mock';
import { createHandleErrorServiceMock } from '../../shared/mocks/test-doubles';
import { CrearCuponRequest, ValidarCuponRequest } from '../../shared/models/cupon.model';
import { CuponService } from './cupon.service';
import { HandleErrorService } from './handle-error.service';

describe('CuponService', () => {
  let service: CuponService;
  let http: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/cupones`;
  const mockHandleErrorService = createHandleErrorServiceMock();

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: HandleErrorService, useValue: mockHandleErrorService }],
    });
    service = TestBed.inject(CuponService);
    http = TestBed.inject(HttpTestingController);
    jest.clearAllMocks();
  });

  afterEach(() => http.verify());

  const crearBody: CrearCuponRequest = {
    codigo: 'X12',
    scope: 'CLIENTE',
    tipoDescuento: 'PORCENTAJE',
    valorDescuento: 10,
    fechaInicio: '2025-01-01',
    fechaFin: '2025-12-31',
    documentoCliente: 1015466495,
  };

  it('crea cupón (POST /cupones con documentoCliente)', () => {
    service.crear(crearBody).subscribe((res) => expect(res).toEqual(mockCuponBienvenida));
    const req = http.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(crearBody);
    req.flush(mockCuponBienvenida);
  });

  it('lista cupones con los query params que lee el back y respuesta paginada', () => {
    service
      .listar({
        limit: 10,
        offset: 20,
        activo: true,
        scope: 'GLOBAL',
        codigo: 'BIEN',
        fecha_desde: '2025-01-01',
        fecha_hasta: '2025-12-31',
      })
      .subscribe((res) => expect(res.data.data).toHaveLength(3));
    const req = http.expectOne((r) => r.url === baseUrl);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('limit')).toBe('10');
    expect(req.request.params.get('offset')).toBe('20');
    expect(req.request.params.get('activo')).toBe('true');
    expect(req.request.params.get('scope')).toBe('GLOBAL');
    expect(req.request.params.get('codigo')).toBe('BIEN');
    expect(req.request.params.get('fecha_desde')).toBe('2025-01-01');
    expect(req.request.params.get('fecha_hasta')).toBe('2025-12-31');
    req.flush(mockListaCupones);
  });

  it('obtiene cupón por id usando GET /cupones/search?id=', () => {
    service.obtener(1).subscribe((res) => expect(res).toEqual(mockCuponBienvenida));
    const req = http.expectOne(`${baseUrl}/search?id=1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockCuponBienvenida);
  });

  it('obtiene cupón por código usando el mismo parámetro id', () => {
    service.obtener('BIENVENIDA10').subscribe();
    const req = http.expectOne(`${baseUrl}/search?id=BIENVENIDA10`);
    expect(req.request.method).toBe('GET');
    req.flush(mockCuponBienvenida);
  });

  it('actualiza cupón usando PUT /cupones?id=', () => {
    service.actualizar(2, crearBody).subscribe((res) => expect(res).toEqual(mockCuponBienvenida));
    const req = http.expectOne(`${baseUrl}?id=2`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(crearBody);
    req.flush(mockCuponBienvenida);
  });

  it('actualizar con merge envía sólo lo presente, null para limpiar anulables y activo', () => {
    const body = { activo: true, maxUsos: null, montoMinimo: null, productoId: null };
    service.actualizar(2, body).subscribe();
    const req = http.expectOne(`${baseUrl}?id=2`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(body);
    req.flush(mockCuponBienvenida);
  });

  it('crear propaga 409 (código duplicado) como error HTTP', () => {
    service.crear(crearBody).subscribe({ error: (err) => expect(err).toBeTruthy() });
    http
      .expectOne(baseUrl)
      .flush({ code: 409, message: 'código duplicado' }, { status: 409, statusText: 'Conflict' });
    expect(mockHandleErrorService.handleError.mock.calls[0][0]).toMatchObject({ status: 409 });
  });

  it('valida cupón con pedidoId (el back usa el detalle real del pedido)', () => {
    const body: ValidarCuponRequest = { codigo: 'X', clienteId: 1, pedidoId: 3 };
    service.validar(body).subscribe((res) => expect(res).toEqual(mockValidarCuponExitoso));
    const req = http.expectOne(`${baseUrl}/validar`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush(mockValidarCuponExitoso);
  });

  it('un Cliente valida sin clienteId (sale del token) con ítems de vista previa', () => {
    const body: ValidarCuponRequest = {
      codigo: 'X',
      items: [{ productoId: 1, cantidad: 1, precio: 1000 }],
    };
    service.validar(body).subscribe();
    const req = http.expectOne(`${baseUrl}/validar`);
    expect(req.request.body).toEqual(body);
    expect(req.request.body).not.toHaveProperty('clienteId');
    req.flush(mockValidarCuponExitoso);
  });

  it.each([
    [400, 'faltan datos'],
    [403, 'pedido de otro cliente'],
    [404, 'pedido inexistente'],
  ])('validar propaga %i (%s) como error HTTP', (status, message) => {
    service.validar({ codigo: 'X', pedidoId: 3 }).subscribe({
      error: (err) => expect(err).toBeTruthy(),
    });
    http
      .expectOne(`${baseUrl}/validar`)
      .flush({ code: status, message }, { status, statusText: message });
    expect(mockHandleErrorService.handleError.mock.calls[0][0]).toMatchObject({ status });
  });

  it('redime cupón (POST /cupones/{codigo}/redimir)', () => {
    const body = { clienteId: 1, pedidoId: 2 };
    service.redimir('COD 1', body).subscribe((res) => expect(res).toEqual(mockRedencionCupon));
    const req = http.expectOne(`${baseUrl}/COD%201/redimir`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush(mockRedencionCupon);
  });

  it('un Cliente redime sin clienteId (sale del token)', () => {
    service.redimir('X', { pedidoId: 2 }).subscribe();
    const req = http.expectOne(`${baseUrl}/X/redimir`);
    expect(req.request.body).toEqual({ pedidoId: 2 });
    req.flush(mockRedencionCupon);
  });

  it.each([
    [403, 'clienteId distinto del token'],
    [409, 'agotado, ya redimido o pedido cerrado'],
    [422, 'cupón no aplicable'],
  ])('redimir propaga %i (%s) como error HTTP', (status, message) => {
    service.redimir('X', { pedidoId: 2 }).subscribe({ error: (err) => expect(err).toBeTruthy() });
    http
      .expectOne(`${baseUrl}/X/redimir`)
      .flush({ code: status, message }, { status, statusText: message });
    expect(mockHandleErrorService.handleError.mock.calls[0][0]).toMatchObject({ status });
  });

  it.each<[string, () => Observable<unknown>, string]>([
    ['listar', () => service.listar(), baseUrl],
    ['obtener', () => service.obtener(1), `${baseUrl}/search?id=1`],
    ['listarRedenciones', () => service.listarRedenciones(), `${baseUrl}/redenciones`],
  ])('%s propaga 403 (solo Administrador) como error HTTP', (_nombre, llamar, url) => {
    llamar().subscribe({ error: (err: unknown) => expect(err).toBeTruthy() });
    http
      .expectOne(url)
      .flush(
        { code: 403, message: 'Se requiere rol Administrador' },
        { status: 403, statusText: 'Forbidden' },
      );
    expect(mockHandleErrorService.handleError.mock.calls[0][0]).toMatchObject({ status: 403 });
  });

  it('lista redenciones con los query params del back', () => {
    service
      .listarRedenciones({ limit: 5, offset: 0, cupon_codigo: 'X', cupon_id: 2, cliente_id: 7 })
      .subscribe();
    const req = http.expectOne((r) => r.url === `${baseUrl}/redenciones`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('limit')).toBe('5');
    expect(req.request.params.get('offset')).toBe('0');
    expect(req.request.params.get('cupon_codigo')).toBe('X');
    expect(req.request.params.get('cupon_id')).toBe('2');
    expect(req.request.params.get('cliente_id')).toBe('7');
    req.flush({
      code: 200,
      message: 'ok',
      data: { data: [], total: 0, page: 1, pageSize: 20, totalPages: 0 },
    });
  });

  it('listar sin params no agrega query params', () => {
    service.listar().subscribe();
    const req = http.expectOne(baseUrl);
    expect(req.request.params.keys().length).toBe(0);
    req.flush(mockListaCupones);
  });

  it('listar omite valores undefined y null', () => {
    service
      .listar({ limit: undefined, offset: null as unknown as number, activo: false })
      .subscribe();
    const req = http.expectOne((r) => r.url === baseUrl);
    expect(req.request.params.has('limit')).toBe(false);
    expect(req.request.params.has('offset')).toBe(false);
    expect(req.request.params.get('activo')).toBe('false');
    req.flush(mockListaCupones);
  });

  it('desactiva con DELETE /cupones?id=', () => {
    service.desactivar(7).subscribe();
    const req = http.expectOne((r) => r.url === baseUrl);
    expect(req.request.method).toBe('DELETE');
    expect(req.request.params.get('id')).toBe('7');
    req.flush({ code: 200, message: 'ok' });
  });

  it('listarRedenciones sin params no agrega query params', () => {
    service.listarRedenciones().subscribe();
    const req = http.expectOne(`${baseUrl}/redenciones`);
    expect(req.request.params.keys().length).toBe(0);
    req.flush({ code: 200, message: 'ok', data: { data: [] } });
  });

  it('listarRedenciones omite undefined/null y envía el resto', () => {
    service.listarRedenciones({ limit: undefined, offset: 0 }).subscribe();
    const req = http.expectOne((r) => r.url === `${baseUrl}/redenciones`);
    expect(req.request.params.has('limit')).toBe(false);
    expect(req.request.params.get('offset')).toBe('0');
    req.flush({ code: 200, message: 'ok', data: { data: [] } });
  });

  it('propaga errores HTTP a HandleErrorService', () => {
    service.obtener(1).subscribe({ error: (err) => expect(err).toBeTruthy() });
    http.expectOne(`${baseUrl}/search?id=1`).error(new ErrorEvent('Network error'));
    expect(mockHandleErrorService.handleError).toHaveBeenCalled();
  });
});
