import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { createHandleErrorServiceMock } from '../../shared/mocks/test-doubles';
import { CambiosHorarioService } from './cambios-horario.service';
import { HandleErrorService } from './handle-error.service';

describe('CambiosHorarioService', () => {
  let service: CambiosHorarioService;
  let http: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/cambios_horario`;
  const mockHandle = createHandleErrorServiceMock();

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CambiosHorarioService, { provide: HandleErrorService, useValue: mockHandle }],
    });
    service = TestBed.inject(CambiosHorarioService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lists cambios', () => {
    const mock = { code: 200, message: 'ok', data: [] };
    service.list().subscribe((res) => expect(res).toEqual(mock));
    const req = http.expectOne(baseUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  it('get actual cambio', () => {
    const mock = { code: 200, message: 'ok', data: {} };
    service.getActual().subscribe((res) => expect(res).toEqual(mock));
    const req = http.expectOne(`${baseUrl}/actual`);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  it('create cambio', () => {
    // El servicio espera 'fechaCambioHorario' según API real
    const body = { fecha: '2025-09-15', horaApertura: '08:00:00' } as any; // la service mapea a fechaCambioHorario
    const mock = { code: 201, message: 'created', data: {} };
    service.create(body).subscribe((res) => expect(res).toEqual(mock));
    const req = http.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      fechaCambioHorario: '2025-09-15',
      horaApertura: '08:00:00',
    });
    req.flush(mock);
  });

  it('update cambio', () => {
    const body = { horaCierre: '18:00:00' };
    const mock = { code: 200, message: 'ok', data: {} };
    service.update(3, body as any).subscribe((res) => expect(res).toEqual(mock));
    const req = http.expectOne(`${baseUrl}?id=3`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(body);
    req.flush(mock);
  });

  it('delete cambio', () => {
    const mock = { code: 200, message: 'ok', data: {} };
    service.delete(3).subscribe((res) => expect(res).toEqual(mock));
    const req = http.expectOne(`${baseUrl}?id=3`);
    expect(req.request.method).toBe('DELETE');
    req.flush(mock);
  });

  it('create cambio with all fields including abierto', () => {
    const body = {
      fecha: '2025-09-15',
      horaApertura: '08:00:00',
      horaCierre: '18:00:00',
      abierto: true,
    } as any;
    const mock = { code: 201, message: 'created', data: {} };
    service.create(body).subscribe((res) => expect(res).toEqual(mock));
    const req = http.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      fechaCambioHorario: '2025-09-15',
      horaApertura: '08:00:00',
      horaCierre: '18:00:00',
      abierto: true,
    });
    req.flush(mock);
  });

  it('create cambio with optional fields as null', () => {
    const body = {
      fecha: '2025-09-15',
      horaApertura: null,
      horaCierre: null,
    } as any;
    const mock = { code: 201, message: 'created', data: {} };
    service.create(body).subscribe((res) => expect(res).toEqual(mock));
    const req = http.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      fechaCambioHorario: '2025-09-15',
    });
    req.flush(mock);
  });

  it('create cambio with abierto false', () => {
    const body = { fecha: '2025-09-15', abierto: false } as any;
    const mock = { code: 201, message: 'created', data: {} };
    service.create(body).subscribe((res) => expect(res).toEqual(mock));
    const req = http.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      fechaCambioHorario: '2025-09-15',
      abierto: false,
    });
    req.flush(mock);
  });

  it('update cambio with all fields including abierto', () => {
    const body = {
      fecha: '2025-09-16',
      horaApertura: '09:00:00',
      horaCierre: '19:00:00',
      abierto: false,
    } as any;
    const mock = { code: 200, message: 'ok', data: {} };
    service.update(5, body).subscribe((res) => expect(res).toEqual(mock));
    const req = http.expectOne(`${baseUrl}?id=5`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({
      fechaCambioHorario: '2025-09-16',
      horaApertura: '09:00:00',
      horaCierre: '19:00:00',
      abierto: false,
    });
    req.flush(mock);
  });

  it('update cambio with optional fields as null', () => {
    const body = {
      horaApertura: null,
      horaCierre: null,
    } as any;
    const mock = { code: 200, message: 'ok', data: {} };
    service.update(6, body).subscribe((res) => expect(res).toEqual(mock));
    const req = http.expectOne(`${baseUrl}?id=6`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({});
    req.flush(mock);
  });

  it('update cambio with abierto true', () => {
    const body = { abierto: true } as any;
    const mock = { code: 200, message: 'ok', data: {} };
    service.update(7, body).subscribe((res) => expect(res).toEqual(mock));
    const req = http.expectOne(`${baseUrl}?id=7`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ abierto: true });
    req.flush(mock);
  });
});
