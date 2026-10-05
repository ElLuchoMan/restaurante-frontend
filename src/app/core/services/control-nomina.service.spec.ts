import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { createHandleErrorServiceMock } from '../../shared/mocks/test-doubles';
import { ApiResponse } from '../../shared/models/api-response.model';
import { ControlNomina } from '../../shared/models/control-nomina.model';
import { ControlNominaService } from './control-nomina.service';
import { HandleErrorService } from './handle-error.service';

describe('ControlNominaService', () => {
  let service: ControlNominaService;
  let http: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/control_nomina`;
  const mockHandle = createHandleErrorServiceMock();
  const registro: ControlNomina = {
    controlNominaId: 1,
    fecha: '01-09-2025',
    estado: 'GENERADA',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ControlNominaService, { provide: HandleErrorService, useValue: mockHandle }],
    });
    service = TestBed.inject(ControlNominaService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lists control nomina without filter', () => {
    const mock: ApiResponse<ControlNomina[]> = { code: 200, message: 'ok', data: [registro] };
    service.list().subscribe((res) => expect(res).toEqual([registro]));
    const req = http.expectOne(baseUrl);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.keys().length).toBe(0);
    req.flush(mock);
  });

  it('lists control nomina with fecha', () => {
    const mock: ApiResponse<ControlNomina[]> = { code: 200, message: 'ok', data: [registro] };
    service.list('2025-09-01').subscribe((res) => expect(res).toEqual([registro]));
    const req = http.expectOne(`${baseUrl}?fecha=2025-09-01`);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  it('list devuelve [] cuando data llega null (sin filas)', () => {
    service.list().subscribe((res) => expect(res).toEqual([]));
    http.expectOne(baseUrl).flush({ code: 200, message: 'Control de nómina', data: null });
  });

  it('gets by id', () => {
    const mock: ApiResponse<ControlNomina> = { code: 200, message: 'ok', data: registro };
    service.getById(1).subscribe((res) => expect(res).toEqual(registro));
    const req = http.expectOne(`${baseUrl}/search?id=1`);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  it('getById devuelve null cuando el backend responde code 404 sin data', () => {
    service.getById(77).subscribe((res) => expect(res).toBeNull());
    http
      .expectOne(`${baseUrl}/search?id=77`)
      .flush({ code: 404, message: 'Registro no encontrado' });
  });

  it('propaga errores HTTP mediante HandleErrorService', () => {
    service.getById(1).subscribe({ error: () => undefined });
    http.expectOne(`${baseUrl}/search?id=1`).error(new ErrorEvent('API error'));
    expect(mockHandle.handleError).toHaveBeenCalled();
  });
});
