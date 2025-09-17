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

  it('search incidencias por documento, mes y año', () => {
    const mock = { code: 200, message: 'ok', data: [] } as any;
    service.search({ documento: 1015466494, mes: 12, anio: 2024 }).subscribe((res) => {
      expect(res).toEqual(mock);
    });
    const req = http.expectOne(
      (r) =>
        r.url === `${baseUrl}/search` &&
        r.params.get('documento') === '1015466494' &&
        r.params.get('mes') === '12' &&
        r.params.get('anio') === '2024',
    );
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  it('maneja error en search incidencias', () => {
    service.search({ documento: 1, mes: 1, anio: 2025 }).subscribe({
      next: () => fail('should have failed'),
      error: (err) => expect(err).toBeTruthy(),
    });
    const req = http.expectOne(`${baseUrl}/search?documento=1&mes=1&anio=2025`);
    req.error(new ErrorEvent('Network error'));
    expect(mockHandle.handleError).toHaveBeenCalled();
  });
});
