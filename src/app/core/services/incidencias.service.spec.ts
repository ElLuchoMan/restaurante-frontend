import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import {
  mockIncidenciaCreateBody,
  mockIncidenciaCreateResponse,
  mockIncidenciaDeleteResponse,
  mockIncidenciasList,
  mockIncidenciasSearchResponse,
  mockIncidenciaUpdateBody,
  mockIncidenciaUpdateResponse,
} from '../../shared/mocks/incidencias.mock';
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
    service.list().subscribe((res) => expect(res).toEqual(mockIncidenciasList));
    const req = http.expectOne(baseUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockIncidenciasList);
  });

  it('create incidencia', () => {
    service
      .create(mockIncidenciaCreateBody)
      .subscribe((res) => expect(res).toEqual(mockIncidenciaCreateResponse));
    const req = http.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockIncidenciaCreateBody);
    req.flush(mockIncidenciaCreateResponse);
  });

  it('update incidencia', () => {
    service
      .update(1, mockIncidenciaUpdateBody)
      .subscribe((res) => expect(res).toEqual(mockIncidenciaUpdateResponse));
    const req = http.expectOne(`${baseUrl}?id=1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(mockIncidenciaUpdateBody);
    req.flush(mockIncidenciaUpdateResponse);
  });

  it('delete incidencia', () => {
    service.delete(3).subscribe((res) => expect(res).toEqual(mockIncidenciaDeleteResponse));
    const req = http.expectOne(`${baseUrl}?id=3`);
    expect(req.request.method).toBe('DELETE');
    req.flush(mockIncidenciaDeleteResponse);
  });

  it('search incidencias por documento, mes y año', () => {
    service.search({ documento: 1015466494, mes: 12, anio: 2024 }).subscribe((res) => {
      expect(res).toEqual(mockIncidenciasSearchResponse);
    });
    const req = http.expectOne(
      (r) =>
        r.url === `${baseUrl}/search` &&
        r.params.get('documento') === '1015466494' &&
        r.params.get('mes') === '12' &&
        r.params.get('anio') === '2024',
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockIncidenciasSearchResponse);
  });

  it('search sin resultados: HTTP 200 con data []', () => {
    let result: { code: number; data?: unknown } | undefined;
    service.search({ documento: 1, mes: 1, anio: 2025 }).subscribe((res) => (result = res));
    http.expectOne(`${baseUrl}/search?documento=1&mes=1&anio=2025`).flush({
      code: 200,
      message: 'No se encontraron incidencias',
      data: [],
    });
    expect(result?.code).toBe(200);
    expect(result?.data).toEqual([]);
  });

  it('maneja error en search incidencias', () => {
    let failed = false;
    service.search({ documento: 1, mes: 1, anio: 2025 }).subscribe({
      error: (err) => {
        failed = !!err;
      },
    });
    const req = http.expectOne(`${baseUrl}/search?documento=1&mes=1&anio=2025`);
    req.error(new ErrorEvent('Network error'));
    expect(mockHandle.handleError).toHaveBeenCalled();
    expect(failed).toBe(true);
  });
});
