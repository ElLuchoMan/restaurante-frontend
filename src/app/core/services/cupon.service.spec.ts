import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { createHandleErrorServiceMock } from '../../shared/mocks/test-doubles';
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

  it('crea cupón', () => {
    const body = {
      codigo: 'X',
      scope: 'GLOBAL',
      tipoDescuento: 'PORCENTAJE',
      valorDescuento: 10,
      fechaInicio: '2025-01-01',
      fechaFin: '2025-12-31',
    } as any;
    service.crear(body).subscribe();
    const req = http.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush({ code: 200, message: 'ok', data: {} });
  });

  it('lista cupones con params', () => {
    service.listar({ limit: 10, activo: true }).subscribe();
    const req = http.expectOne(
      (r) =>
        r.url === baseUrl && r.params.get('limit') === '10' && r.params.get('activo') === 'true',
    );
    expect(req.request.method).toBe('GET');
    req.flush({ code: 200, message: 'ok', data: [] });
  });

  it('obtiene cupón por id', () => {
    service.obtener(1).subscribe();
    const req = http.expectOne(`${baseUrl}/1`);
    expect(req.request.method).toBe('GET');
    req.flush({ code: 200, message: 'ok', data: {} });
  });

  it('actualiza cupón', () => {
    const body = { activo: false } as any;
    service.actualizar(2, body).subscribe();
    const req = http.expectOne(`${baseUrl}/2`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(body);
    req.flush({ code: 200, message: 'ok', data: {} });
  });

  it('valida cupón', () => {
    const body = {
      codigo: 'X',
      clienteId: 1,
      items: [{ productoId: 1, cantidad: 1, precio: 1000 }],
    } as any;
    service.validar(body).subscribe();
    const req = http.expectOne(`${baseUrl}/validar`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush({ code: 200, message: 'ok', data: { aplicable: true, montoDescuento: 0 } });
  });

  it('redime cupón', () => {
    const body = { clienteId: 1, pedidoId: 2 } as any;
    service.redimir('COD', body).subscribe();
    const req = http.expectOne(`${baseUrl}/COD/redimir`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush({ code: 200, message: 'ok', data: {} });
  });

  it('lista redenciones', () => {
    service.listarRedenciones({ limit: 5 }).subscribe();
    const req = http.expectOne(
      (r) => r.url === `${baseUrl}/redenciones` && r.params.get('limit') === '5',
    );
    expect(req.request.method).toBe('GET');
    req.flush({ code: 200, message: 'ok', data: [] });
  });
});
