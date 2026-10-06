import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { DiaSemana } from '../../shared/constants';
import {
  mockHorarioTrabajadorCreateBody,
  mockHorarioTrabajadorList,
  mockHorarioTrabajadorUpdateBody,
} from '../../shared/mocks/horario-trabajador.mock';
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

  it('list sin filtros devuelve el array de data', () => {
    service.list().subscribe((res) => expect(res).toEqual(mockHorarioTrabajadorList.data));
    const req = http.expectOne(baseUrl);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.keys().length).toBe(0);
    req.flush(mockHorarioTrabajadorList);
  });

  it('list devuelve [] si data llega null', () => {
    let result: unknown;
    service.list().subscribe((res) => (result = res));
    http.expectOne(baseUrl).flush({ code: 200, message: 'ok', data: null });
    expect(result).toEqual([]);
  });

  it('lists horarios with filters', () => {
    service
      .list({ documento: 123, dia: DiaSemana.DiaLunes })
      .subscribe((res) => expect(res).toEqual([]));
    const req = http.expectOne(`${baseUrl}?documento=123&dia=Lunes`);
    expect(req.request.method).toBe('GET');
    req.flush({ code: 200, message: 'ok', data: [] });
  });

  it('list solo día sin documento', () => {
    service.list({ dia: DiaSemana.DiaMiercoles }).subscribe();
    const req = http.expectOne(`${baseUrl}?dia=Mi%C3%A9rcoles`);
    expect(req.request.params.has('documento')).toBe(false);
    expect(req.request.params.get('dia')).toBe('Miércoles');
    req.flush({ code: 200, message: 'ok', data: [] });
  });

  it('list solo documento sin día', () => {
    service.list({ documento: 456 }).subscribe();
    const req = http.expectOne(`${baseUrl}?documento=456`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.has('dia')).toBe(false);
    req.flush({ code: 200, message: 'ok', data: [] });
  });

  it('updates horario', () => {
    const mock = {
      code: 200,
      message: 'Horario actualizado correctamente',
      data: {
        documentoTrabajador: null,
        dia: 'Lunes',
        horaInicio: '09:00:00',
        horaFin: '18:00:00',
      },
    };
    service
      .update(123, DiaSemana.DiaLunes, mockHorarioTrabajadorUpdateBody)
      .subscribe((res) => expect(res).toEqual(mock));
    const req = http.expectOne(`${baseUrl}?documento=123&dia=Lunes`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(mockHorarioTrabajadorUpdateBody);
    req.flush(mock);
  });

  it('create horario', () => {
    const mock = {
      code: 201,
      message: 'Horario creado correctamente',
      data: { ...mockHorarioTrabajadorCreateBody },
    };
    service.create(mockHorarioTrabajadorCreateBody).subscribe((res) => {
      expect(res).toEqual(mock);
    });
    const req = http.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockHorarioTrabajadorCreateBody);
    req.flush(mock);
  });

  it('delete horario por documento y día', () => {
    const mock = { code: 200, message: 'Horario eliminado correctamente' };
    service
      .deleteByDocumentoDia(11, DiaSemana.DiaLunes)
      .subscribe((res) => expect(res).toEqual(mock));
    const req = http.expectOne(`${baseUrl}?documento=11&dia=Lunes`);
    expect(req.request.method).toBe('DELETE');
    req.flush(mock);
  });
});
