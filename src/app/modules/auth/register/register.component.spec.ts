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
    const mockResponse = {
      code: 201,
      message: 'Cliente registrado con éxito',
      data: {
        documentoCliente: 12345,
        nombre: 'Cliente',
        apellido: 'Prueba',
        password: 'password',
        direccion: '',
        telefono: '',
        observaciones: ''
      }
    };
    userService.registroCliente.mockReturnValue(of(mockResponse));

    component.documento = 12345;
    component.nombre = 'Cliente';
    component.apellido = 'Prueba';
    component.password = 'password';

    component.onSubmit();
    tick();

    expect(userService.registroCliente).toHaveBeenCalledWith({
      documentoCliente: 12345,
      nombre: 'Cliente',
      apellido: 'Prueba',
      password: 'password',
      direccion: '',
      telefono: '',
      observaciones: ''
    });
    expect(toastr.success).toHaveBeenCalledWith('Cliente registrado con éxito');
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  }));

  it('should register a worker successfully', fakeAsync(() => {
    const fechaActual = new Date().toISOString().split('T')[0];

    const mockResponse = {
      code: 201,
      message: 'Trabajador registrado con éxito',
      data: {
        documentoTrabajador: 54321,
        nombre: 'Trabajador',
        apellido: 'Prueba',
        password: 'password',
        restauranteId: 1,
        rol: 'Mesero',
        nuevo: true,
        horario: '9:00 AM - 6:00 PM',
        sueldo: 1000000,
        telefono: '',
        fechaIngreso: fechaActual,
        fechaNacimiento: fechaActual
      }
    };
    userService.registroTrabajador.mockReturnValue(of(mockResponse));

    component.esTrabajador = true;
    component.documento = 54321;
    component.nombre = 'Trabajador';
    component.apellido = 'Prueba';
    component.password = 'password';
    component.sueldo = 1000000;
    component.horaEntrada = '9:00 AM';
    component.horaSalida = '6:00 PM';

    component.onSubmit();
    tick();

    expect(userService.registroTrabajador).toHaveBeenCalledWith({
      documentoTrabajador: 54321,
      nombre: 'Trabajador',
      apellido: 'Prueba',
      password: 'password',
      restauranteId: 1,
      rol: 'Mesero',
      nuevo: true,
      horario: '9:00 AM - 6:00 PM',
      sueldo: 1000000,
      telefono: '',
      fechaIngreso: fechaActual,
      fechaNacimiento: fechaActual
    });
    expect(toastr.success).toHaveBeenCalledWith('Trabajador registrado con éxito');
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
