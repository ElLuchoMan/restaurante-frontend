import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import {
  mockNominaTrabajadorCreateBody,
  mockNominaTrabajadorCreateResponse,
  mockNominaTrabajadorMes,
  mockNominaTrabajadorResponse,
} from '../../shared/mocks/nomina-trabajador.mock';
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
    service.list().subscribe((res) => expect(res).toEqual(mockNominaTrabajadorResponse));
    const req = http.expectOne(baseUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockNominaTrabajadorResponse);
  });

  it('listMes envía mes y anio', () => {
    service.listMes(9, 2025).subscribe((res) => expect(res).toEqual(mockNominaTrabajadorMes));
    const req = http.expectOne(`${baseUrl}/mes?mes=9&anio=2025`);
    expect(req.request.method).toBe('GET');
    req.flush(mockNominaTrabajadorMes);
  });

  it('listMes sin argumentos no agrega parámetros (el backend usa el mes y año actuales)', () => {
    service.listMes().subscribe((res) => expect(res.data).toEqual([]));
    const req = http.expectOne(`${baseUrl}/mes`);
    expect(req.request.params.keys().length).toBe(0);
    req.flush({ code: 200, message: 'Sin relaciones', data: [] });
  });

  it('listMes con solo anio envía únicamente anio', () => {
    service.listMes(undefined, 2024).subscribe();
    const req = http.expectOne(`${baseUrl}/mes?anio=2024`);
    expect(req.request.params.has('mes')).toBe(false);
    req.flush(mockNominaTrabajadorMes);
  });

  it('search con todos los filtros', () => {
    service
      .search({
        documento: 101,
        actual: true,
        pagas: false,
        no_pagas: true,
        mes: 9,
        anio: 2025,
      })
      .subscribe((res) => expect(res).toEqual(mockNominaTrabajadorResponse));
    const req = http.expectOne(
      `${baseUrl}/search?documento=101&actual=true&pagas=false&no_pagas=true&mes=9&anio=2025`,
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockNominaTrabajadorResponse);
  });

  it('search solo con documento no agrega otros parámetros', () => {
    service.search({ documento: 101 }).subscribe();
    const req = http.expectOne(`${baseUrl}/search?documento=101`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.keys()).toEqual(['documento']);
    req.flush({ code: 200, message: 'Sin relaciones', data: [] });
  });

  it('creates nomina-trabajador', () => {
    service
      .create(mockNominaTrabajadorCreateBody)
      .subscribe((res) => expect(res).toEqual(mockNominaTrabajadorCreateResponse));
    const req = http.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockNominaTrabajadorCreateBody);
    req.flush(mockNominaTrabajadorCreateResponse);
  });

  it('create admite 200 con la relación existente (misma forma que 201)', () => {
    const existente = { ...mockNominaTrabajadorCreateResponse, code: 200 };
    service
      .create(mockNominaTrabajadorCreateBody)
      .subscribe((res) => expect(res.data.nominaTrabajadorId).toBe(3));
    http.expectOne(baseUrl).flush(existente);
  });

  it('propaga errores HTTP mediante HandleErrorService', () => {
    service.list().subscribe({ error: () => undefined });
    http.expectOne(baseUrl).error(new ErrorEvent('API error'));
    expect(mockHandle.handleError).toHaveBeenCalled();
  });
});
