import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { createHandleErrorServiceMock } from '../../shared/mocks/test-doubles';
import { HandleErrorService } from './handle-error.service';
import { IncidenciasService } from './incidencias.service';

describe('IncidenciasService', () => {
  let service: IncidenciasService;
  let http: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/incidencias`;
  const mockHandle = createHandleErrorServiceMock();

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [IncidenciasService, { provide: HandleErrorService, useValue: mockHandle }],
    });
    service = TestBed.inject(IncidenciasService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lists incidencias', () => {
    const mock = { code: 200, message: 'ok', data: [] };
    service.list().subscribe((res) => expect(res).toEqual(mock));
    const req = http.expectOne(baseUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  it('create incidencia', () => {
    const body = { documentoTrabajador: 101, fecha: '2025-09-01', tipo: 'BONO' };
    const mock = { code: 201, message: 'created', data: {} };
    service.create(body as any).subscribe((res) => expect(res).toEqual(mock));
    const req = http.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush(mock);
  });

  it('update incidencia', () => {
    const body = { observaciones: 'ajuste' };
    const mock = { code: 200, message: 'ok', data: {} };
    service.update(3, body as any).subscribe((res) => expect(res).toEqual(mock));
    const req = http.expectOne(`${baseUrl}?id=3`);
    expect(req.request.method).toBe('PUT');
    req.flush(mock);
  });

  it('delete incidencia', () => {
    const mock = { code: 200, message: 'ok', data: {} };
    service.delete(3).subscribe((res) => expect(res).toEqual(mock));
    const req = http.expectOne(`${baseUrl}?id=3`);
    expect(req.request.method).toBe('DELETE');
    req.flush(mock);
  });
});
