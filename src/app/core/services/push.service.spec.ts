import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { createHandleErrorServiceMock } from '../../shared/mocks/test-doubles';
import { HandleErrorService } from './handle-error.service';
import { PushService } from './push.service';

describe('PushService', () => {
  let service: PushService;
  let http: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/push`;
  const mockHandleErrorService = createHandleErrorServiceMock();

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: HandleErrorService, useValue: mockHandleErrorService }],
    });
    service = TestBed.inject(PushService);
    http = TestBed.inject(HttpTestingController);
    jest.clearAllMocks();
  });

  afterEach(() => http.verify());

  it('registra un dispositivo', () => {
    const payload = {
      plataforma: 'WEB',
      endpoint: 'x',
      p256dh: 'a',
      auth: 'b',
      documentoCliente: 1,
    } as any;
    const mock = { code: 200, message: 'ok', data: { pushDispositivoId: 1 } } as any;
    service.registrarDispositivo(payload).subscribe((res) => expect(res).toEqual(mock));
    const req = http.expectOne(`${baseUrl}/dispositivos`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(mock);
  });

  it('lista dispositivos con params', () => {
    service.listarDispositivos({ limit: 10, enabled: true }).subscribe();
    const req = http.expectOne(
      (r) =>
        r.url === `${baseUrl}/dispositivos` &&
        r.params.get('limit') === '10' &&
        r.params.get('enabled') === 'true',
    );
    expect(req.request.method).toBe('GET');
    req.flush({ code: 200, message: 'ok', data: [] });
  });

  it('actualiza ultima vista', () => {
    service.actualizarUltimaVista(1).subscribe();
    const req = http.expectOne(`${baseUrl}/dispositivos/1/visto`);
    expect(req.request.method).toBe('PATCH');
    req.flush({ code: 200, message: 'ok', data: {} });
  });

  it('actualiza estado', () => {
    service.actualizarEstado(2, false).subscribe();
    const req = http.expectOne(`${baseUrl}/dispositivos/2/estado`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ enabled: false });
    req.flush({ code: 200, message: 'ok', data: {} });
  });

  it('actualiza topics', () => {
    service.actualizarTopics(3, ['promos']).subscribe();
    const req = http.expectOne(`${baseUrl}/dispositivos/3/topics`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ subscribedTopics: ['promos'] });
    req.flush({ code: 200, message: 'ok', data: {} });
  });

  it('envia notificacion', () => {
    const body = {
      remitente: { tipo: 'SISTEMA' },
      destinatarios: { tipo: 'TODOS' },
      notificacion: { titulo: 't', mensaje: 'm' },
    } as any;
    service.enviarNotificacion(body).subscribe();
    const req = http.expectOne(`${baseUrl}/enviar`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush({
      code: 200,
      message: 'ok',
      data: {
        totalDispositivos: 0,
        enviosExitosos: 0,
        enviosFallidos: 0,
        detalleEnvios: [],
        resumenDestinatarios: { tipoDestinatario: 'TODOS' },
      },
    });
  });
});
