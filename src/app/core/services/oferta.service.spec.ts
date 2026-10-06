import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { mockOfertaMartes, mockOfertasActivas } from '../../shared/mocks/oferta.mock';
import { createHandleErrorServiceMock } from '../../shared/mocks/test-doubles';
import { CrearOfertaRequest } from '../../shared/models/oferta.model';
import { HandleErrorService } from './handle-error.service';
import { OfertaService } from './oferta.service';

describe('OfertaService', () => {
  let service: OfertaService;
  let http: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/ofertas`;
  const mockHandleErrorService = createHandleErrorServiceMock();

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: HandleErrorService, useValue: mockHandleErrorService }],
    });
    service = TestBed.inject(OfertaService);
    http = TestBed.inject(HttpTestingController);
    jest.clearAllMocks();
  });

  afterEach(() => http.verify());

  const crearBody: CrearOfertaRequest = {
    titulo: 't',
    tipoDescuento: 'PORCENTAJE',
    valorDescuento: 10,
    fechaInicio: '2025-01-01',
    fechaFin: '2025-12-31',
    diasSemana: ['Martes'],
    horaInicio: '10:00',
    horaFin: '12:00:00',
    restauranteId: 1,
  };

  it('crea oferta (POST /ofertas con el body del back)', () => {
    service.crear(crearBody).subscribe((res) => expect(res).toEqual(mockOfertaMartes));
    const req = http.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(crearBody);
    req.flush(mockOfertaMartes);
  });

  it('lista ofertas con los query params que lee el back y respuesta paginada', () => {
    const paginado = {
      code: 200,
      message: 'ok',
      data: { data: [mockOfertaMartes.data], total: 1, page: 1, pageSize: 10, totalPages: 1 },
    };
    service
      .listar({ limit: 10, offset: 0, activo: true, restaurante_id: 1, titulo: 'Mar' })
      .subscribe((res) => expect(res.data.data).toEqual([mockOfertaMartes.data]));
    const req = http.expectOne((r) => r.url === baseUrl);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('limit')).toBe('10');
    expect(req.request.params.get('offset')).toBe('0');
    expect(req.request.params.get('activo')).toBe('true');
    expect(req.request.params.get('restaurante_id')).toBe('1');
    expect(req.request.params.get('titulo')).toBe('Mar');
    req.flush(paginado);
  });

  it('obtiene oferta por id usando GET /ofertas/search?id=', () => {
    service.obtener(1).subscribe((res) => expect(res).toEqual(mockOfertaMartes));
    const req = http.expectOne(`${baseUrl}/search?id=1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockOfertaMartes);
  });

  it('actualiza oferta usando PUT /ofertas?id=', () => {
    service.actualizar(2, crearBody).subscribe((res) => expect(res).toEqual(mockOfertaMartes));
    const req = http.expectOne(`${baseUrl}?id=2`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(crearBody);
    req.flush(mockOfertaMartes);
  });

  it('obtiene ofertas activas (público) con los query params del back', () => {
    service
      .obtenerActivas({ restaurante_id: 1, fecha: '2025-01-07', hora: '10:30', producto_id: 4 })
      .subscribe((res) => expect(res).toEqual(mockOfertasActivas));
    const req = http.expectOne((r) => r.url === `${baseUrl}/activas`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('restaurante_id')).toBe('1');
    expect(req.request.params.get('fecha')).toBe('2025-01-07');
    expect(req.request.params.get('hora')).toBe('10:30');
    expect(req.request.params.get('producto_id')).toBe('4');
    req.flush(mockOfertasActivas);
  });

  it('obtenerActivas devuelve [] cuando no hay ofertas activas', () => {
    service.obtenerActivas({ restaurante_id: 1 }).subscribe((res) => expect(res.data).toEqual([]));
    const req = http.expectOne((r) => r.url === `${baseUrl}/activas`);
    req.flush({ code: 200, message: 'ok', data: [] });
  });

  it('actualizar con merge envía sólo los campos presentes y null para quitar el horario', () => {
    const body = { activo: true, horaInicio: null, horaFin: null };
    service.actualizar(2, body).subscribe();
    const req = http.expectOne(`${baseUrl}?id=2`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(body);
    req.flush(mockOfertaMartes);
  });

  it('propaga el error HTTP real (409 título duplicado) con su mensaje', () => {
    service.crear(crearBody).subscribe({ error: (err) => expect(err).toBeTruthy() });
    http
      .expectOne(baseUrl)
      .flush(
        { code: 409, message: 'Ya existe una oferta con ese título' },
        { status: 409, statusText: 'Conflict' },
      );
    expect(mockHandleErrorService.handleError.mock.calls[0][0]).toMatchObject({
      status: 409,
      error: { message: 'Ya existe una oferta con ese título' },
    });
  });

  it('asociarProducto propaga 404 como error HTTP (ya no llega como 200)', () => {
    service
      .asociarProducto(1, { productoId: 99 })
      .subscribe({ error: (err) => expect(err).toBeTruthy() });
    http
      .expectOne(`${baseUrl}/productos?id=1`)
      .flush({ code: 404, message: 'no existe' }, { status: 404, statusText: 'Not Found' });
    expect(mockHandleErrorService.handleError.mock.calls[0][0]).toMatchObject({ status: 404 });
  });

  it('asocia producto con POST /ofertas/productos?id=', () => {
    service.asociarProducto(1, { productoId: 2 }).subscribe();
    const req = http.expectOne(`${baseUrl}/productos?id=1`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ productoId: 2 });
    req.flush({ code: 201, message: 'ok', data: { ofertaId: 1, productoId: 2 } });
  });

  it('desasocia producto con DELETE /ofertas/productos?id=&producto_id=', () => {
    service.desasociarProducto(1, 2).subscribe();
    const req = http.expectOne((r) => r.url === `${baseUrl}/productos`);
    expect(req.request.method).toBe('DELETE');
    expect(req.request.params.get('id')).toBe('1');
    expect(req.request.params.get('producto_id')).toBe('2');
    req.flush({ code: 200, message: 'ok' });
  });

  it('desactiva con DELETE /ofertas?id=', () => {
    service.desactivar(5).subscribe();
    const req = http.expectOne((r) => r.url === baseUrl);
    expect(req.request.method).toBe('DELETE');
    expect(req.request.params.get('id')).toBe('5');
    req.flush({ code: 200, message: 'ok' });
  });

  it('listar sin params no agrega query params', () => {
    service.listar().subscribe();
    const req = http.expectOne(baseUrl);
    expect(req.request.params.keys().length).toBe(0);
    req.flush({ code: 200, message: 'ok', data: { data: [], total: 0, page: 1, pageSize: 20 } });
  });

  it('listar omite valores null/undefined', () => {
    service.listar({ limit: undefined, offset: null as unknown as number }).subscribe();
    const req = http.expectOne((r) => r.url === baseUrl);
    expect(req.request.params.keys().length).toBe(0);
    req.flush({ code: 200, message: 'ok', data: { data: [], total: 0, page: 1, pageSize: 20 } });
  });

  it('obtenerActivas omite valores null/undefined', () => {
    service
      .obtenerActivas({
        restaurante_id: 1,
        fecha: undefined,
        hora: null as unknown as string,
      })
      .subscribe();
    const req = http.expectOne((r) => r.url === `${baseUrl}/activas`);
    expect(req.request.params.get('restaurante_id')).toBe('1');
    expect(req.request.params.has('fecha')).toBe(false);
    expect(req.request.params.has('hora')).toBe(false);
    req.flush({ code: 200, message: 'ok', data: [] });
  });

  it('propaga errores HTTP a HandleErrorService', () => {
    service.obtener(1).subscribe({ error: (err) => expect(err).toBeTruthy() });
    http.expectOne(`${baseUrl}/search?id=1`).error(new ErrorEvent('Network error'));
    expect(mockHandleErrorService.handleError).toHaveBeenCalled();
  });
});
