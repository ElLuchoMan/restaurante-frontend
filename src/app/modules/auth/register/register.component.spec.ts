import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { UserService } from '../../../core/services/user.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

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

  it('should register a client successfully', () => {
    const mockResponse = {
      code: 200,
      message: 'Cliente registrado',
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
    userService.registroCliente.mockReturnValue(of(mockResponse)); // Devuelve un ApiResponse<Cliente>

    component.documento = 12345;
    component.nombre = 'Cliente';
    component.apellido = 'Prueba';
    component.password = 'password';

    component.onSubmit();

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
  });

  it('should register a worker successfully', () => {
    const mockResponse = {
      code: 200,
      message: 'Trabajador registrado',
      data: {
        documentoTrabajador: 54321,
        nombre: 'Trabajador',
        apellido: 'Prueba',
        password: 'password',
        restauranteId: 1,
        rol: 'Empleado',
        nuevo: true,
        horario: '9:00 AM - 6:00 PM',
        sueldo: 1000000,
        telefono: '',
        fechaIngreso: new Date(),
        fechaNacimiento: new Date()
      }
    };
    userService.registroTrabajador.mockReturnValue(of(mockResponse)); // Devuelve un ApiResponse<Trabajador>

    component.esTrabajador = true;
    component.documento = 54321;
    component.nombre = 'Trabajador';
    component.apellido = 'Prueba';
    component.password = 'password';
    component.sueldo = 1000000;

    component.onSubmit();

    expect(userService.registroTrabajador).toHaveBeenCalledWith({
      documentoTrabajador: 54321,
      nombre: 'Trabajador',
      apellido: 'Prueba',
      password: 'password',
      restauranteId: 1,
      rol: 'Empleado',
      nuevo: true,
      horario: '9:00 AM - 6:00 PM',
      sueldo: 1000000,
      telefono: '',
      fechaIngreso: expect.any(Date),
      fechaNacimiento: expect.any(Date)
    });
    expect(toastr.success).toHaveBeenCalledWith('Trabajador registrado con éxito');
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });


  it('should handle error when registering a client fails', () => {
    userService.registroCliente.mockReturnValue(throwError(() => ({ message: 'Error al registrar' })));
    component.documento = 12345;
    component.nombre = 'Cliente';
    component.apellido = 'Prueba';
    component.password = 'password';

    component.onSubmit();

    expect(toastr.error).toHaveBeenCalledWith('Error al registrar', 'Error');
  });
  it('should handle error when registering a worker fails', () => {
    // Simular un error en registroTrabajador
    userService.registroTrabajador.mockReturnValue(throwError(() => ({ message: 'Error al registrar trabajador' })));

    // Configurar los datos como trabajador
    component.esTrabajador = true;
    component.documento = 54321;
    component.nombre = 'Trabajador';
    component.apellido = 'Prueba';
    component.password = 'password';
    component.sueldo = 1000000;

    // Llamar al método onSubmit
    component.onSubmit();

    // Verificar que toastr.error se haya llamado correctamente
    expect(toastr.error).toHaveBeenCalledWith('Error al registrar trabajador', 'Error');
  });


});
