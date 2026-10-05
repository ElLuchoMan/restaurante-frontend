import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import {
  mockCambiosHorarioActual,
  mockCambiosHorarioCreateBody,
  mockCambiosHorarioList,
} from '../../shared/mocks/cambios-horario.mock';
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
    service.list().subscribe((res) => expect(res).toEqual(mockCambiosHorarioList));
    const req = http.expectOne(baseUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockCambiosHorarioList);
  });

  it('get actual cambio', () => {
    service.getActual().subscribe((res) => expect(res).toEqual(mockCambiosHorarioActual));
    const req = http.expectOne(`${baseUrl}/actual`);
    expect(req.request.method).toBe('GET');
    req.flush(mockCambiosHorarioActual);
  });

  it('get actual sin cambio hoy: el 404 HTTP se expone como respuesta sin data', () => {
    let result: { code: number; data?: unknown } | undefined;
    service.getActual().subscribe((res) => (result = res));
    http
      .expectOne(`${baseUrl}/actual`)
      .flush(
        { code: 404, message: 'No hay cambios de horario para la fecha actual' },
        { status: 404, statusText: 'Not Found' },
      );
    expect(result?.code).toBe(404);
    expect(result?.data).toBeUndefined();
  });

  it('get actual propaga errores distintos de 404', () => {
    let failed = false;
    service.getActual().subscribe({ error: () => (failed = true) });
    http
      .expectOne(`${baseUrl}/actual`)
      .flush({ code: 500 }, { status: 500, statusText: 'Server Error' });
    expect(failed).toBe(true);
  });

  it('create cambio envía el body tal cual (fechaCambioHorario en YYYY-MM-DD)', () => {
    const mock = {
      code: 201,
      message: 'Cambio de horario creado correctamente',
      data: mockCambiosHorarioList.data[0],
    };
    service.create(mockCambiosHorarioCreateBody).subscribe((res) => expect(res).toEqual(mock));
    const req = http.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      fechaCambioHorario: '2025-01-01',
      horaApertura: '09:00:00',
      horaCierre: '18:00:00',
      abierto: true,
    });
    req.flush(mock);
  });

  it('create cambio cerrado solo requiere fecha y abierto=false', () => {
    const body = { fechaCambioHorario: '2025-09-15', abierto: false };
    service.create(body).subscribe();
    const req = http.expectOne(baseUrl);
    expect(req.request.body).toEqual(body);
    req.flush({ code: 201, message: 'ok', data: mockCambiosHorarioList.data[1] });
  });

  it('update cambio parcial', () => {
    const body = { horaCierre: '18:00:00' };
    const mock = { code: 200, message: 'ok', data: mockCambiosHorarioList.data[0] };
    service.update(3, body).subscribe((res) => expect(res).toEqual(mock));
    const req = http.expectOne(`${baseUrl}?id=3`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(body);
    req.flush(mock);
  });

  it('update cambio con todos los campos', () => {
    const body = {
      fechaCambioHorario: '2025-09-16',
      horaApertura: '09:00:00',
      horaCierre: '19:00:00',
      abierto: true,
    };
    service.update(5, body).subscribe();
    const req = http.expectOne(`${baseUrl}?id=5`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(body);
    req.flush({ code: 200, message: 'ok', data: mockCambiosHorarioList.data[0] });
  });

  it('delete cambio', () => {
    const mock = { code: 200, message: 'Cambio de horario eliminado correctamente' };
    service.delete(3).subscribe((res) => expect(res).toEqual(mock));
    const req = http.expectOne(`${baseUrl}?id=3`);
    expect(req.request.method).toBe('DELETE');
    req.flush(mock);
  });
});
