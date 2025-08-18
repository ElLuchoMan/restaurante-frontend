import { TrabajadorService } from './../../../../core/services/trabajador.service';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CrearReservaComponent } from './crear-reserva.component';
import { ReservaService } from '../../../../core/services/reserva.service';
import { UserService } from '../../../../core/services/user.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { of, throwError } from 'rxjs';
import { estadoReserva } from '../../../../shared/constants';
import { Reserva } from '../../../../shared/models/reserva.model';
import { ApiResponse } from '../../../../shared/models/api-response.model';
import { Cliente } from '../../../../shared/models/cliente.model';
import { Trabajador } from '../../../../shared/models/trabajador.model';
import { mockTrabajadorResponse } from '../../../../shared/mocks/trabajador.mock';
import { mockResponseCliente } from '../../../../shared/mocks/cliente.mock';
import { ClienteService } from '../../../../core/services/cliente.service';
import { LoggingService, LogLevel } from '../../../../core/services/logging.service';

describe('CrearReservaComponent', () => {
  let component: CrearReservaComponent;
  let fixture: ComponentFixture<CrearReservaComponent>;
  let reservaService: jest.Mocked<ReservaService>;
  let userService: jest.Mocked<UserService>;
  let trabajadorService: jest.Mocked<TrabajadorService>;
  let clienteService: jest.Mocked<ClienteService>;
  let toastr: jest.Mocked<ToastrService>;
  let router: jest.Mocked<Router>;
  let loggingService: jest.Mocked<LoggingService>;

  beforeEach(async () => {
    const reservaServiceMock = {
      crearReserva: jest.fn()
    } as unknown as jest.Mocked<ReservaService>;

    const userServiceMock = {
      getUserRole: jest.fn(),
      getUserId: jest.fn(),
      getTrabajadorId: jest.fn(),
      getClienteId: jest.fn()
    } as unknown as jest.Mocked<UserService>;

    const trabajadorServiceMock = {
      getTrabajadorId: jest.fn(),
      getTrabajadorById: jest.fn()
    } as unknown as jest.Mocked<TrabajadorService>;

    const clienteServiceMock = {
      getClienteId: jest.fn(),
      getClienteById: jest.fn()
    } as unknown as jest.Mocked<ClienteService>;

    const toastrMock = {
      success: jest.fn(),
      error: jest.fn()
    } as unknown as jest.Mocked<ToastrService>;

    const routerMock = {
      navigate: jest.fn()
    } as unknown as jest.Mocked<Router>;

    const loggingServiceMock = {
      log: jest.fn()
    } as unknown as jest.Mocked<LoggingService>;

    await TestBed.configureTestingModule({
      imports: [CrearReservaComponent, FormsModule, CommonModule],
      providers: [
        { provide: ReservaService, useValue: reservaServiceMock },
        { provide: UserService, useValue: userServiceMock },
        { provide: TrabajadorService, useValue: trabajadorServiceMock },
        { provide: ClienteService, useValue: clienteServiceMock },
        { provide: ToastrService, useValue: toastrMock },
        { provide: Router, useValue: routerMock },
        { provide: LoggingService, useValue: loggingServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CrearReservaComponent);
    component = fixture.componentInstance;
    reservaService = TestBed.inject(ReservaService) as jest.Mocked<ReservaService>;
    userService = TestBed.inject(UserService) as jest.Mocked<UserService>;
    trabajadorService = TestBed.inject(TrabajadorService) as jest.Mocked<TrabajadorService>;
    clienteService = TestBed.inject(ClienteService) as jest.Mocked<ClienteService>;
    toastr = TestBed.inject(ToastrService) as jest.Mocked<ToastrService>;
    router = TestBed.inject(Router) as jest.Mocked<Router>;
    loggingService = TestBed.inject(LoggingService) as jest.Mocked<LoggingService>;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize role and visibility on ngOnInit', () => {
    userService.getUserRole.mockReturnValue('Cliente');
    component.ngOnInit();
    expect(component.rol).toBe('Cliente');
    expect(component.esAdmin).toBe(false);
    expect(component.mostrarCampo).toBe(false);
  });

  it('should show extra fields when personas is "5+"', () => {
    component.personas = "5+";
    component.checkPersonas();
    expect(component.mostrarInputPersonas).toBe(true);
    expect(component.mostrarInfoEvento).toBe(true);
  });

  it('should hide extra fields when personas is not "5+"', () => {
    component.personas = "4";
    component.checkPersonas();
    expect(component.mostrarInputPersonas).toBe(false);
    expect(component.mostrarInfoEvento).toBe(false);
  });

  describe('onSubmit', () => {
    it('should create reservation for Administrador with successful getTrabajadorId', () => {
      component.rol = 'Administrador';
      userService.getUserId.mockReturnValue(1);
      component.fechaReserva = "2025-02-06";
      component.horaReserva = "10:00";
      component.personas = "3";
      component.indicaciones = "Test admin reservation";
      component.documentoCliente = "0";

      trabajadorService.getTrabajadorId.mockReturnValue(of(mockTrabajadorResponse));
      reservaService.crearReserva.mockReturnValue(
        of({ code: 200, message: 'Reserva creada exitosamente', data: {} as Reserva })
      );

      component.onSubmit();

      expect(trabajadorService.getTrabajadorId).toHaveBeenCalledWith(1);
      expect(component.nombreTrabajador).toBe("Bryan Luis");
      expect(reservaService.crearReserva).toHaveBeenCalledTimes(1);
      expect(toastr.success).toHaveBeenCalledWith('Reserva creada exitosamente', 'Éxito');
      expect(router.navigate).toHaveBeenCalledWith(['/reservas']);
    });

    it('should create reservation for Administrador with error from getTrabajadorId', () => {
      component.rol = 'Administrador';
      userService.getUserId.mockReturnValue(1);
      component.fechaReserva = "2025-02-06";
      component.horaReserva = "10:00";
      component.personas = "3";
      component.indicaciones = "Test admin reservation error";
      component.documentoCliente = "0";

      trabajadorService.getTrabajadorId.mockReturnValue(throwError(() => new Error('error')));
      reservaService.crearReserva.mockReturnValue(
        of({ code: 200, message: 'Reserva creada exitosamente', data: {} as Reserva })
      );

      component.onSubmit();

      expect(trabajadorService.getTrabajadorId).toHaveBeenCalledWith(1);
      expect(component.nombreTrabajador).toBe("Administrador Desconocido");
      expect(reservaService.crearReserva).toHaveBeenCalledTimes(1);
      expect(toastr.success).toHaveBeenCalledWith('Reserva creada exitosamente', 'Éxito');
      expect(router.navigate).toHaveBeenCalledWith(['/reservas']);
    });

    it('should create reservation for Cliente with successful getClienteId', () => {
      component.rol = 'Cliente';
      userService.getUserId.mockReturnValue(2);
      component.fechaReserva = "2025-02-06";
      component.horaReserva = "09:30";
      component.personas = "5+";
      component.personasExtra = 7;
      component.indicaciones = "Test cliente reservation";
      component.documentoCliente = "0";

      clienteService.getClienteId.mockReturnValue(of(mockResponseCliente));
      reservaService.crearReserva.mockReturnValue(
        of({ code: 200, message: 'Reserva creada exitosamente', data: {} as Reserva })
      );

      component.onSubmit();

      expect(clienteService.getClienteId).toHaveBeenCalledWith(2);
      expect(component.nombreCompleto).toBe("Carlos Perez");
      expect(component.telefono).toBe("3216549870");
      expect(reservaService.crearReserva).toHaveBeenCalledTimes(2);
      expect(toastr.success).toHaveBeenCalledWith('Reserva creada exitosamente', 'Éxito');
      expect(router.navigate).toHaveBeenCalledWith(['/reservas']);
    });

    it('should create reservation for Cliente with error from getClienteId', () => {
      component.rol = 'Cliente';
      userService.getUserId.mockReturnValue(2);
      component.fechaReserva = "2025-02-06";
      component.horaReserva = "09:30";
      component.personas = "4";
      component.indicaciones = "Test cliente reservation error";
      component.documentoCliente = "0";

      clienteService.getClienteId.mockReturnValue(throwError(() => new Error('error')));
      reservaService.crearReserva.mockReturnValue(
        of({ code: 200, message: 'Reserva creada exitosamente', data: {} as Reserva })
      );

      component.onSubmit();

      expect(clienteService.getClienteId).toHaveBeenCalledWith(2);
      expect(component.nombreCompleto).toBe("Cliente Desconocido");
      expect(reservaService.crearReserva).toHaveBeenCalledTimes(2);
      expect(toastr.success).toHaveBeenCalledWith('Reserva creada exitosamente', 'Éxito');
      expect(router.navigate).toHaveBeenCalledWith(['/reservas']);
    });

    it('should create reservation for undefined role', () => {
      component.rol = 'Otro';
      userService.getUserId.mockReturnValue(3);
      component.fechaReserva = "2025-02-06";
      component.horaReserva = "08:15";
      component.personas = "2";
      component.indicaciones = "Test undefined role reservation";
      component.documentoCliente = "123456";

      reservaService.crearReserva.mockReturnValue(
        of({ code: 200, message: 'Reserva creada exitosamente', data: {} as Reserva })
      );

      component.onSubmit();

      expect(reservaService.crearReserva).toHaveBeenCalledTimes(1);
      expect(router.navigate).toHaveBeenCalledWith(['/reservas']);
    });

    it('should format fechaReserva and horaReserva correctly', () => {
      component.rol = 'Administrador';
      userService.getUserId.mockReturnValue(1);
      component.fechaReserva = "2025-2-6";
      component.horaReserva = "07:45";
      component.personas = "1";
      component.indicaciones = "Formatting test";
      component.documentoCliente = "0";

      trabajadorService.getTrabajadorId.mockReturnValue(of(mockTrabajadorResponse));
      reservaService.crearReserva.mockReturnValue(
        of({ code: 200, message: 'Reserva creada exitosamente', data: {} as Reserva })
      );

      component.onSubmit();

      const reservaArg = reservaService.crearReserva.mock.calls[0][0] as Reserva;
      expect(reservaArg.fechaReserva).toBe("2025-02-06");
      expect(reservaArg.horaReserva).toBe("07:45:00");
    });

    it('should use personasExtra when personas is "5+"', () => {
      component.rol = 'Administrador';
      userService.getUserId.mockReturnValue(1);
      component.fechaReserva = "2025-02-06";
      component.horaReserva = "11:00";
      component.personas = "5+";
      component.personasExtra = 8;
      component.indicaciones = "Extra persons test";
      component.documentoCliente = "0";

      trabajadorService.getTrabajadorId.mockReturnValue(of(mockTrabajadorResponse));
      reservaService.crearReserva.mockReturnValue(
        of({ code: 200, message: 'Reserva creada exitosamente', data: {} as Reserva })
      );
      component.onSubmit();
      const reservaArg = reservaService.crearReserva.mock.calls[0][0] as Reserva;
      expect(reservaArg.personas).toBe(8);
    });
  });
  it('should call toastr.error when reservation creation fails', () => {
    component.rol = 'Administrador';
    userService.getUserId.mockReturnValue(1);
    component.fechaReserva = "2025-02-06";
    component.horaReserva = "10:00";
    component.personas = "3";
    component.indicaciones = "Test error reservation";
    component.documentoCliente = "0";

    trabajadorService.getTrabajadorId.mockReturnValue(of(mockTrabajadorResponse));
    const errorResponse = new Error("Error creando reserva");
    reservaService.crearReserva.mockReturnValue(throwError(() => errorResponse));

    component.onSubmit();

    expect(trabajadorService.getTrabajadorId).toHaveBeenCalledWith(1);
    expect(loggingService.log).toHaveBeenCalledWith(LogLevel.ERROR, 'Error al crear la reserva', errorResponse);
    expect(toastr.error).toHaveBeenCalledWith("Error creando reserva", 'Error');
    expect(router.navigate).not.toHaveBeenCalled();
  });
  it('should create reservation with "Anónimo" when no user role is provided', () => {
    component.rol = null;
    userService.getUserId.mockReturnValue(0);
    component.fechaReserva = "2025-02-06";
    component.horaReserva = "12:00";
    component.personas = "2";
    component.indicaciones = "Test anonymous reservation";
    component.documentoCliente = "987654321";

    reservaService.crearReserva.mockReturnValue(
      of({ code: 200, message: 'Reserva creada exitosamente', data: {} as Reserva })
    );

    component.onSubmit();

    const reservaArg = reservaService.crearReserva.mock.calls[0][0] as Reserva;
    expect(reservaArg.createdBy).toBe("Anónimo");
    expect(reservaArg.updatedBy).toBe("Anónimo");
    expect(reservaArg.documentoCliente).toBe(987654321);
    expect(router.navigate).toHaveBeenCalledWith(['/reservas']);
  });
  it('should set userId to 0 when getUserId returns null', () => {
    component.rol = 'Otro';
    userService.getUserId.mockReturnValue(null);
    component.fechaReserva = "2025-02-06";
    component.horaReserva = "10:00";
    component.personas = "3";
    component.indicaciones = "Test anonymous role with null userId";
    component.documentoCliente = "123456";

    reservaService.crearReserva.mockReturnValue(
      of({ code: 200, message: 'Reserva creada exitosamente', data: {} as Reserva })
    );

    component.onSubmit();

    expect(component.userId).toBe(0);

    const reservaArg = reservaService.crearReserva.mock.calls[0][0] as Reserva;
    expect(reservaArg.documentoCliente).toBe(123456);
  });

});
