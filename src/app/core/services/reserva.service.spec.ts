import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { HandleErrorService } from '../../core/services/handle-error.service';
import { UserService } from '../../core/services/user.service';
import {
  mockReserva,
  mockReservaBody,
  mockReservaResponse,
} from '../../shared/mocks/reserva.mocks';
import { createHandleErrorServiceMock } from '../../shared/mocks/test-doubles';
import { ApiResponse } from '../../shared/models/api-response.model';
import { Reserva } from '../../shared/models/reserva.model';
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

  it('cliente autenticado: usa contactoId si existe, fallback documentoCliente', () => {
    TestBed.resetTestingModule();
    const handleErrorMock = createHandleErrorServiceMock() as any;
    const user = { getUserId: () => 101, getUserRole: () => 'Cliente' };
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ReservaService,
        { provide: HandleErrorService, useValue: handleErrorMock },
        { provide: UserService, useValue: user },
      ],
    });
    const svc = TestBed.inject(ReservaService);
    const http = TestBed.inject(HttpTestingController);

    // Caso: encuentra contactoId
    svc.crearReserva(mockReservaBody).subscribe((r) => expect(r).toEqual(mockReservaResponse));
    const r1 = http.expectOne(`${environment.apiUrl}/reserva_contacto?documento_cliente=101`);
    r1.flush({ code: 200, message: 'ok', data: [{ contactoId: 5 }] });
    const r2 = http.expectOne(`${environment.apiUrl}/reservas`);
    expect(r2.request.body.contactoId).toBe(5);
    expect(r2.request.body.documentoCliente).toBeUndefined();
    r2.flush(mockReservaResponse);

    // Caso: no encuentra contactoId -> fallback documentoCliente
    svc.crearReserva(mockReservaBody).subscribe((r) => expect(r).toEqual(mockReservaResponse));
    const r3 = http.expectOne(`${environment.apiUrl}/reserva_contacto?documento_cliente=101`);
    r3.flush({ code: 200, message: 'ok', data: [] });
    const r4 = http.expectOne(`${environment.apiUrl}/reservas`);
    expect(r4.request.body.documentoCliente).toBe(101);
    expect(r4.request.body.contactoId).toBeUndefined();
    r4.flush(mockReservaResponse);

    http.verify();
  });

  it('cliente autenticado: si falla consulta de contacto, hace POST directo (fallback catchError)', () => {
    TestBed.resetTestingModule();
    const handleErrorMock = createHandleErrorServiceMock() as any;
    const user = { getUserId: () => 101, getUserRole: () => 'Cliente' };
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ReservaService,
        { provide: HandleErrorService, useValue: handleErrorMock },
        { provide: UserService, useValue: user },
      ],
    });
    const svc = TestBed.inject(ReservaService);
    const http = TestBed.inject(HttpTestingController);

    svc.crearReserva(mockReservaBody).subscribe((r) => expect(r).toEqual(mockReservaResponse));
    const r1 = http.expectOne(`${environment.apiUrl}/reserva_contacto?documento_cliente=101`);
    // fuerza error en la búsqueda de contacto
    r1.error(new ErrorEvent('network'));
    // debe hacer POST con el payload original
    const r2 = http.expectOne(`${environment.apiUrl}/reservas`);
    expect(r2.request.method).toBe('POST');
    r2.flush(mockReservaResponse);

    http.verify();
  });

  it('creates reserva for admin/anónimo removiendo contactoId inválido y documentoCliente vacío', () => {
    const body: any = { ...mockReservaBody, contactoId: undefined, documentoCliente: undefined };
    service.crearReserva(body).subscribe((response) => {
      expect(response).toEqual(mockReservaResponse);
    });
    const req = httpMock.expectOne(`${environment.apiUrl}/reservas`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.contactoId).toBeUndefined();
    expect(req.request.body.documentoCliente).toBeUndefined();
    req.flush(mockReservaResponse);
  });

  it('should get reservas successfully', () => {
    const mockResponse: ApiResponse<Reserva[]> = {
      code: 200,
      message: 'Reservas obtenidas',
      data: [mockReservaBody],
    };

    service.obtenerReservas().subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/reservas`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should update a reserva successfully', () => {
    service.actualizarReserva(mockReserva.reservaId!, mockReservaBody).subscribe((response) => {
      expect(response).toEqual(mockReservaResponse);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/reservas?id=${mockReserva.reservaId}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(mockReservaBody);
    req.flush(mockReservaResponse);
  });

  it('should get reserva by parameters (contactoId)', () => {
    const mockResponse: ApiResponse<Reserva[]> = {
      code: 200,
      message: 'Reserva encontrada',
      data: [mockReservaBody],
    };

    service.getReservaByParameter(1).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/reservas/parameter?contactoId=1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should get reserva by parameters (fecha)', () => {
    const mockResponse: ApiResponse<Reserva[]> = {
      code: 200,
      message: 'Reservas encontradas por fecha',
      data: [mockReservaBody],
    };

    service.getReservaByParameter(undefined, '2025-02-06').subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/reservas/parameter?fecha=2025-02-06`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should get reserva by parameters (restauranteId)', () => {
    const mockResponse: ApiResponse<Reserva[]> = {
      code: 200,
      message: 'Reservas encontradas por restaurante',
      data: [mockReservaBody],
    };

    service.getReservaByParameter(undefined, undefined, 7).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/reservas/parameter?restaurante_id=7`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should get reserva by parameters (día)', () => {
    const mockResponse: ApiResponse<Reserva[]> = {
      code: 200,
      message: 'Reservas encontradas por día',
      data: [mockReservaBody],
    };

    service.getReservaByParameter(undefined, undefined, undefined, 'Lunes').subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/reservas/parameter?dia=Lunes`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should get reserva by id successfully', () => {
    const mockResponse: ApiResponse<Reserva> = {
      code: 200,
      message: 'Reserva encontrada',
      data: mockReserva,
    };

    service.getReservaById(3).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/reservas/search?id=3`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should delete reserva successfully', () => {
    const mockResponse: ApiResponse<unknown> = {
      code: 200,
      message: 'Reserva eliminada',
      data: null,
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
    const mockResponse: ApiResponse<Reserva[]> = {
      code: 200,
      message: 'ok',
      data: [mockReservaBody],
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
    service.actualizarReserva(mockReserva.reservaId!, mockReservaBody).subscribe({
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
});
