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

  it('lists horarios with filters', () => {
    const mock = { code: 200, message: 'ok', data: [] };
    service.list({ documento: 123, dia: 'Lunes' }).subscribe((res) => expect(res).toEqual([]));
    const req = http.expectOne(`${baseUrl}?documento=123&dia=Lunes`);
    expect(req.request.method).toBe('GET');
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
});
