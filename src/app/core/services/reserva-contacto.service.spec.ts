import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { createHandleErrorServiceMock } from '../../shared/mocks/test-doubles';
import { ApiResponse } from '../../shared/models/api-response.model';
import { ReservaContacto } from '../../shared/models/reserva-contacto.model';
import { HandleErrorService } from './handle-error.service';
import { ReservaContactoService } from './reserva-contacto.service';

describe('ReservaContactoService', () => {
  let service: ReservaContactoService;
  let http: HttpTestingController;
  const baseUrl = environment.apiUrl;
  const mockHandle = createHandleErrorServiceMock();

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ReservaContactoService, { provide: HandleErrorService, useValue: mockHandle }],
    });
    service = TestBed.inject(ReservaContactoService);
    http = TestBed.inject(HttpTestingController);
    mockHandle.handleError.mockReset();
  });

  afterEach(() => http.verify());

  it('getContactos sin filtros no agrega query params', () => {
    const mock = { code: 200, message: 'ok', data: [] };
    service.getContactos().subscribe((res) => expect(res).toEqual(mock));
    const req = http.expectOne(baseUrl + '/reserva_contacto');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.keys().length).toBe(0);
    req.flush(mock);
  });

  it('gets contactos by filtros', () => {
    const mock = { code: 200, message: 'ok', data: [] };
    service.getContactos({ documento_cliente: 101 }).subscribe((res) => expect(res).toEqual(mock));
    const req = http.expectOne(`${baseUrl}/reserva_contacto?documento_cliente=101`);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  it('gets contactos por documento_contacto', () => {
    const mock = { code: 200, message: 'ok', data: [] };
    service.getContactos({ documento_contacto: 202 }).subscribe((res) => expect(res).toEqual(mock));
    const req = http.expectOne(`${baseUrl}/reserva_contacto?documento_contacto=202`);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  it('gets contacto by id', () => {
    const mock: ApiResponse<ReservaContacto> = {
      code: 200,
      message: 'ok',
      data: { contactoId: 1, nombreCompleto: 'Carlos Perez' },
    };
    service.getById(1).subscribe((res) => expect(res).toEqual(mock.data));
    const req = http.expectOne(`${baseUrl}/reserva_contacto/search?id=1`);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  it('getById devuelve null cuando el backend responde 404', () => {
    let resultado: ReservaContacto | null | undefined;
    service.getById(77).subscribe((res) => (resultado = res));
    http
      .expectOne(`${baseUrl}/reserva_contacto/search?id=77`)
      .flush({ code: 404, message: 'no encontrado' }, { status: 404, statusText: 'Not Found' });
    expect(resultado).toBeNull();
    expect(mockHandle.handleError).not.toHaveBeenCalled();
  });

  it('getById propaga otros errores (400) por HandleErrorService', () => {
    service.getById(0).subscribe({ error: () => undefined });
    http
      .expectOne(`${baseUrl}/reserva_contacto/search?id=0`)
      .flush({ code: 400, message: 'id inválido' }, { status: 400, statusText: 'Bad Request' });
    expect(mockHandle.handleError).toHaveBeenCalled();
  });

  it('getContactos propaga errores (400 por documento inválido) por HandleErrorService', () => {
    service.getContactos({ documento_cliente: 5 }).subscribe({ error: () => undefined });
    http
      .expectOne(`${baseUrl}/reserva_contacto?documento_cliente=5`)
      .flush({ code: 400, message: 'inválido' }, { status: 400, statusText: 'Bad Request' });
    expect(mockHandle.handleError).toHaveBeenCalled();
  });
});
