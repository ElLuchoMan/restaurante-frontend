import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { HandleErrorService } from '../../core/services/handle-error.service';
import { UserService } from '../../core/services/user.service';
import { estadoReserva } from '../../shared/constants';
import {
  mockReserva,
  mockReservaBody,
  mockReservaResponse,
} from '../../shared/mocks/reserva.mocks';
import { createHandleErrorServiceMock } from '../../shared/mocks/test-doubles';
import { ApiResponse } from '../../shared/models/api-response.model';
import { ReservaBase } from '../../shared/models/reserva.model';
import { ReservaService } from './reserva.service';

describe('ReservaService', () => {
  let service: ReservaService;
  let httpMock: HttpTestingController;
  let handleErrorService: jest.Mocked<HandleErrorService>;

  beforeEach(() => {
    const handleErrorMock =
      createHandleErrorServiceMock() as unknown as jest.Mocked<HandleErrorService>;

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ReservaService,
        { provide: HandleErrorService, useValue: handleErrorMock },
        {
          provide: UserService,
          useValue: { getUserId: () => undefined, getUserRole: () => undefined },
        },
      ],
    });

    service = TestBed.inject(ReservaService);
    httpMock = TestBed.inject(HttpTestingController);
    handleErrorService = TestBed.inject(HandleErrorService) as jest.Mocked<HandleErrorService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create a reserva successfully', () => {
    service.crearReserva(mockReservaBody).subscribe((response) => {
      expect(response).toEqual(mockReservaResponse);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/reservas`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockReservaBody);
    req.flush(mockReservaResponse);
  });

  it('cliente autenticado sin documento explícito: envía documentoCliente del token y nunca contactoId', () => {
    TestBed.resetTestingModule();
    const user = { getUserId: () => 101, getUserRole: () => 'Cliente' };
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ReservaService,
        { provide: HandleErrorService, useValue: createHandleErrorServiceMock() },
        { provide: UserService, useValue: user },
      ],
    });
    const svc = TestBed.inject(ReservaService);
    const http = TestBed.inject(HttpTestingController);
    const { documentoCliente: _omit, ...sinDocumento } = mockReservaBody;

    svc.crearReserva(sinDocumento).subscribe((r) => expect(r).toEqual(mockReservaResponse));
    const req = http.expectOne(`${environment.apiUrl}/reservas`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.documentoCliente).toBe(101);
    expect(req.request.body.contactoId).toBeUndefined();
    req.flush(mockReservaResponse);

    http.verify();
  });

  it('creates reserva for admin/anónimo sin documentos: envía el body tal cual (el backend valida)', () => {
    const { documentoCliente: _omit, ...body } = mockReservaBody;
    service.crearReserva(body).subscribe((response) => {
      expect(response).toEqual(mockReservaResponse);
    });
    const req = httpMock.expectOne(`${environment.apiUrl}/reservas`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush(mockReservaResponse);
  });

  it('should get reservas successfully', () => {
    const mockResponse: ApiResponse<ReservaBase[]> = {
      code: 200,
      message: 'Reservas obtenidas',
      data: [mockReserva],
    };

    service.obtenerReservas().subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/reservas`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should update a reserva successfully', () => {
    const cambios = { estadoReserva: estadoReserva.CONFIRMADA, personas: 5 };
    service.actualizarReserva(mockReserva.reservaId, cambios).subscribe((response) => {
      expect(response).toEqual(mockReservaResponse);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/reservas?id=${mockReserva.reservaId}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(cambios);
    req.flush(mockReservaResponse);
  });

  it('should get reserva by parameters (contactoId)', () => {
    const mockResponse: ApiResponse<ReservaBase[]> = {
      code: 200,
      message: 'Reserva encontrada',
      data: [mockReserva],
    };

    service.getReservaByParameter(1).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/reservas/parameter?contactoId=1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should get reserva by parameters (fecha)', () => {
    const mockResponse: ApiResponse<ReservaBase[]> = {
      code: 200,
      message: 'Reservas encontradas por fecha',
      data: [mockReserva],
    };

    service.getReservaByParameter(undefined, '2025-02-06').subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/reservas/parameter?fecha=2025-02-06`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should get reserva by id successfully', () => {
    const mockResponse: ApiResponse<ReservaBase> = {
      code: 200,
      message: 'Reserva encontrada',
      data: mockReserva,
    };

    service.getReservaById(3).subscribe((response) => {
      expect(response).toEqual(mockReserva);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/reservas/search?id=3`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('getReservaById devuelve null cuando el backend responde 404', () => {
    let resultado: ReservaBase | null | undefined;
    service.getReservaById(99).subscribe((response) => (resultado = response));

    httpMock
      .expectOne(`${environment.apiUrl}/reservas/search?id=99`)
      .flush(
        { code: 404, message: 'Reserva no encontrada' },
        { status: 404, statusText: 'Not Found' },
      );
    expect(resultado).toBeNull();
    expect(handleErrorService.handleError).not.toHaveBeenCalled();
  });

  it('getReservaById propaga un 400 (id inválido) por HandleErrorService', () => {
    service.getReservaById(0).subscribe({ error: () => undefined });
    httpMock
      .expectOne(`${environment.apiUrl}/reservas/search?id=0`)
      .flush({ code: 400, message: 'id inválido' }, { status: 400, statusText: 'Bad Request' });
    expect(handleErrorService.handleError).toHaveBeenCalled();
  });

  it('deleteReserva propaga 404 y 409 por HandleErrorService', () => {
    const errores: number[] = [];
    service.deleteReserva(8).subscribe({ error: (e) => errores.push(e.status) });
    service.deleteReserva(9).subscribe({ error: (e) => errores.push(e.status) });
    httpMock
      .expectOne(`${environment.apiUrl}/reservas?id=8`)
      .flush({ code: 404, message: 'no existe' }, { status: 404, statusText: 'Not Found' });
    httpMock
      .expectOne(`${environment.apiUrl}/reservas?id=9`)
      .flush({ code: 409, message: 'ya cancelada' }, { status: 409, statusText: 'Conflict' });
    expect(errores).toEqual([404, 409]);
  });

  it('listados vacíos llegan como data []', () => {
    const vacio = { code: 200, message: 'Sin reservas', data: [] };
    service.obtenerReservas().subscribe((r) => expect(r.data).toEqual([]));
    httpMock.expectOne(`${environment.apiUrl}/reservas`).flush(vacio);
  });

  it('should delete reserva successfully', () => {
    const mockResponse: ApiResponse<ReservaBase> = {
      code: 200,
      message: 'Reserva cancelada correctamente',
      data: { ...mockReserva, estadoReserva: estadoReserva.CANCELADA },
    };

    service.deleteReserva(4).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/reservas?id=4`);
    expect(req.request.method).toBe('DELETE');
    req.flush(mockResponse);
  });

  it('should handle API error when creating a reserva', () => {
    service.crearReserva(mockReservaBody).subscribe({
      error: (error) => {
        expect(error).toBeTruthy();
      },
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/reservas`);
    req.error(new ErrorEvent('API error'));
    expect(handleErrorService.handleError).toHaveBeenCalled();
  });

  it('getReservaByParameter combina contactoId y fecha', () => {
    const mockResponse: ApiResponse<ReservaBase[]> = {
      code: 200,
      message: 'ok',
      data: [mockReserva],
    };
    service
      .getReservaByParameter(5, '2025-01-01')
      .subscribe((r) => expect(r).toEqual(mockResponse));
    const req = httpMock.expectOne(
      `${environment.apiUrl}/reservas/parameter?contactoId=5&fecha=2025-01-01`,
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should handle API error when fetching reservas', () => {
    service.obtenerReservas().subscribe({
      error: (error) => {
        expect(error).toBeTruthy();
      },
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/reservas`);
    req.error(new ErrorEvent('API error'));
    expect(handleErrorService.handleError).toHaveBeenCalled();
  });

  it('should handle API error when updating a reserva', () => {
    service.actualizarReserva(mockReserva.reservaId, {}).subscribe({
      error: (error) => {
        expect(error).toBeTruthy();
      },
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/reservas?id=${mockReserva.reservaId}`);
    req.error(new ErrorEvent('API error'));
    expect(handleErrorService.handleError).toHaveBeenCalled();
  });

  it('should handle API error when getting reserva by parameters', () => {
    service.getReservaByParameter(1).subscribe({
      error: (error) => {
        expect(error).toBeTruthy();
      },
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/reservas/parameter?contactoId=1`);
    req.error(new ErrorEvent('API error'));
    expect(handleErrorService.handleError).toHaveBeenCalled();
  });

  it('should handle API error when getting reserva by id', () => {
    service.getReservaById(5).subscribe({
      error: (error) => {
        expect(error).toBeTruthy();
      },
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/reservas/search?id=5`);
    req.error(new ErrorEvent('API error'));
    expect(handleErrorService.handleError).toHaveBeenCalled();
  });

  it('should handle API error when deleting reserva', () => {
    service.deleteReserva(6).subscribe({
      error: (error) => {
        expect(error).toBeTruthy();
      },
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/reservas?id=6`);
    req.error(new ErrorEvent('API error'));
    expect(handleErrorService.handleError).toHaveBeenCalled();
  });

  it('should get reservas by cliente with fecha', () => {
    const mockResponse: ApiResponse<ReservaBase[]> = {
      code: 200,
      message: 'Reservas encontradas',
      data: [mockReserva],
    };

    service.getReservasByCliente(101, '2025-09-15').subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(
      `${environment.apiUrl}/reservas/cliente?documentoCliente=101&fecha=2025-09-15`,
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should get reservas by documento without fecha', () => {
    const mockResponse: ApiResponse<ReservaBase[]> = {
      code: 200,
      message: 'Reservas encontradas',
      data: [mockReserva],
    };

    service.getReservasByDocumento(12345).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/reservas/documento?documento=12345`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should get reservas by documento with fecha', () => {
    const mockResponse: ApiResponse<ReservaBase[]> = {
      code: 200,
      message: 'Reservas encontradas',
      data: [mockReserva],
    };

    service.getReservasByDocumento(12345, '2025-09-15').subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(
      `${environment.apiUrl}/reservas/documento?documento=12345&fecha=2025-09-15`,
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  describe('crearReserva branches adicionales', () => {
    const setup = (user: any) => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [
          ReservaService,
          { provide: HandleErrorService, useValue: createHandleErrorServiceMock() },
          { provide: UserService, useValue: user },
        ],
      });
      return {
        svc: TestBed.inject(ReservaService),
        http: TestBed.inject(HttpTestingController),
      };
    };

    it('respeta documentoCliente explícito y no lo reemplaza por el del token', () => {
      const { svc, http } = setup({ getUserId: () => 101, getUserRole: () => 'Cliente' });
      svc
        .crearReserva({ ...mockReservaBody, documentoCliente: 777 })
        .subscribe((r) => expect(r).toEqual(mockReservaResponse));
      const req = http.expectOne(`${environment.apiUrl}/reservas`);
      expect(req.request.body.documentoCliente).toBe(777);
      req.flush(mockReservaResponse);
      http.verify();
    });

    it('respeta documentoContacto explícito (invitado) aunque el usuario sea Cliente', () => {
      const { svc, http } = setup({ getUserId: () => 101, getUserRole: () => 'Cliente' });
      const { documentoCliente: _omit, ...base } = mockReservaBody;
      svc.crearReserva({ ...base, documentoContacto: 555, nombreCompleto: 'Invitado' }).subscribe();
      const req = http.expectOne(`${environment.apiUrl}/reservas`);
      expect(req.request.body.documentoContacto).toBe(555);
      expect(req.request.body.documentoCliente).toBeUndefined();
      req.flush(mockReservaResponse);
      http.verify();
    });

    it('documentoContacto null y rol distinto de Cliente se envía tal cual', () => {
      const { svc, http } = setup({ getUserId: () => undefined, getUserRole: () => 'Admin' });
      const { documentoCliente: _omit, ...base } = mockReservaBody;
      svc.crearReserva({ ...base, documentoContacto: null }).subscribe();
      const req = http.expectOne(`${environment.apiUrl}/reservas`);
      expect(req.request.body.documentoContacto).toBeNull();
      expect(req.request.body.documentoCliente).toBeUndefined();
      req.flush(mockReservaResponse);
      http.verify();
    });

    it('documentos no numéricos (NaN) no cuentan como documento: Cliente usa el del token', () => {
      const { svc, http } = setup({ getUserId: () => 101, getUserRole: () => 'Cliente' });
      svc
        .crearReserva({
          ...mockReservaBody,
          documentoCliente: NaN,
          documentoContacto: NaN,
        })
        .subscribe();
      const req = http.expectOne(`${environment.apiUrl}/reservas`);
      expect(req.request.body.documentoCliente).toBe(101);
      req.flush(mockReservaResponse);
      http.verify();
    });

    it('Cliente con userId no numérico no inventa documento', () => {
      const { svc, http } = setup({ getUserId: () => 'abc', getUserRole: () => 'Cliente' });
      const { documentoCliente: _omit, ...body } = mockReservaBody;
      svc.crearReserva(body).subscribe();
      const req = http.expectOne(`${environment.apiUrl}/reservas`);
      expect(req.request.body).toEqual(body);
      req.flush(mockReservaResponse);
      http.verify();
    });

    it('Cliente con userId NaN no inventa documento', () => {
      const { svc, http } = setup({ getUserId: () => NaN, getUserRole: () => 'Cliente' });
      const { documentoCliente: _omit, ...body } = mockReservaBody;
      svc.crearReserva(body).subscribe();
      const req = http.expectOne(`${environment.apiUrl}/reservas`);
      expect(req.request.body).toEqual(body);
      req.flush(mockReservaResponse);
      http.verify();
    });

    it('UserService sin getUserId/getUserRole envía tal cual', () => {
      const { svc, http } = setup({});
      const { documentoCliente: _omit, ...body } = mockReservaBody;
      svc.crearReserva(body).subscribe();
      const req = http.expectOne(`${environment.apiUrl}/reservas`);
      expect(req.request.body).toEqual(body);
      req.flush(mockReservaResponse);
      http.verify();
    });
  });

  it('getReservasByCliente sin fecha no agrega fecha', () => {
    service.getReservasByCliente(101).subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/reservas/cliente?documentoCliente=101`);
    expect(req.request.params.has('fecha')).toBe(false);
    req.flush({ code: 200, message: 'ok', data: [] });
  });

  it('getReservaByParameter ignora contactoId NaN y sin parámetros', () => {
    service.getReservaByParameter(NaN).subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/reservas/parameter`);
    expect(req.request.params.keys().length).toBe(0);
    req.flush({ code: 200, message: 'ok', data: [] });
  });

  it('getReservaByParameter no envía restaurante_id ni dia (el backend solo filtra contactoId y fecha)', () => {
    service.getReservaByParameter(2, '2025-02-06').subscribe();
    const req = httpMock.expectOne(
      `${environment.apiUrl}/reservas/parameter?contactoId=2&fecha=2025-02-06`,
    );
    expect(req.request.params.keys()).toEqual(['contactoId', 'fecha']);
    req.flush({ code: 200, message: 'ok', data: [] });
  });

  it('getReservaByParameter sin argumentos', () => {
    service.getReservaByParameter().subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/reservas/parameter`);
    expect(req.request.params.keys().length).toBe(0);
    req.flush({ code: 200, message: 'ok', data: [] });
  });
});
