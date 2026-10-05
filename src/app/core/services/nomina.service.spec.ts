import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { estadoNomina } from '../../shared/constants';
import {
  mockNominaBody,
  mockNominaFecha,
  mockNominaPagaResponse,
  mockNominaResponse,
} from '../../shared/mocks/nomina.mock';
import { createHandleErrorServiceMock } from '../../shared/mocks/test-doubles';
import { ApiResponse } from '../../shared/models/api-response.model';
import { Nomina } from '../../shared/models/nomina.model';
import { HandleErrorService } from './handle-error.service';
import { NominaService } from './nomina.service';

describe('NominaService', () => {
  let service: NominaService;
  let http: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/nominas`;
  const mockHandle = createHandleErrorServiceMock();

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [NominaService, { provide: HandleErrorService, useValue: mockHandle }],
    });
    service = TestBed.inject(NominaService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('list sin filtros no agrega parámetros y devuelve data', () => {
    service.list().subscribe((res) => expect(res).toEqual(mockNominaResponse.data));
    const req = http.expectOne(baseUrl);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.keys().length).toBe(0);
    req.flush(mockNominaResponse);
  });

  it('lists nominas con filtros', () => {
    service
      .list({ fecha: '2025-01-22', mes: 1, anio: 2025 })
      .subscribe((res) => expect(res).toEqual(mockNominaFecha.data));
    const req = http.expectOne(`${baseUrl}?fecha=2025-01-22&mes=1&anio=2025`);
    expect(req.request.method).toBe('GET');
    req.flush(mockNominaFecha);
  });

  it('list devuelve [] cuando el backend responde code 404 sin data', () => {
    service.list({ mes: 3 }).subscribe((res) => expect(res).toEqual([]));
    const req = http.expectOne(`${baseUrl}?mes=3`);
    req.flush({ code: 404, message: 'No se encontraron nóminas' });
  });

  it('actualiza estado nomina y devuelve la nómina', () => {
    service.updateEstado(4).subscribe((res) => expect(res).toEqual(mockNominaPagaResponse.data));
    const req = http.expectOne(`${baseUrl}?id=4`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({});
    req.flush(mockNominaPagaResponse);
  });

  it('updateEstado devuelve null cuando el backend responde code 404 sin data', () => {
    service.updateEstado(99).subscribe((res) => expect(res).toBeNull());
    const req = http.expectOne(`${baseUrl}?id=99`);
    req.flush({ code: 404, message: 'Nómina no encontrada' });
  });

  it('crea nomina', () => {
    const mock: ApiResponse<Nomina> = {
      code: 201,
      message: 'Nómina creada correctamente',
      data: {
        nominaId: 2,
        fechaNomina: '30-12-2024',
        monto: 0,
        estadoNomina: estadoNomina.NO_PAGO,
      },
    };
    service.create(mockNominaBody).subscribe((res) => expect(res).toEqual(mock));
    const req = http.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockNominaBody);
    req.flush(mock);
  });

  it('crea nomina sin campos (el backend usa hoy y NO_PAGO)', () => {
    service.create({}).subscribe();
    const req = http.expectOne(baseUrl);
    expect(req.request.body).toEqual({});
    req.flush({ code: 400, message: 'No se puede generar una nómina antes del día 20 del mes' });
  });

  it('elimina nomina por id', () => {
    const mock: ApiResponse<undefined> = {
      code: 200,
      message: 'Nómina eliminada lógicamente',
      data: undefined,
    };
    service.delete(9).subscribe((res) => expect(res).toEqual(mock));
    const req = http.expectOne(`${baseUrl}?id=9`);
    expect(req.request.method).toBe('DELETE');
    req.flush(mock);
  });

  it('list con objeto vacío no agrega parámetros', () => {
    service.list({}).subscribe((res) => expect(res).toEqual([]));
    const req = http.expectOne(baseUrl);
    expect(req.request.params.keys().length).toBe(0);
    req.flush({ code: 200, message: 'ok', data: [] });
  });

  it('list con mes y anio en 0 los envía y omite fecha vacía', () => {
    service.list({ fecha: '', mes: 0, anio: 0 }).subscribe();
    const req = http.expectOne((r) => r.url === baseUrl);
    expect(req.request.params.has('fecha')).toBe(false);
    expect(req.request.params.get('mes')).toBe('0');
    expect(req.request.params.get('anio')).toBe('0');
    req.flush({ code: 200, message: 'ok', data: [] });
  });

  it('propaga errores HTTP mediante HandleErrorService', () => {
    service.list().subscribe({ error: () => undefined });
    http.expectOne(baseUrl).error(new ErrorEvent('API error'));
    expect(mockHandle.handleError).toHaveBeenCalled();
  });
});
