import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { createHandleErrorServiceMock } from '../../shared/mocks/test-doubles';
import { HandleErrorService } from './handle-error.service';
import { HorarioTrabajadorService } from './horario-trabajador.service';

describe('HorarioTrabajadorService', () => {
  let service: HorarioTrabajadorService;
  let http: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/horario_trabajador`;
  const mockHandle = createHandleErrorServiceMock();

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [HorarioTrabajadorService, { provide: HandleErrorService, useValue: mockHandle }],
    });
    service = TestBed.inject(HorarioTrabajadorService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('list sin filtros', () => {
    const mock = { code: 200, message: 'ok', data: [] };
    service.list().subscribe((res) => expect(res).toEqual([]));
    const req = http.expectOne(baseUrl);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.keys().length).toBe(0);
    req.flush(mock);
  });

  it('lists horarios with filters', () => {
    const mock = { code: 200, message: 'ok', data: [] };
    service.list({ documento: 123, dia: 'Lunes' }).subscribe((res) => expect(res).toEqual([]));
    const req = http.expectOne(`${baseUrl}?documento=123&dia=Lunes`);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  it('list solo documento sin día', () => {
    const mock = { code: 200, message: 'ok', data: [] };
    service.list({ documento: 456 }).subscribe((res) => expect(res).toEqual([]));
    const req = http.expectOne(`${baseUrl}?documento=456`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.has('dia')).toBe(false);
    req.flush(mock);
  });

  it('updates horario', () => {
    const body = { horaInicio: '08:00:00', horaFin: '17:00:00' };
    const mock = { code: 200, message: 'ok', data: {} };
    service.update(123, 'Lunes', body).subscribe((res) => expect(res).toEqual(mock));
    const req = http.expectOne(`${baseUrl}?documento=123&dia=Lunes`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(body);
    req.flush(mock);
  });

  it('create horario', () => {
    const body = { documento: 10, dia: 'Martes', horaInicio: '09:00', horaFin: '18:00' } as any;
    const mock = { code: 201, message: 'created', data: {} };
    service.create(body).subscribe((res) => expect(res).toEqual(mock));
    const req = http.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush(mock);
  });

  it('delete horario', () => {
    const mock = { code: 200, message: 'ok', data: {} };
    service.delete(11).subscribe((res) => expect(res).toEqual(mock));
    const req = http.expectOne(`${baseUrl}?id=11`);
    expect(req.request.method).toBe('DELETE');
    req.flush(mock);
  });
});
