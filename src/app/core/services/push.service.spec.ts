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
  const emptyPage = { data: [], total: 0, page: 1, pageSize: 20, totalPages: 0 };
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
    service.listarDispositivos({ limit: 10, cliente_id: 7 }).subscribe();
    const req = http.expectOne(
      (r) =>
        r.url === `${baseUrl}/dispositivos` &&
        r.params.get('limit') === '10' &&
        r.params.get('cliente_id') === '7',
    );
    expect(req.request.method).toBe('GET');
    req.flush({ code: 200, message: 'ok', data: emptyPage });
  });

  it('lista dispositivos sin params ni query string', () => {
    service.listarDispositivos().subscribe();
    const req = http.expectOne(`${baseUrl}/dispositivos`);
    expect(req.request.params.keys()).toEqual([]);
    req.flush({ code: 200, message: 'ok', data: emptyPage });
  });

  it('lista dispositivos omite params undefined o null', () => {
    service
      .listarDispositivos({ limit: 5, offset: undefined, plataforma: null } as any)
      .subscribe();
    const req = http.expectOne((r) => r.url === `${baseUrl}/dispositivos`);
    expect(req.request.params.keys()).toEqual(['limit']);
    expect(req.request.params.get('limit')).toBe('5');
    req.flush({ code: 200, message: 'ok', data: emptyPage });
  });

  it('obtiene un dispositivo por id con query ?id=', () => {
    service.obtenerDispositivo(4).subscribe();
    const req = http.expectOne((r) => r.url === `${baseUrl}/dispositivos/search`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('id')).toBe('4');
    req.flush({ code: 200, message: 'ok', data: { pushDispositivoId: 4 } });
  });

  it('elimina un dispositivo con query ?id=', () => {
    service.eliminarDispositivo(5).subscribe();
    const req = http.expectOne((r) => r.url === `${baseUrl}/dispositivos`);
    expect(req.request.method).toBe('DELETE');
    expect(req.request.params.get('id')).toBe('5');
    req.flush({ code: 200, message: 'ok', data: null });
  });

  it('actualiza ultima vista (PATCH /dispositivos/visto?id=)', () => {
    service.actualizarUltimaVista(1).subscribe();
    const req = http.expectOne((r) => r.url === `${baseUrl}/dispositivos/visto`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.params.get('id')).toBe('1');
    req.flush({ code: 200, message: 'ok', data: null });
  });

  it('actualiza estado (PUT /dispositivos?id=)', () => {
    service.actualizarEstado(2, false).subscribe();
    const req = http.expectOne((r) => r.url === `${baseUrl}/dispositivos`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.params.get('id')).toBe('2');
    expect(req.request.body).toEqual({ enabled: false });
    req.flush({ code: 200, message: 'ok', data: {} });
  });

  it('actualiza el dispositivo con merge parcial permitiendo null en campos anulables', () => {
    service.actualizarDispositivo(5, { locale: null, subscribedTopics: ['a'] }).subscribe();
    const req = http.expectOne((r) => r.url === `${baseUrl}/dispositivos`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.params.get('id')).toBe('5');
    expect(req.request.body).toEqual({ locale: null, subscribedTopics: ['a'] });
    req.flush({ code: 200, message: 'ok', data: {} });
  });

  it('actualiza topics (PATCH /dispositivos/topics?id=)', () => {
    service.actualizarTopics(3, ['promos']).subscribe();
    const req = http.expectOne((r) => r.url === `${baseUrl}/dispositivos/topics`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.params.get('id')).toBe('3');
    expect(req.request.body).toEqual({ subscribedTopics: ['promos'] });
    req.flush({ code: 200, message: 'ok', data: null });
  });

  it('lista envios con filtros', () => {
    service
      .listarEnvios({ dispositivo_id: 1, fecha_desde: '2025-01-01', fecha_hasta: '2025-01-31' })
      .subscribe();
    const req = http.expectOne((r) => r.url === `${baseUrl}/envios`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('dispositivo_id')).toBe('1');
    expect(req.request.params.get('fecha_desde')).toBe('2025-01-01');
    expect(req.request.params.get('fecha_hasta')).toBe('2025-01-31');
    req.flush({ code: 200, message: 'ok', data: emptyPage });
  });

  it('lista envios sin params', () => {
    service.listarEnvios().subscribe();
    const req = http.expectOne(`${baseUrl}/envios`);
    expect(req.request.params.keys()).toEqual([]);
    req.flush({ code: 200, message: 'ok', data: emptyPage });
  });

  it('registra un envio', () => {
    const body = { pushDispositivoId: 1, proveedor: 'FCM' as const, exito: true };
    service.registrarEnvio(body).subscribe();
    const req = http.expectOne(`${baseUrl}/envios`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush({ code: 201, message: 'ok', data: { pushEnvioId: 1 } });
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
