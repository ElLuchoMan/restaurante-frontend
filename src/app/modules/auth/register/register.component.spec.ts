import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { of, throwError } from 'rxjs';

import { UserService } from '../../../core/services/user.service';
import { mockClienteBody, mockClienteRegisterResponse } from '../../../shared/mocks/cliente.mock';
import { createClienteServiceMock, createRouterMock, createToastrMock, createTrabajadorServiceMock, createUserServiceMock } from '../../../shared/mocks/test-doubles';
import {
    mockTrabajadorBody,
    mockTrabajadorRegisterResponse,
} from '../../../shared/mocks/trabajador.mock';
import { Cliente } from '../../../shared/models/cliente.model';
import { Trabajador } from '../../../shared/models/trabajador.model';
import { FormatDatePipe } from '../../../shared/pipes/format-date.pipe';
import { ClienteService } from './../../../core/services/cliente.service';
import { TrabajadorService } from './../../../core/services/trabajador.service';
import { RegisterComponent } from './register.component';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let userService: jest.Mocked<UserService>;
  let trabajadorService: jest.Mocked<TrabajadorService>;
  let clienteService: jest.Mocked<ClienteService>;
  let toastr: jest.Mocked<ToastrService>;
  let router: jest.Mocked<Router>;

  beforeEach(async () => {
    const userServiceMock = createUserServiceMock() as jest.Mocked<UserService>;
    const trabajadorServiceMock = createTrabajadorServiceMock() as jest.Mocked<TrabajadorService>;
    const clienteServiceMock = createClienteServiceMock() as jest.Mocked<ClienteService>;
    const toastrMock = createToastrMock() as jest.Mocked<ToastrService>;
    const routerMock = createRouterMock();
    await TestBed.configureTestingModule({
      imports: [RegisterComponent, ReactiveFormsModule, CommonModule, HttpClientTestingModule],
      providers: [
        { provide: UserService, useValue: userServiceMock },
        { provide: TrabajadorService, useValue: trabajadorServiceMock },
        { provide: ClienteService, useValue: clienteServiceMock },
        { provide: ToastrService, useValue: toastrMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    userService = TestBed.inject(UserService) as jest.Mocked<UserService>;
    trabajadorService = TestBed.inject(TrabajadorService) as jest.Mocked<TrabajadorService>;
    clienteService = TestBed.inject(ClienteService) as jest.Mocked<ClienteService>;
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
    clienteService.registroCliente.mockReturnValue(of(mockClienteRegisterResponse));

    component.registerForm.patchValue({
      documento: mockClienteBody.documentoCliente.toString(),
      nombre: mockClienteBody.nombre,
      apellido: mockClienteBody.apellido,
      password: mockClienteBody.password,
      direccion: mockClienteBody.direccion,
      telefono: mockClienteBody.telefono,
      observaciones: mockClienteBody.observaciones,
      correo: 'test@example.com',
    });

    component.onSubmit();
    tick();

    expect(clienteService.registroCliente).toHaveBeenCalledWith(
      expect.objectContaining({ ...mockClienteBody, correo: 'test@example.com' }),
    );
    expect(toastr.success).toHaveBeenCalledWith('Cliente registrado con éxito');
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  }));

  it('should register a worker successfully', fakeAsync(() => {
    const formatDatePipe = new FormatDatePipe();

    const formattedFechaIngreso = formatDatePipe.transform(new Date());
    const formattedFechaNacimiento = formatDatePipe.transform(new Date('1990-01-01'));

    trabajadorService.registroTrabajador.mockReturnValue(of(mockTrabajadorRegisterResponse));

    component.registerForm.patchValue({
      esTrabajador: true,
      documento: mockTrabajadorBody.documentoTrabajador.toString(),
      nombre: mockTrabajadorBody.nombre,
      apellido: mockTrabajadorBody.apellido,
      password: mockTrabajadorBody.password,
      sueldo: mockTrabajadorBody.sueldo,
      telefono: mockTrabajadorBody.telefono,
      rol: mockTrabajadorBody.rol,
      horaEntrada: '08:00',
      horaSalida: '20:00',
      fechaNacimiento: '1990-01-01',
    });

    component.onSubmit();
    tick();

    expect(trabajadorService.registroTrabajador).toHaveBeenCalledWith({
      ...mockTrabajadorBody,
      horario: '08:00 - 20:00',
      fechaIngreso: formattedFechaIngreso,
      fechaNacimiento: formattedFechaNacimiento,
    });

    expect(toastr.success).toHaveBeenCalledWith(mockTrabajadorRegisterResponse.message);
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  }));

  it('should handle error when registering a client fails', fakeAsync(() => {
    clienteService.registroCliente.mockReturnValue(
      throwError(() => ({
        message: 'Error al registrar',
      })),
    );

    component.registerForm.patchValue({
      documento: '12345',
      nombre: 'Cliente',
      apellido: 'Prueba',
      password: 'password',
      direccion: 'Dir',
      telefono: '123',
      correo: 'a@a.com',
    });

    component.onSubmit();
    tick();

    expect(toastr.error).toHaveBeenCalledWith('Error al registrar', 'Error');
  }));

  it('should handle error when registering a worker fails', fakeAsync(() => {
    trabajadorService.registroTrabajador.mockReturnValue(
      throwError(() => ({
        message: 'Error al registrar trabajador',
      })),
    );

    component.registerForm.patchValue({
      esTrabajador: true,
      documento: '54321',
      nombre: 'Trabajador',
      apellido: 'Prueba',
      password: 'password',
      sueldo: 1000000,
      telefono: '123',
      rol: 'Mesero',
      horaEntrada: '08:00',
      horaSalida: '20:00',
      fechaNacimiento: '1990-01-01',
    });

    component.onSubmit();
    tick();

    expect(toastr.error).toHaveBeenCalledWith('Error al registrar trabajador', 'Error');
  }));
  it('should show default error message when registering a worker fails and response.message is undefined', fakeAsync(() => {
    const mockErrorResponse = {
      code: 400,
      message: 'failed to fetch',
      data: {} as Trabajador,
    };

    trabajadorService.registroTrabajador.mockReturnValue(of(mockErrorResponse));

    component.registerForm.patchValue({
      esTrabajador: true,
      documento: '54321',
      nombre: 'Trabajador',
      apellido: 'Prueba',
      password: 'password',
      sueldo: 1000000,
      telefono: '123',
      rol: 'Mesero',
      horaEntrada: '08:00',
      horaSalida: '20:00',
      fechaNacimiento: '1990-01-01',
    });

    component.onSubmit();
    tick();

    expect(toastr.error).toHaveBeenCalledWith('failed to fetch', 'Error');
  }));

  it('should show API error message when registering a client fails', fakeAsync(() => {
    const mockErrorResponse = {
      code: 400,
      message: 'failed to fetch',
      data: {} as Cliente,
    };

    clienteService.registroCliente.mockReturnValue(of(mockErrorResponse));

    component.registerForm.patchValue({
      documento: '12345',
      nombre: 'Cliente',
      apellido: 'Prueba',
      password: 'password',
      direccion: 'Dir',
      telefono: '123',
      correo: 'a@a.com',
    });

    component.onSubmit();
    tick();

    expect(toastr.error).toHaveBeenCalledWith('failed to fetch', 'Error');
  }));
  it('should show default error message "Ocurrió un error desconocido" when response.message is empty for worker', fakeAsync(() => {
    const mockErrorResponse = {
      code: 400,
      message: '',
      data: {} as Trabajador,
    };

    trabajadorService.registroTrabajador.mockReturnValue(of(mockErrorResponse));

    component.registerForm.patchValue({
      esTrabajador: true,
      documento: '54321',
      nombre: 'Trabajador',
      apellido: 'Prueba',
      password: 'password',
      sueldo: 1000000,
      telefono: '123',
      rol: 'Mesero',
      horaEntrada: '08:00',
      horaSalida: '20:00',
      fechaNacimiento: '1990-01-01',
    });

    component.onSubmit();
    tick();

    expect(toastr.error).toHaveBeenCalledWith('Ocurrió un error desconocido', 'Error');
  }));
  it('should show default error message "Ocurrió un error" when response.message is empty for client', fakeAsync(() => {
    const mockErrorResponse = {
      code: 400,
      message: '',
      data: {} as Cliente,
    };

    clienteService.registroCliente.mockReturnValue(of(mockErrorResponse));

    component.registerForm.patchValue({
      documento: '12345',
      nombre: 'Cliente',
      apellido: 'Prueba',
      password: 'password',
      direccion: 'Dir',
      telefono: '123',
      correo: 'a@a.com',
    });

    component.onSubmit();
    tick();

    expect(toastr.error).toHaveBeenCalledWith('Ocurrió un error', 'Error');
  }));

  it('should use default role "Mesero" when worker rol is empty', fakeAsync(() => {
    trabajadorService.registroTrabajador.mockReturnValue(of(mockTrabajadorRegisterResponse));

    component.registerForm.patchValue({
      esTrabajador: true,
      documento: '11111',
      nombre: 'T',
      apellido: 'X',
      password: 'p',
      sueldo: 1000,
      telefono: '123',
      rol: '',
      horaEntrada: '08:00',
      horaSalida: '20:00',
      fechaNacimiento: '1990-01-01',
    });

    component.onSubmit();
    tick();

    expect(trabajadorService.registroTrabajador).toHaveBeenCalledWith(
      expect.objectContaining({ rol: 'Mesero' }),
    );
  }));

  it('should toggle validators when esTrabajador changes', fakeAsync(() => {
    // Inicialmente no trabajador: direccion y correo requeridos
    component.registerForm.patchValue({
      direccion: '',
      correo: '',
      fechaNacimiento: '',
      sueldo: null,
      rol: '',
      horaEntrada: '',
      horaSalida: '',
    } as any);
    component.registerForm.updateValueAndValidity();
    expect(component.registerForm.get('direccion')?.hasError('required')).toBe(true);
    expect(component.registerForm.get('correo')?.hasError('required')).toBe(true);

    // Cambia a trabajador: direccion/correo dejan de ser requeridos; otros se vuelven requeridos
    component.registerForm.get('esTrabajador')?.setValue(true);
    tick();
    component.registerForm.updateValueAndValidity();
    expect(component.registerForm.get('direccion')?.hasError('required')).toBe(false);
    expect(component.registerForm.get('correo')?.hasError('required')).toBe(false);
    expect(component.registerForm.get('fechaNacimiento')?.hasError('required')).toBe(true);
    expect(component.registerForm.get('sueldo')?.hasError('required')).toBe(true);
    expect(component.registerForm.get('rol')?.hasError('required')).toBe(true);
    expect(component.registerForm.get('horaEntrada')?.hasError('required')).toBe(true);
    expect(component.registerForm.get('horaSalida')?.hasError('required')).toBe(true);

    // Vuelve a no trabajador: se restauran requeridos
    component.registerForm.get('esTrabajador')?.setValue(false);
    tick();
    component.registerForm.updateValueAndValidity();
    expect(component.registerForm.get('direccion')?.hasError('required')).toBe(true);
    expect(component.registerForm.get('correo')?.hasError('required')).toBe(true);
    expect(component.registerForm.get('fechaNacimiento')?.hasError('required')).toBe(false);
  }));
});
