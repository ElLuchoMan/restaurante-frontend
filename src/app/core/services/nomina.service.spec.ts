import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { createHandleErrorServiceMock } from '../../shared/mocks/test-doubles';
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

  it('list sin filtros no agrega parámetros', () => {
    const mock = { code: 200, message: 'ok', data: [] };
    service.list().subscribe((res) => expect(res).toEqual([]));
    const req = http.expectOne(baseUrl);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.keys().length).toBe(0);
    req.flush(mock);
  });

  it('lists nominas con filtros', () => {
    const mock = { code: 200, message: 'ok', data: [] };
    service
      .list({ fecha: '2025-09-01', mes: 9, anio: 2025 })
      .subscribe((res) => expect(res).toEqual([]));
    const req = http.expectOne(`${baseUrl}?fecha=2025-09-01&mes=9&anio=2025`);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  it('actualiza estado nomina', () => {
    const mock = { code: 200, message: 'ok', data: { nominaId: 1 } } as any;
    service.updateEstado(1).subscribe((res) => expect(res).toEqual(mock.data));
    const req = http.expectOne(`${baseUrl}?id=1`);
    expect(req.request.method).toBe('PUT');
    req.flush(mock);
  });

  it('crea nomina', () => {
    const body = { fecha: '2025-09-01' } as any;
    const mock = { code: 201, message: 'created', data: { nominaId: 2 } } as any;
    service.create(body).subscribe((res) => expect(res).toEqual(mock));
    const req = http.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush(mock);
  });

  it('elimina nomina por id', () => {
    const mock = { code: 200, message: 'deleted', data: {} } as any;
    service.delete(9).subscribe((res) => expect(res).toEqual(mock));
    const req = http.expectOne(`${baseUrl}?id=9`);
    expect(req.request.method).toBe('DELETE');
    req.flush(mock);
  });
});
