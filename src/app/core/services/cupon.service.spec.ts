import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

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

  it('actualiza cupón usando PUT /cupones?id= con el body completo', () => {
    service.actualizar(2, crearBody).subscribe((res) => expect(res).toEqual(mockCuponBienvenida));
    const req = http.expectOne(`${baseUrl}?id=2`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(crearBody);
    req.flush(mockCuponBienvenida);
  });

  it('valida cupón', () => {
    const body: ValidarCuponRequest = {
      codigo: 'X',
      clienteId: 1,
      pedidoId: 3,
      items: [{ productoId: 1, cantidad: 1, precio: 1000 }],
    };
    service.validar(body).subscribe((res) => expect(res).toEqual(mockValidarCuponExitoso));
    const req = http.expectOne(`${baseUrl}/validar`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush(mockValidarCuponExitoso);
  });

  it('redime cupón (ruta con código; el router del back aún no la registra)', () => {
    const body = { clienteId: 1, pedidoId: 2 };
    service.redimir('COD 1', body).subscribe((res) => expect(res).toEqual(mockRedencionCupon));
    const req = http.expectOne(`${baseUrl}/COD%201/redimir`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush(mockRedencionCupon);
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
    req.flush({ code: 200, message: 'ok', data: { data: null } });
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
