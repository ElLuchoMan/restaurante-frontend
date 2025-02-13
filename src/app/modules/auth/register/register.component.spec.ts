import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { UserService } from '../../../core/services/user.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Trabajador } from '../../../shared/models/trabajador.model';
import { Cliente } from '../../../shared/models/cliente.model';
import { mockClienteBody, mockClienteRegisterResponse } from '../../../shared/mocks/cliente.mock';
import { mockTrabajadorBody, mockTrabajadorRegisterResponse } from '../../../shared/mocks/trabajador.mock';
import { FormatDatePipe } from '../../../shared/pipes/format-date.pipe';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let userService: jest.Mocked<UserService>;
  let toastr: jest.Mocked<ToastrService>;
  let router: jest.Mocked<Router>;

  beforeEach(async () => {
    const userServiceMock = {
      getUserRole: jest.fn(),
      registroCliente: jest.fn(),
      registroTrabajador: jest.fn()
    } as unknown as jest.Mocked<UserService>;

    const toastrMock = {
      success: jest.fn(),
      error: jest.fn()
    } as unknown as jest.Mocked<ToastrService>;

    const routerMock = {
      navigate: jest.fn()
    } as unknown as jest.Mocked<Router>;

    await TestBed.configureTestingModule({
      imports: [RegisterComponent, FormsModule, CommonModule],
      providers: [
        { provide: UserService, useValue: userServiceMock },
        { provide: ToastrService, useValue: toastrMock },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    userService = TestBed.inject(UserService) as jest.Mocked<UserService>;
    toastr = TestBed.inject(ToastrService) as jest.Mocked<ToastrService>;
    router = TestBed.inject(Router) as jest.Mocked<Router>;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return true if user is admin', () => {
    userService.getUserRole.mockReturnValue('Administrador');
    expect(component.isAdmin()).toBe(true);
  });

  it('should return false if user is not admin', () => {
    userService.getUserRole.mockReturnValue('Cliente');
    expect(component.isAdmin()).toBe(false);
  });

  it('should register a client successfully', fakeAsync(() => {
    userService.registroCliente.mockReturnValue(of(mockClienteRegisterResponse));

    component.documento = mockClienteBody.documentoCliente;
    component.nombre = mockClienteBody.nombre;
    component.apellido = mockClienteBody.apellido;
    component.password = mockClienteBody.password;
    component.direccion = mockClienteBody.direccion;
    component.telefono = mockClienteBody.telefono;
    component.observaciones = mockClienteBody.observaciones;

    component.onSubmit();
    tick();

    expect(userService.registroCliente).toHaveBeenCalledWith(mockClienteBody);
    expect(toastr.success).toHaveBeenCalledWith('Cliente registrado con éxito');
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  }));

  it('should register a worker successfully', fakeAsync(() => {
    const formatDatePipe = new FormatDatePipe();

    const formattedFechaIngreso = formatDatePipe.transform(component.fechaIngreso);
    const formattedFechaNacimiento = formatDatePipe.transform(component.fechaNacimiento);

    userService.registroTrabajador.mockReturnValue(of(mockTrabajadorRegisterResponse));

    component.esTrabajador = true;
    component.documento = mockTrabajadorBody.documentoTrabajador;
    component.nombre = mockTrabajadorBody.nombre;
    component.apellido = mockTrabajadorBody.apellido;
    component.password = mockTrabajadorBody.password;
    component.sueldo = mockTrabajadorBody.sueldo;
    component.telefono = mockTrabajadorBody.telefono;
    component.rol = mockTrabajadorBody.rol;
    component.horaEntrada = '08:00';
    component.horaSalida = '20:00';

    component.onSubmit();
    tick();

    expect(userService.registroTrabajador).toHaveBeenCalledWith({
      ...mockTrabajadorBody,
      horario: `${component.horaEntrada} - ${component.horaSalida}`,
      fechaIngreso: formattedFechaIngreso,
      fechaNacimiento: formattedFechaNacimiento,
    });

    expect(toastr.success).toHaveBeenCalledWith(mockTrabajadorRegisterResponse.message);
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  }));

  it('should handle error when registering a client fails', fakeAsync(() => {
    userService.registroCliente.mockReturnValue(throwError(() => ({
      message: 'Error al registrar'
    })));

    component.documento = 12345;
    component.nombre = 'Cliente';
    component.apellido = 'Prueba';
    component.password = 'password';

    component.onSubmit();
    tick();

    expect(toastr.error).toHaveBeenCalledWith('Error al registrar', 'Error');
  }));

  it('should handle error when registering a worker fails', fakeAsync(() => {
    userService.registroTrabajador.mockReturnValue(throwError(() => ({
      message: 'Error al registrar trabajador'
    })));

    component.esTrabajador = true;
    component.documento = 54321;
    component.nombre = 'Trabajador';
    component.apellido = 'Prueba';
    component.password = 'password';
    component.sueldo = 1000000;

    component.onSubmit();
    tick();

    expect(toastr.error).toHaveBeenCalledWith('Error al registrar trabajador', 'Error');
  }));
  it('should show default error message when registering a worker fails and response.message is undefined', fakeAsync(() => {
    const mockErrorResponse = {
      code: 400,
      message: 'failed to fetch',
      data: {} as Trabajador
    };

    userService.registroTrabajador.mockReturnValue(of(mockErrorResponse));

    component.esTrabajador = true;
    component.documento = 54321;
    component.nombre = 'Trabajador';
    component.apellido = 'Prueba';
    component.password = 'password';
    component.sueldo = 1000000;

    component.onSubmit();
    tick();

    expect(toastr.error).toHaveBeenCalledWith('failed to fetch', 'Error');
  }));

  it('should show API error message when registering a client fails', fakeAsync(() => {
    const mockErrorResponse = {
      code: 400,
      message: 'failed to fetch',
      data: {} as Cliente
    };

    userService.registroCliente.mockReturnValue(of(mockErrorResponse));

    component.documento = 12345;
    component.nombre = 'Cliente';
    component.apellido = 'Prueba';
    component.password = 'password';

    component.onSubmit();
    tick();

    expect(toastr.error).toHaveBeenCalledWith('failed to fetch', 'Error');
  }));
  it('should show default error message "Ocurrió un error desconocido" when response.message is empty for worker', fakeAsync(() => {
    const mockErrorResponse = {
      code: 400,
      message: '',
      data: {} as Trabajador
    };

    userService.registroTrabajador.mockReturnValue(of(mockErrorResponse));

    component.esTrabajador = true;
    component.documento = 54321;
    component.nombre = 'Trabajador';
    component.apellido = 'Prueba';
    component.password = 'password';
    component.sueldo = 1000000;

    component.onSubmit();
    tick();

    expect(toastr.error).toHaveBeenCalledWith('Ocurrió un error desconocido', 'Error');
  }));
  it('should show default error message "Ocurrió un error" when response.message is empty for client', fakeAsync(() => {
    const mockErrorResponse = {
      code: 400,
      message: '',
      data: {} as Cliente
    };

    userService.registroCliente.mockReturnValue(of(mockErrorResponse));

    component.documento = 12345;
    component.nombre = 'Cliente';
    component.apellido = 'Prueba';
    component.password = 'password';

    component.onSubmit();
    tick();

    expect(toastr.error).toHaveBeenCalledWith('Ocurrió un error', 'Error');
  }));
});
