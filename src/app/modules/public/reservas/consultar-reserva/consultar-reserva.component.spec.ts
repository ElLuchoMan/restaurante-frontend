import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { of, throwError } from 'rxjs';

import { LoggingService } from '../../../../core/services/logging.service';
import { ReservaService } from '../../../../core/services/reserva.service';
import { UserService } from '../../../../core/services/user.service';
import { estadoReserva } from '../../../../shared/constants';
import {
  mockReserva,
  mockReservasUnordered,
  mockReservaUpdateResponse,
} from '../../../../shared/mocks/reserva.mocks';
import {
  createLoggingServiceMock,
  createReservaServiceMock,
  createToastrMock,
  createUserServiceMock,
} from '../../../../shared/mocks/test-doubles';
import { ApiResponse } from '../../../../shared/models/api-response.model';
import { Reserva } from '../../../../shared/models/reserva.model';
import { ConsultarReservaComponent } from './consultar-reserva.component';

describe('ConsultarReservaComponent', () => {
  let component: ConsultarReservaComponent;
  let fixture: ComponentFixture<ConsultarReservaComponent>;
  let reservaService: jest.Mocked<ReservaService>;
  let toastr: jest.Mocked<ToastrService>;
  let userService: jest.Mocked<UserService>;
  let loggingService: jest.Mocked<LoggingService>;

  beforeEach(async () => {
    const reservaServiceMock = createReservaServiceMock() as jest.Mocked<ReservaService>;
    const toastrMock = createToastrMock() as jest.Mocked<ToastrService>;
    const userServiceMock = createUserServiceMock() as jest.Mocked<UserService>;
    userServiceMock.getUserRole.mockReturnValue('Administrador');
    userServiceMock.getUserId.mockReturnValue(123456);
    const loggingServiceMock = createLoggingServiceMock() as jest.Mocked<LoggingService>;

    await TestBed.configureTestingModule({
      imports: [ConsultarReservaComponent, FormsModule, CommonModule, HttpClientTestingModule],
      providers: [
        { provide: ReservaService, useValue: reservaServiceMock },
        { provide: ToastrService, useValue: toastrMock },
        { provide: UserService, useValue: userServiceMock },
        { provide: LoggingService, useValue: loggingServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConsultarReservaComponent);
    component = fixture.componentInstance;
    reservaService = TestBed.inject(ReservaService) as jest.Mocked<ReservaService>;
    toastr = TestBed.inject(ToastrService) as jest.Mocked<ToastrService>;
    userService = TestBed.inject(UserService) as jest.Mocked<UserService>;
    loggingService = TestBed.inject(LoggingService) as jest.Mocked<LoggingService>;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should reset reservations and message when no search criteria is selected', () => {
    component.buscarPorDocumento = false;
    component.buscarPorFecha = false;
    component.actualizarTipoBusqueda();
    expect(component.reservas).toEqual([]);
    expect(component.mostrarMensaje).toBe(false);
  });

  it('should show warning if no search criteria is selected', () => {
    component.buscarReserva();
    expect(toastr.warning).toHaveBeenCalledWith(
      'Selecciona al menos un criterio de búsqueda',
      'Atención',
    );
  });

  it('should show warning if document is required but missing', () => {
    component.buscarPorDocumento = true;
    component.documentoCliente = '';
    component.buscarReserva();
    expect(toastr.warning).toHaveBeenCalledWith('Por favor ingresa un documento', 'Atención');
  });

  it('should show warning if date is required but missing', () => {
    component.buscarPorFecha = true;
    component.fechaReserva = '';
    component.buscarReserva();
    expect(toastr.warning).toHaveBeenCalledWith('Por favor selecciona una fecha', 'Atención');
  });

  it('should show error if document is invalid', () => {
    component.buscarPorDocumento = true;
    component.documentoCliente = 'abc';
    component.buscarReserva();
    expect(toastr.error).toHaveBeenCalledWith('El documento debe ser un número válido', 'Error');
  });

  it('should call reservaService.getReservaByParameter with correct params', () => {
    reservaService.getReservaByParameter.mockReturnValue(
      of({ code: 200, message: 'Reservas obtenidas con éxito', data: [mockReserva] }),
    );

    component.buscarPorDocumento = true;
    component.documentoCliente = '123456';
    component.buscarPorFecha = true;
    component.fechaReserva = '2025-01-01';

    component.buscarReserva();

    expect(reservaService.getReservaByParameter).toHaveBeenCalledWith(123456, '2025-01-01');
    expect(component.reservas.length).toBe(1);
  });

  it('should handle error when searching for reservations', () => {
    reservaService.getReservaByParameter.mockReturnValue(throwError(() => new Error()));

    component.buscarPorDocumento = true;
    component.documentoCliente = '123456';

    component.buscarReserva();

    expect(toastr.error).toHaveBeenCalledWith('Ocurrió un error al buscar la reserva', 'Error');
  });

  it('should confirm a reservation and update its status', () => {
    reservaService.actualizarReserva.mockReturnValue(of(mockReservaUpdateResponse));

    component.confirmarReserva(mockReserva);

    expect(reservaService.actualizarReserva).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ estadoReserva: estadoReserva.CONFIRMADA }),
    );
    expect(toastr.success).toHaveBeenCalledWith(
      'Reserva marcada como CONFIRMADA',
      'Actualización Exitosa',
    );
  });

  it('should cancel a reservation and update its status', () => {
    const mockUpdateResponse: ApiResponse<Reserva> = {
      code: 200,
      message: 'Reserva actualizada con éxito',
      data: mockReserva,
    };

    reservaService.actualizarReserva.mockReturnValue(of(mockUpdateResponse));

    component.cancelarReserva(mockReserva);

    expect(reservaService.actualizarReserva).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ estadoReserva: 'CANCELADA' }),
    );
    expect(toastr.success).toHaveBeenCalledWith(
      'Reserva marcada como CANCELADA',
      'Actualización Exitosa',
    );
  });

  it('should fulfill a reservation and update its status', () => {
    const mockUpdateResponse: ApiResponse<Reserva> = {
      code: 200,
      message: 'Reserva actualizada con éxito',
      data: mockReserva,
    };

    reservaService.actualizarReserva.mockReturnValue(of(mockUpdateResponse));

    component.cumplirReserva(mockReserva);

    expect(reservaService.actualizarReserva).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ estadoReserva: 'CUMPLIDA' }),
    );
    expect(toastr.success).toHaveBeenCalledWith(
      'Reserva marcada como CUMPLIDA',
      'Actualización Exitosa',
    );
  });

  it('should show error if updating a reservation fails', () => {
    reservaService.actualizarReserva.mockReturnValue(throwError(() => new Error()));

    component.confirmarReserva(mockReserva);

    expect(toastr.error).toHaveBeenCalledWith('Ocurrió un error al actualizar la reserva', 'Error');
  });

  it('should show error if reservaId is invalid', () => {
    const invalidReserva = { ...mockReserva, reservaId: NaN };
    component.confirmarReserva(invalidReserva);
    expect(toastr.error).toHaveBeenCalledWith('Error: ID de reserva no válido', 'Error');
  });

  it('should sort reservations by date (desc) and time (desc)', () => {
    reservaService.getReservaByParameter.mockReturnValue(
      of({ code: 200, message: 'Reservas obtenidas', data: mockReservasUnordered }),
    );

    component.buscarPorDocumento = true;
    component.documentoCliente = '123456';
    component.buscarReserva();

    expect(reservaService.getReservaByParameter).toHaveBeenCalledWith(123456, undefined);

    expect(component.reservas.map((r) => ({ fecha: r.fechaReserva, hora: r.horaReserva }))).toEqual(
      [
        { fecha: '2025-01-02', hora: '16:00' },
        { fecha: '2025-01-01', hora: '18:00' },
        { fecha: '2025-01-01', hora: '14:00' },
      ],
    );
  });

  it('should initialize as non-admin and load reservations', () => {
    userService.getUserRole.mockReturnValue('Cliente');
    userService.getUserId.mockReturnValue(123456);
    reservaService.getReservaByParameter.mockReturnValue(
      of({ code: 200, message: 'Reservas obtenidas', data: [mockReserva] }),
    );

    component.ngOnInit();

    expect(component.esAdmin).toBe(false);
    expect(component.mostrarFiltros).toBe(false);
    expect(component.documentoCliente).toBe('123456');
    expect(component.buscarPorDocumento).toBe(true);
    expect(component.buscarPorFecha).toBe(false);
    expect(reservaService.getReservaByParameter).toHaveBeenCalledWith(123456, undefined);
    expect(component.reservas).toEqual([mockReserva]);
    expect(component.mostrarMensaje).toBe(true);
  });

  it('should warn on init when non-admin has no document', () => {
    userService.getUserRole.mockReturnValue('Cliente');
    userService.getUserId.mockReturnValue(undefined as unknown as number);

    component.ngOnInit();

    expect(component.documentoCliente).toBe('');
    expect(toastr.warning).toHaveBeenCalledWith('Por favor ingresa un documento', 'Atención');
  });

  it('should use user id when no criteria provided for non-admin', () => {
    userService.getUserId.mockReturnValue(123456);
    component.esAdmin = false;
    component.mostrarFiltros = false;
    component.buscarPorDocumento = false;
    component.buscarPorFecha = false;
    component.documentoCliente = '';
    reservaService.getReservaByParameter.mockReturnValue(
      of({ code: 200, message: 'Reservas obtenidas', data: [mockReserva] }),
    );

    component.buscarReserva();

    expect(reservaService.getReservaByParameter).toHaveBeenCalledWith(123456, undefined);
  });

  it('should call service with undefined when user id is missing for non-admin', () => {
    userService.getUserId.mockReturnValue(undefined as unknown as number);
    component.esAdmin = false;
    component.mostrarFiltros = false;
    component.buscarPorDocumento = false;
    component.buscarPorFecha = false;
    component.documentoCliente = '';
    reservaService.getReservaByParameter.mockReturnValue(
      of({ code: 200, message: 'Reservas obtenidas', data: [mockReserva] }),
    );

    component.buscarReserva();

    expect(reservaService.getReservaByParameter).toHaveBeenCalledWith(undefined, undefined);
  });

  it('should not update reservation when user is not admin', () => {
    component.esAdmin = false;

    component.confirmarReserva(mockReserva);

    expect(reservaService.actualizarReserva).not.toHaveBeenCalled();
  });

  it('should return the same date if it has three parts', () => {
    const result = component['convertirFechaISO']('2025-01-15');
    expect(result).toBe('2025-01-15');
  });

  it('should return the original string if it does not have three parts', () => {
    const result = component['convertirFechaISO']('invalid-date');
    expect(result).toBe('invalid-date');
  });
});
