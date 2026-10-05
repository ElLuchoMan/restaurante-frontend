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

  it('actualiza oferta usando PUT /ofertas?id= con el body completo', () => {
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

  it('obtenerActivas admite data null cuando no hay ofertas activas', () => {
    service.obtenerActivas({ restaurante_id: 1 }).subscribe((res) => expect(res.data).toBeNull());
    const req = http.expectOne((r) => r.url === `${baseUrl}/activas`);
    req.flush({ code: 200, message: 'ok', data: null });
  });

  it('asocia producto con POST /ofertas/productos?id=', () => {
    service.asociarProducto(1, { productoId: 2 }).subscribe();
    const req = http.expectOne(`${baseUrl}/productos?id=1`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ productoId: 2 });
    req.flush({ code: 201, message: 'ok' });
  });

  it('desasocia producto con DELETE /ofertas/productos?id=&producto_id=', () => {
    service.desasociarProducto(1, 2).subscribe();
    const req = http.expectOne((r) => r.url === `${baseUrl}/productos`);
    expect(req.request.method).toBe('DELETE');
    expect(req.request.params.get('id')).toBe('1');
    expect(req.request.params.get('producto_id')).toBe('2');
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
    req.flush({ code: 200, message: 'ok', data: { data: null, total: 0, page: 1, pageSize: 20 } });
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
