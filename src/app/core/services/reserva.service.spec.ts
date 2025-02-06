import { TestBed } from '@angular/core/testing';
import { ReservaService } from './reserva.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../../environments/environment';
import { HandleErrorService } from '../../core/services/handle-error.service';
import { UserService } from '../../core/services/user.service';
import { of, throwError } from 'rxjs';
import { ApiResponse } from '../../shared/models/api-response.model';
import { Reserva } from '../../shared/models/reserva.model';

describe('ReservaService', () => {
  let service: ReservaService;
  let httpMock: HttpTestingController;
  let handleErrorService: jest.Mocked<HandleErrorService>;

  const mockReserva: Reserva = {
    reservaId: 1,
    documentoCliente: 123456,
    telefono: '123456789',
    fechaReserva: '2025-01-01',
    horaReserva: '18:00',
    personas: 4,
    estadoReserva: 'PENDIENTE',
    createdAt: new Date().toISOString(),
    createdBy: 'testUser',
    indicaciones: 'Ninguna',
    nombreCompleto: 'John Doe',
    updatedAt: new Date().toISOString(),
    updatedBy: 'testUser'
  };

  const mockApiResponse: ApiResponse<Reserva> = {
    code: 200,
    message: 'Reserva creada con éxito',
    data: mockReserva
  };

  beforeEach(() => {
    const handleErrorMock = {
      handleError: jest.fn(() => throwError(() => new Error('Error de API')))
    } as unknown as jest.Mocked<HandleErrorService>;

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ReservaService,
        { provide: HandleErrorService, useValue: handleErrorMock },
        { provide: UserService, useValue: {} }
      ]
    });

    service = TestBed.inject(ReservaService);
    httpMock = TestBed.inject(HttpTestingController);
    handleErrorService = TestBed.inject(HandleErrorService) as jest.Mocked<HandleErrorService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create a reserva successfully', () => {
    service.crearReserva(mockReserva).subscribe(response => {
      expect(response).toEqual(mockApiResponse);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/reservas`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockReserva);
    req.flush(mockApiResponse);
  });

  it('should get reservas successfully', () => {
    const mockResponse: ApiResponse<Reserva[]> = {
      code: 200,
      message: 'Reservas obtenidas',
      data: [mockReserva]
    };

    service.obtenerReservas().subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/reservas`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should update a reserva successfully', () => {

    if (mockReserva.reservaId) {
      service.actualizarReserva(mockReserva.reservaId, mockReserva).subscribe(response => {
        expect(response).toEqual(mockApiResponse);
      });
    }
    const req = httpMock.expectOne(`${environment.apiUrl}/reservas?id=${mockReserva.reservaId}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(mockReserva);
    req.flush(mockApiResponse);
  });

  it('should get reserva by parameters (documentoCliente)', () => {
    const mockResponse: ApiResponse<Reserva[]> = {
      code: 200,
      message: 'Reserva encontrada',
      data: [mockReserva]
    };

    service.getReservaByParameter(123456).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/reservas/parameter?documentoCliente=123456`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should get reserva by parameters (fecha)', () => {
    const mockResponse: ApiResponse<Reserva[]> = {
      code: 200,
      message: 'Reservas encontradas por fecha',
      data: [mockReserva]
    };

    service.getReservaByParameter(undefined, '2025-01-01').subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/reservas/parameter?fecha=2025-01-01`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should handle API error when creating a reserva', () => {
    service.crearReserva(mockReserva).subscribe({
      error: (error) => {
        expect(error).toBeTruthy();
      }
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/reservas`);
    req.error(new ErrorEvent('API error'));
    expect(handleErrorService.handleError).toHaveBeenCalled();
  });

  it('should handle API error when fetching reservas', () => {
    service.obtenerReservas().subscribe({
      error: (error) => {
        expect(error).toBeTruthy();
      }
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/reservas`);
    req.error(new ErrorEvent('API error'));
    expect(handleErrorService.handleError).toHaveBeenCalled();
  });

  it('should handle API error when updating a reserva', () => {
    if (mockReserva.reservaId) {
      service.actualizarReserva(mockReserva.reservaId, mockReserva).subscribe({
        error: (error) => {
          expect(error).toBeTruthy();
        }
      });
    }

    const req = httpMock.expectOne(`${environment.apiUrl}/reservas?id=${mockReserva.reservaId}`);
    req.error(new ErrorEvent('API error'));
    expect(handleErrorService.handleError).toHaveBeenCalled();
  });

  it('should handle API error when getting reserva by parameters', () => {
    service.getReservaByParameter(123456).subscribe({
      error: (error) => {
        expect(error).toBeTruthy();
      }
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/reservas/parameter?documentoCliente=123456`);
    req.error(new ErrorEvent('API error'));
    expect(handleErrorService.handleError).toHaveBeenCalled();
  });
});
