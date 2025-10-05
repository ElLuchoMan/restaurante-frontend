import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { of, throwError } from 'rxjs';

import { LoggingService } from '../../../../core/services/logging.service';
import { ReservaContactoService } from '../../../../core/services/reserva-contacto.service';
import { ReservaNotificationsService } from '../../../../core/services/reserva-notifications.service';
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
  createReservaContactoServiceMock,
  createReservaNotificationsServiceMock,
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
  let reservaContactoService: jest.Mocked<ReservaContactoService>;
  let reservaNotificationsService: jest.Mocked<ReservaNotificationsService>;
  let toastr: jest.Mocked<ToastrService>;
  let userService: jest.Mocked<UserService>;
  let loggingService: jest.Mocked<LoggingService>;

  beforeEach(async () => {
    const reservaServiceMock = createReservaServiceMock() as jest.Mocked<ReservaService>;
    const reservaContactoServiceMock =
      createReservaContactoServiceMock() as jest.Mocked<ReservaContactoService>;
    const reservaNotificationsServiceMock =
      createReservaNotificationsServiceMock() as jest.Mocked<ReservaNotificationsService>;
    const toastrMock = createToastrMock() as jest.Mocked<ToastrService>;
    const userServiceMock = createUserServiceMock() as jest.Mocked<UserService>;
    userServiceMock.getUserRole.mockReturnValue('Administrador');
    userServiceMock.getUserId.mockReturnValue(123456);
    const loggingServiceMock = createLoggingServiceMock() as jest.Mocked<LoggingService>;

    await TestBed.configureTestingModule({
      imports: [ConsultarReservaComponent, FormsModule, CommonModule, HttpClientTestingModule],
      providers: [
        { provide: ReservaService, useValue: reservaServiceMock },
        { provide: ReservaContactoService, useValue: reservaContactoServiceMock },
        { provide: ReservaNotificationsService, useValue: reservaNotificationsServiceMock },
        { provide: ToastrService, useValue: toastrMock },
        { provide: UserService, useValue: userServiceMock },
        { provide: LoggingService, useValue: loggingServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConsultarReservaComponent);
    component = fixture.componentInstance;
    reservaService = TestBed.inject(ReservaService) as jest.Mocked<ReservaService>;
    reservaContactoService = TestBed.inject(
      ReservaContactoService,
    ) as jest.Mocked<ReservaContactoService>;
    reservaNotificationsService = TestBed.inject(
      ReservaNotificationsService,
    ) as jest.Mocked<ReservaNotificationsService>;
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

  it('should call reservaService.getReservasByDocumento with correct params', () => {
    reservaService.getReservasByDocumento.mockReturnValue(
      of({ code: 200, message: 'Reservas obtenidas con éxito', data: [mockReserva] }),
    );

    component.buscarPorDocumento = true;
    component.documentoCliente = '123456';
    component.buscarPorFecha = true;
    component.fechaReserva = '2025-01-01';

    component.buscarReserva();

    expect(reservaService.getReservasByDocumento).toHaveBeenCalledWith(123456, '2025-01-01');
    expect(component.reservas.length).toBe(1);
  });

  it('should handle error when searching for reservations', () => {
    reservaService.getReservasByDocumento.mockReturnValue(throwError(() => new Error()));

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
    reservaService.getReservasByDocumento.mockReturnValue(
      of({ code: 200, message: 'Reservas obtenidas', data: mockReservasUnordered }),
    );

    component.buscarPorDocumento = true;
    component.documentoCliente = '123456';
    component.buscarReserva();

    expect(reservaService.getReservasByDocumento).toHaveBeenCalledWith(123456, undefined);

    expect(component.reservas.map((r) => ({ fecha: r.fechaReserva, hora: r.horaReserva }))).toEqual(
      [
        { fecha: '2025-01-02', hora: '16:00:00' },
        { fecha: '2025-01-01', hora: '18:00:00' },
        { fecha: '2025-01-01', hora: '14:00:00' },
      ],
    );
  });

  it('should initialize as non-admin and load reservations', () => {
    userService.getUserRole.mockReturnValue('Cliente');
    userService.getUserId.mockReturnValue(123456);
    reservaService.getReservasByDocumento.mockReturnValue(
      of({ code: 200, message: 'Reservas obtenidas', data: [mockReserva] }),
    );

    component.ngOnInit();

    expect(component.esAdmin).toBe(false);
    expect(component.mostrarFiltros).toBe(false);
    expect(component.documentoCliente).toBe('123456');
    expect(component.buscarPorDocumento).toBe(true);
    expect(component.buscarPorFecha).toBe(false);
    expect(reservaService.getReservasByDocumento).toHaveBeenCalledWith(123456, undefined);
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
    reservaService.getReservasByDocumento.mockReturnValue(
      of({ code: 200, message: 'Reservas obtenidas', data: [mockReserva] }),
    );

    component.buscarReserva();

    expect(reservaService.getReservasByDocumento).toHaveBeenCalledWith(123456, undefined);
  });

  it('should warn when user id is missing for non-admin (no documento)', () => {
    userService.getUserId.mockReturnValue(undefined as unknown as number);
    component.esAdmin = false;
    component.mostrarFiltros = false;
    component.buscarPorDocumento = false;
    component.buscarPorFecha = false;
    component.documentoCliente = '';

    component.buscarReserva();

    expect(toastr.warning).toHaveBeenCalledWith('Documento requerido para la búsqueda', 'Atención');
    expect(reservaService.getReservasByDocumento).not.toHaveBeenCalled();
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

  it('should search by date only (without documento) for admin', async () => {
    component.mostrarFiltros = true;
    component.buscarPorDocumento = false;
    component.buscarPorFecha = true;
    component.fechaReserva = '2025-01-15';

    const mockResponse: ApiResponse<any> = {
      code: 200,
      message: 'Reservas obtenidas',
      data: [mockReserva],
    };

    reservaService.getReservaByParameter.mockReturnValue(of(mockResponse));

    component.buscarReserva();

    expect(reservaService.getReservaByParameter).toHaveBeenCalledWith(undefined, '2025-01-15');

    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(component.reservas).toHaveLength(1);
    expect(component.mostrarMensaje).toBe(true);
  });

  it('should handle error when searching by date only', () => {
    component.mostrarFiltros = true;
    component.buscarPorDocumento = false;
    component.buscarPorFecha = true;
    component.fechaReserva = '2025-01-15';

    reservaService.getReservaByParameter.mockReturnValue(throwError(() => new Error('API Error')));

    component.buscarReserva();

    expect(toastr.error).toHaveBeenCalledWith('Ocurrió un error al buscar la reserva', 'Error');
  });

  it('should enrich reservas with missing contact info', async () => {
    const mockReservaIncompleta = {
      ...mockReserva,
      nombreCompleto: '',
      telefono: '',
      contactoId: 1,
    };

    const mockContactoInfo = {
      code: 200,
      message: 'Contacto obtenido',
      data: {
        contactoId: 1,
        nombreCompleto: 'Juan Pérez',
        telefono: '3001234567',
        documentoCliente: 1234567890,
      },
    };

    reservaService.getReservasByDocumento.mockReturnValue(
      of({ code: 200, message: 'Reservas obtenidas', data: [mockReservaIncompleta] }),
    );
    reservaContactoService.getById.mockReturnValue(of(mockContactoInfo));

    component.buscarPorDocumento = true;
    component.documentoCliente = '123456';
    component.buscarReserva();

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(reservaContactoService.getById).toHaveBeenCalledWith(1);
    expect(component.reservas[0].nombreCompleto).toBe('Juan Pérez');
    expect(component.reservas[0].telefono).toBe('3001234567');
  });

  it('should handle error when enriching contact info', async () => {
    const mockReservaIncompleta = {
      ...mockReserva,
      nombreCompleto: '',
      telefono: '',
      contactoId: 1,
    };

    reservaService.getReservasByDocumento.mockReturnValue(
      of({ code: 200, message: 'Reservas obtenidas', data: [mockReservaIncompleta] }),
    );
    reservaContactoService.getById.mockReturnValue(throwError(() => new Error('Contact Error')));

    component.buscarPorDocumento = true;
    component.documentoCliente = '123456';
    component.buscarReserva();

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(component.reservas).toHaveLength(1);
  });

  it('should update reserva in list after confirming', async () => {
    component.reservas = [mockReserva];
    reservaService.actualizarReserva.mockReturnValue(of(mockReservaUpdateResponse));

    component.confirmarReserva(mockReserva);

    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(component.reservas[0].estadoReserva).toBe(estadoReserva.CONFIRMADA);
  });

  it('should pass documentoInput parameter to buscarReserva', () => {
    reservaService.getReservasByDocumento.mockReturnValue(
      of({ code: 200, message: 'Reservas obtenidas', data: [mockReserva] }),
    );

    component.buscarPorDocumento = true;
    component.buscarReserva(987654);

    expect(reservaService.getReservasByDocumento).toHaveBeenCalledWith(987654, undefined);
  });

  it('should enrich reservas by date only with missing contact info', async () => {
    const mockReservaIncompleta = {
      ...mockReserva,
      nombreCompleto: '',
      telefono: '',
      contactoId: 1,
    };

    const mockContactoInfo = {
      code: 200,
      message: 'Contacto obtenido',
      data: {
        contactoId: 1,
        nombreCompleto: 'María García',
        telefono: '3112345678',
        documentoCliente: 9876543210,
      },
    };

    component.mostrarFiltros = true;
    component.buscarPorDocumento = false;
    component.buscarPorFecha = true;
    component.fechaReserva = '2025-01-20';

    reservaService.getReservaByParameter.mockReturnValue(
      of({ code: 200, message: 'Reservas obtenidas', data: [mockReservaIncompleta] }),
    );
    reservaContactoService.getById.mockReturnValue(of(mockContactoInfo));

    component.buscarReserva();

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(reservaContactoService.getById).toHaveBeenCalledWith(1);
    expect(component.reservas[0].nombreCompleto).toBe('María García');
    expect(component.reservas[0].telefono).toBe('3112345678');
  });

  it('should handle reservas without contactoId when enriching by date', async () => {
    const mockReservaSinContacto = {
      ...mockReserva,
      nombreCompleto: '',
      telefono: '',
      contactoId: null,
    };

    component.mostrarFiltros = true;
    component.buscarPorDocumento = false;
    component.buscarPorFecha = true;
    component.fechaReserva = '2025-01-20';

    reservaService.getReservaByParameter.mockReturnValue(
      of({ code: 200, message: 'Reservas obtenidas', data: [mockReservaSinContacto] }),
    );

    component.buscarReserva();

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(reservaContactoService.getById).not.toHaveBeenCalled();
    expect(component.reservas).toHaveLength(1);
  });

  it('should handle response.data as empty array', () => {
    reservaService.getReservasByDocumento.mockReturnValue(
      of({ code: 200, message: 'No hay reservas', data: null } as any),
    );

    component.buscarPorDocumento = true;
    component.documentoCliente = '123456';
    component.buscarReserva();

    expect(component.reservas).toHaveLength(0);
    expect(component.mostrarMensaje).toBe(true);
  });

  it('should handle reservas without contactoId when enriching by documento', async () => {
    const mockReservaSinContacto = {
      ...mockReserva,
      nombreCompleto: '',
      telefono: '',
      contactoId: null,
    };

    reservaService.getReservasByDocumento.mockReturnValue(
      of({ code: 200, message: 'Reservas obtenidas', data: [mockReservaSinContacto] }),
    );

    component.buscarPorDocumento = true;
    component.documentoCliente = '123456';
    component.buscarReserva();

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(reservaContactoService.getById).not.toHaveBeenCalled();
    expect(component.reservas).toHaveLength(1);
  });

  it('should handle contactoId as object when enriching', async () => {
    const mockReservaConObjetoContacto = {
      ...mockReserva,
      nombreCompleto: '',
      telefono: '',
      contactoId: { contactoId: 2 },
    };

    const mockContactoInfo = {
      code: 200,
      message: 'Contacto obtenido',
      data: {
        contactoId: 2,
        nombreCompleto: 'Pedro López',
        telefono: '3209876543',
        documentoCliente: 1122334455,
      },
    };

    reservaService.getReservasByDocumento.mockReturnValue(
      of({ code: 200, message: 'Reservas obtenidas', data: [mockReservaConObjetoContacto] }),
    );
    reservaContactoService.getById.mockReturnValue(of(mockContactoInfo));

    component.buscarPorDocumento = true;
    component.documentoCliente = '123456';
    component.buscarReserva();

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(reservaContactoService.getById).toHaveBeenCalledWith(2);
    expect(component.reservas[0].nombreCompleto).toBe('Pedro López');
  });

  it('should handle null documentoCliente when notifying estado cambio', async () => {
    const mockReservaSinDoc = { ...mockReserva, documentoCliente: null };
    component.reservas = [mockReservaSinDoc];
    reservaService.actualizarReserva.mockReturnValue(of(mockReservaUpdateResponse));

    component.confirmarReserva(mockReservaSinDoc);

    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(reservaNotificationsService.notifyEstadoCambio).toHaveBeenCalled();
  });

  it('should sort multiple reservas by date when searching by date only', async () => {
    component.mostrarFiltros = true;
    component.buscarPorDocumento = false;
    component.buscarPorFecha = true;
    component.fechaReserva = '2025-01-15';

    reservaService.getReservaByParameter.mockReturnValue(
      of({ code: 200, message: 'Reservas obtenidas', data: mockReservasUnordered }),
    );

    component.buscarReserva();

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(component.reservas).toHaveLength(3);
    expect(component.reservas[0].fechaReserva).toBe('2025-01-02');
    expect(component.reservas[1].horaReserva).toBe('18:00:00');
  });

  it('should handle enrichment with null values in contacto info', async () => {
    const mockReservaIncompleta = {
      ...mockReserva,
      nombreCompleto: '',
      telefono: '',
      contactoId: 1,
    };

    const mockContactoInfoIncompleto = {
      code: 200,
      message: 'Contacto obtenido',
      data: {
        contactoId: 1,
        nombreCompleto: null,
        telefono: null,
        documentoCliente: null,
      },
    };

    component.mostrarFiltros = true;
    component.buscarPorDocumento = false;
    component.buscarPorFecha = true;
    component.fechaReserva = '2025-01-20';

    reservaService.getReservaByParameter.mockReturnValue(
      of({ code: 200, message: 'Reservas obtenidas', data: [mockReservaIncompleta] }),
    );
    reservaContactoService.getById.mockReturnValue(of(mockContactoInfoIncompleto));

    component.buscarReserva();

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(component.reservas).toHaveLength(1);
  });

  it('should handle response.data as null for date search', async () => {
    component.mostrarFiltros = true;
    component.buscarPorDocumento = false;
    component.buscarPorFecha = true;
    component.fechaReserva = '2025-01-15';

    reservaService.getReservaByParameter.mockReturnValue(
      of({ code: 200, message: 'No hay reservas', data: null } as any),
    );

    component.buscarReserva();

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(component.reservas).toHaveLength(0);
  });

  it('should preserve existing nombreCompleto when enriching by date', async () => {
    const mockReservaConNombre = {
      ...mockReserva,
      nombreCompleto: 'Nombre Existente',
      telefono: '',
      contactoId: 1,
    };

    const mockContactoInfo = {
      code: 200,
      message: 'Contacto obtenido',
      data: {
        contactoId: 1,
        nombreCompleto: 'Nombre Desde API',
        telefono: '3001234567',
        documentoCliente: 1234567890,
      },
    };

    component.mostrarFiltros = true;
    component.buscarPorDocumento = false;
    component.buscarPorFecha = true;
    component.fechaReserva = '2025-01-20';

    reservaService.getReservaByParameter.mockReturnValue(
      of({ code: 200, message: 'Reservas obtenidas', data: [mockReservaConNombre] }),
    );
    reservaContactoService.getById.mockReturnValue(of(mockContactoInfo));

    component.buscarReserva();

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(component.reservas[0].nombreCompleto).toBe('Nombre Existente');
  });

  it('should preserve existing telefono when enriching by date', async () => {
    const mockReservaConTelefono = {
      ...mockReserva,
      nombreCompleto: '',
      telefono: '3009876543',
      contactoId: 1,
    };

    const mockContactoInfo = {
      code: 200,
      message: 'Contacto obtenido',
      data: {
        contactoId: 1,
        nombreCompleto: 'Nombre Desde API',
        telefono: '3001234567',
        documentoCliente: 1234567890,
      },
    };

    component.mostrarFiltros = true;
    component.buscarPorDocumento = false;
    component.buscarPorFecha = true;
    component.fechaReserva = '2025-01-20';

    reservaService.getReservaByParameter.mockReturnValue(
      of({ code: 200, message: 'Reservas obtenidas', data: [mockReservaConTelefono] }),
    );
    reservaContactoService.getById.mockReturnValue(of(mockContactoInfo));

    component.buscarReserva();

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(component.reservas[0].telefono).toBe('3009876543');
  });

  it('should handle documentoCliente when both are null during enrichment by date', async () => {
    const mockReservaIncompleta = {
      ...mockReserva,
      nombreCompleto: '',
      telefono: '',
      contactoId: 1,
      documentoCliente: null,
    };

    const mockContactoInfo = {
      code: 200,
      message: 'Contacto obtenido',
      data: {
        contactoId: 1,
        nombreCompleto: 'Nombre',
        telefono: '3001234567',
        documentoCliente: null,
      },
    };

    component.mostrarFiltros = true;
    component.buscarPorDocumento = false;
    component.buscarPorFecha = true;
    component.fechaReserva = '2025-01-20';

    reservaService.getReservaByParameter.mockReturnValue(
      of({ code: 200, message: 'Reservas obtenidas', data: [mockReservaIncompleta] }),
    );
    reservaContactoService.getById.mockReturnValue(of(mockContactoInfo));

    component.buscarReserva();

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(component.reservas[0].documentoCliente).toBeNull();
  });

  it('should handle empty nombreCompleto from API when enriching by date', async () => {
    const mockReservaIncompleta = {
      ...mockReserva,
      nombreCompleto: '',
      telefono: '',
      contactoId: 1,
    };

    const mockContactoInfo = {
      code: 200,
      message: 'Contacto obtenido',
      data: {
        contactoId: 1,
        nombreCompleto: '',
        telefono: '3001234567',
        documentoCliente: 1234567890,
      },
    };

    component.mostrarFiltros = true;
    component.buscarPorDocumento = false;
    component.buscarPorFecha = true;
    component.fechaReserva = '2025-01-20';

    reservaService.getReservaByParameter.mockReturnValue(
      of({ code: 200, message: 'Reservas obtenidas', data: [mockReservaIncompleta] }),
    );
    reservaContactoService.getById.mockReturnValue(of(mockContactoInfo));

    component.buscarReserva();

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(component.reservas[0].nombreCompleto).toBe('');
  });

  it('should handle empty telefono from API when enriching by date', async () => {
    const mockReservaIncompleta = {
      ...mockReserva,
      nombreCompleto: 'Nombre Existente',
      telefono: '',
      contactoId: 1,
    };

    const mockContactoInfo = {
      code: 200,
      message: 'Contacto obtenido',
      data: {
        contactoId: 1,
        nombreCompleto: 'Nombre',
        telefono: '',
        documentoCliente: 1234567890,
      },
    };

    component.mostrarFiltros = true;
    component.buscarPorDocumento = false;
    component.buscarPorFecha = true;
    component.fechaReserva = '2025-01-20';

    reservaService.getReservaByParameter.mockReturnValue(
      of({ code: 200, message: 'Reservas obtenidas', data: [mockReservaIncompleta] }),
    );
    reservaContactoService.getById.mockReturnValue(of(mockContactoInfo));

    component.buscarReserva();

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(component.reservas[0].telefono).toBe('');
  });

  it('should use documentoCliente from API when reserva value is null', async () => {
    const mockReservaIncompleta = {
      ...mockReserva,
      nombreCompleto: '',
      telefono: '',
      contactoId: 1,
      documentoCliente: null,
    };

    const mockContactoInfo = {
      code: 200,
      message: 'Contacto obtenido',
      data: {
        contactoId: 1,
        nombreCompleto: 'Nombre',
        telefono: '3001234567',
        documentoCliente: 987654321,
      },
    };

    component.mostrarFiltros = true;
    component.buscarPorDocumento = false;
    component.buscarPorFecha = true;
    component.fechaReserva = '2025-01-20';

    reservaService.getReservaByParameter.mockReturnValue(
      of({ code: 200, message: 'Reservas obtenidas', data: [mockReservaIncompleta] }),
    );
    reservaContactoService.getById.mockReturnValue(of(mockContactoInfo));

    component.buscarReserva();

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(component.reservas[0].documentoCliente).toBe(987654321);
  });

  it('should preserve non-empty nombreCompleto with spaces when enriching by date', async () => {
    const mockReservaConNombreConEspacios = {
      ...mockReserva,
      nombreCompleto: ' Valid Name ',
      telefono: '',
      contactoId: 1,
    };

    const mockContactoInfo = {
      code: 200,
      message: 'Contacto obtenido',
      data: {
        contactoId: 1,
        nombreCompleto: 'Nombre API',
        telefono: '3001234567',
        documentoCliente: 1234567890,
      },
    };

    component.mostrarFiltros = true;
    component.buscarPorDocumento = false;
    component.buscarPorFecha = true;
    component.fechaReserva = '2025-01-20';

    reservaService.getReservaByParameter.mockReturnValue(
      of({ code: 200, message: 'Reservas obtenidas', data: [mockReservaConNombreConEspacios] }),
    );
    reservaContactoService.getById.mockReturnValue(of(mockContactoInfo));

    component.buscarReserva();

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(component.reservas[0].nombreCompleto).toBe(' Valid Name ');
  });

  it('should preserve non-empty telefono with spaces when enriching by date', async () => {
    const mockReservaConTelefonoConEspacios = {
      ...mockReserva,
      nombreCompleto: '',
      telefono: ' 3009876543 ',
      contactoId: 1,
    };

    const mockContactoInfo = {
      code: 200,
      message: 'Contacto obtenido',
      data: {
        contactoId: 1,
        nombreCompleto: 'Nombre API',
        telefono: '3001234567',
        documentoCliente: 1234567890,
      },
    };

    component.mostrarFiltros = true;
    component.buscarPorDocumento = false;
    component.buscarPorFecha = true;
    component.fechaReserva = '2025-01-20';

    reservaService.getReservaByParameter.mockReturnValue(
      of({ code: 200, message: 'Reservas obtenidas', data: [mockReservaConTelefonoConEspacios] }),
    );
    reservaContactoService.getById.mockReturnValue(of(mockContactoInfo));

    component.buscarReserva();

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(component.reservas[0].telefono).toBe(' 3009876543 ');
  });

  it('should use empty string when API nombreCompleto is null', async () => {
    const mockReservaIncompleta = {
      ...mockReserva,
      nombreCompleto: '   ',
      telefono: '',
      contactoId: 1,
    };

    const mockContactoInfo = {
      code: 200,
      message: 'Contacto obtenido',
      data: {
        contactoId: 1,
        nombreCompleto: null,
        telefono: '3001234567',
        documentoCliente: 1234567890,
      },
    };

    component.mostrarFiltros = true;
    component.buscarPorDocumento = false;
    component.buscarPorFecha = true;
    component.fechaReserva = '2025-01-20';

    reservaService.getReservaByParameter.mockReturnValue(
      of({ code: 200, message: 'Reservas obtenidas', data: [mockReservaIncompleta] }),
    );
    reservaContactoService.getById.mockReturnValue(of(mockContactoInfo));

    component.buscarReserva();

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(component.reservas[0].nombreCompleto).toBe('');
  });

  it('should use empty string when API telefono is null', async () => {
    const mockReservaIncompleta = {
      ...mockReserva,
      nombreCompleto: 'Nombre',
      telefono: '   ',
      contactoId: 1,
    };

    const mockContactoInfo = {
      code: 200,
      message: 'Contacto obtenido',
      data: {
        contactoId: 1,
        nombreCompleto: 'Nombre API',
        telefono: null,
        documentoCliente: 1234567890,
      },
    };

    component.mostrarFiltros = true;
    component.buscarPorDocumento = false;
    component.buscarPorFecha = true;
    component.fechaReserva = '2025-01-20';

    reservaService.getReservaByParameter.mockReturnValue(
      of({ code: 200, message: 'Reservas obtenidas', data: [mockReservaIncompleta] }),
    );
    reservaContactoService.getById.mockReturnValue(of(mockContactoInfo));

    component.buscarReserva();

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(component.reservas[0].telefono).toBe('');
  });

  it('should use null when both reserva and API documentoCliente are undefined', async () => {
    const mockReservaIncompleta = {
      ...mockReserva,
      nombreCompleto: '',
      telefono: '',
      contactoId: 1,
      documentoCliente: undefined,
    };

    const mockContactoInfo = {
      code: 200,
      message: 'Contacto obtenido',
      data: {
        contactoId: 1,
        nombreCompleto: 'Nombre',
        telefono: '3001234567',
        documentoCliente: undefined,
      },
    };

    component.mostrarFiltros = true;
    component.buscarPorDocumento = false;
    component.buscarPorFecha = true;
    component.fechaReserva = '2025-01-20';

    reservaService.getReservaByParameter.mockReturnValue(
      of({ code: 200, message: 'Reservas obtenidas', data: [mockReservaIncompleta] }),
    );
    reservaContactoService.getById.mockReturnValue(of(mockContactoInfo));

    component.buscarReserva();

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(component.reservas[0].documentoCliente).toBeNull();
  });
});
