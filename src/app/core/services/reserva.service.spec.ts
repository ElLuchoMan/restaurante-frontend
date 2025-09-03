import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HandleErrorService } from '../../core/services/handle-error.service';
import { UserService } from '../../core/services/user.service';
import {
  mockReserva,
  mockReservaBody,
  mockReservaResponse,
} from '../../shared/mocks/reserva.mocks';
import { ApiResponse } from '../../shared/models/api-response.model';
import { Reserva } from '../../shared/models/reserva.model';
import { ReservaService } from './reserva.service';

describe('ReservaService', () => {
  let service: ReservaService;
  let httpMock: HttpTestingController;
  let handleErrorService: jest.Mocked<HandleErrorService>;

  beforeEach(() => {
    const handleErrorMock = {
      handleError: jest.fn(() => throwError(() => new Error('Error de API'))),
    } as unknown as jest.Mocked<HandleErrorService>;

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ReservaService,
        { provide: HandleErrorService, useValue: handleErrorMock },
        { provide: UserService, useValue: {} },
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

    const req = httpMock.expectOne(
      `${environment.apiUrl}/reservas?id=${mockReserva.reservaId}`,
    );
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(mockReservaBody);
    req.flush(mockReservaResponse);
  });

  it('should get reserva by parameters (documentoCliente)', () => {
    const mockResponse: ApiResponse<Reserva[]> = {
      code: 200,
      message: 'Reserva encontrada',
      data: [mockReservaBody],
    };

    service.getReservaByParameter(1015466494).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(
      `${environment.apiUrl}/reservas/parameter?documentoCliente=1015466494`,
    );
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

    const req = httpMock.expectOne(
      `${environment.apiUrl}/reservas?id=${mockReserva.reservaId}`,
    );
    req.error(new ErrorEvent('API error'));
    expect(handleErrorService.handleError).toHaveBeenCalled();
  });

  it('should handle API error when getting reserva by parameters', () => {
    service.getReservaByParameter(1015466494).subscribe({
      error: (error) => {
        expect(error).toBeTruthy();
      },
    });

    const req = httpMock.expectOne(
      `${environment.apiUrl}/reservas/parameter?documentoCliente=1015466494`,
    );
    req.error(new ErrorEvent('API error'));
    expect(handleErrorService.handleError).toHaveBeenCalled();
  });
});
