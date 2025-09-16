import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { createHandleErrorServiceMock } from '../../shared/mocks/test-doubles';
import { HandleErrorService } from './handle-error.service';
import { NominaTrabajadorService } from './nomina-trabajador.service';

describe('NominaTrabajadorService', () => {
  let service: NominaTrabajadorService;
  let http: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/nomina_trabajador`;
  const mockHandle = createHandleErrorServiceMock();

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [NominaTrabajadorService, { provide: HandleErrorService, useValue: mockHandle }],
    });
    service = TestBed.inject(NominaTrabajadorService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lists relaciones nomina-trabajador', () => {
    const mock = { code: 200, message: 'ok', data: [] };
    service.list().subscribe((res) => expect(res).toEqual(mock));
    const req = http.expectOne(baseUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  it('lists por mes/anio', () => {
    const mock = { code: 200, message: 'ok', data: [] };
    service.listMes(9, 2025).subscribe((res) => expect(res).toEqual(mock));
    const req = http.expectOne(`${baseUrl}/mes?mes=9&anio=2025`);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  it('search con filtros', () => {
    const mock = { code: 200, message: 'ok', data: [] };
    service
      .search({ documento: 101, actual: true, pagas: false, no_pagas: true, mes: 9, anio: 2025 })
      .subscribe((res) => expect(res).toEqual(mock));
    const req = http.expectOne(
      `${baseUrl}/search?documento=101&actual=true&pagas=false&no_pagas=true&mes=9&anio=2025`,
    );
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  it('creates nomina-trabajador', () => {
    const body = { documentoTrabajador: 101, detalles: 'ok' };
    const mock = { code: 201, message: 'created', data: {} };
    service.create(body).subscribe((res) => expect(res).toEqual(mock));
    const req = http.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush(mock);
  });
});
