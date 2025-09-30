import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { createHandleErrorServiceMock } from '../../shared/mocks/test-doubles';
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

  it('crea oferta', () => {
    const body = {
      titulo: 't',
      tipoDescuento: 'PORCENTAJE',
      valorDescuento: 10,
      fechaInicio: '2025-01-01',
      fechaFin: '2025-12-31',
      restauranteId: 1,
    } as any;
    service.crear(body).subscribe();
    const req = http.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush({ code: 200, message: 'ok', data: {} });
  });

  it('lista ofertas con params', () => {
    service.listar({ limit: 10 }).subscribe();
    const req = http.expectOne((r) => r.url === baseUrl && r.params.get('limit') === '10');
    expect(req.request.method).toBe('GET');
    req.flush({ code: 200, message: 'ok', data: [] });
  });

  it('obtiene oferta por id', () => {
    service.obtener(1).subscribe();
    const req = http.expectOne(`${baseUrl}/1`);
    expect(req.request.method).toBe('GET');
    req.flush({ code: 200, message: 'ok', data: {} });
  });

  it('actualiza oferta', () => {
    const body = { titulo: 'nuevo' } as any;
    service.actualizar(2, body).subscribe();
    const req = http.expectOne(`${baseUrl}/2`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(body);
    req.flush({ code: 200, message: 'ok', data: {} });
  });

  it('obtiene ofertas activas (público)', () => {
    service.obtenerActivas({ restaurante_id: 1 }).subscribe();
    const req = http.expectOne(
      (r) => r.url === `${baseUrl}/activas` && r.params.get('restaurante_id') === '1',
    );
    expect(req.request.method).toBe('GET');
    req.flush({ code: 200, message: 'ok', data: [] });
  });

  it('asocia y desasocia producto', () => {
    service.asociarProducto(1, { productoId: 2 }).subscribe();
    const req1 = http.expectOne(`${baseUrl}/1/productos`);
    expect(req1.request.method).toBe('POST');
    expect(req1.request.body).toEqual({ productoId: 2 });
    req1.flush({ code: 200, message: 'ok', data: {} });

    service.desasociarProducto(1, 2).subscribe();
    const req2 = http.expectOne(`${baseUrl}/1/productos/2`);
    expect(req2.request.method).toBe('DELETE');
    req2.flush({ code: 200, message: 'ok', data: {} });
  });
});
