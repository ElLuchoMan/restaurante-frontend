import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../../core/services/user.service';
import { LoginComponent } from './login.component';
import { of, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let userService: jest.Mocked<UserService>;
  let router: jest.Mocked<Router>;
  let toastr: jest.Mocked<ToastrService>;

  beforeEach(async () => {
    const userServiceMock = {
      login: jest.fn(),
      saveToken: jest.fn(),
      getUserRole: jest.fn()
    } as unknown as jest.Mocked<UserService>;

    const routerMock = {
      navigate: jest.fn()
    } as unknown as jest.Mocked<Router>;

    const toastrMock = {
      success: jest.fn(),
      error: jest.fn()
    } as unknown as jest.Mocked<ToastrService>;

    await TestBed.configureTestingModule({
      imports: [LoginComponent, FormsModule, CommonModule],
      providers: [
        { provide: UserService, useValue: userServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ToastrService, useValue: toastrMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    userService = TestBed.inject(UserService) as jest.Mocked<UserService>;
    router = TestBed.inject(Router) as jest.Mocked<Router>;
    toastr = TestBed.inject(ToastrService) as jest.Mocked<ToastrService>;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call login service with correct credentials', () => {
    const mockResponse = { code: 200, message: 'Success', data: { token: 'testToken', nombre: 'Test User' } };
    userService.login.mockReturnValue(of(mockResponse));

    component.documento = '12345';
    component.password = 'password';
    component.onSubmit();

    expect(userService.login).toHaveBeenCalledWith({ documento: '12345', password: 'password' });
    expect(userService.saveToken).toHaveBeenCalledWith('testToken');
    expect(toastr.success).toHaveBeenCalledWith('Inicio de sesión exitoso', 'Bienvenido Test User');
  });

  it('should navigate to admin route when user role is Administrador', () => {
    const mockResponse = { code: 200, message: 'Success', data: { token: 'testToken', nombre: 'Admin User' } };
    userService.login.mockReturnValue(of(mockResponse));
    userService.getUserRole.mockReturnValue('Administrador');

    component.onSubmit();

    expect(router.navigate).toHaveBeenCalledWith(['/home']);
  });

  it('should navigate to client route when user role is cliente', () => {
    const mockResponse = { code: 200, message: 'Success', data: { token: 'testToken', nombre: 'Client User' } };
    userService.login.mockReturnValue(of(mockResponse));
    userService.getUserRole.mockReturnValue('Cliente');

    component.onSubmit();

    expect(router.navigate).toHaveBeenCalledWith(['/home']);
  });

  it('should handle login error and show toastr error message from service', () => {
    const mockError = { message: 'Error de conexión' };
    userService.login.mockReturnValue(throwError(() => mockError));
  
    component.onSubmit();
  
    expect(toastr.error).toHaveBeenCalledWith('Error de conexión', 'Error de autenticación');
  });
  
  it('should handle login error and show generic toastr error message when message is missing', () => {
    const mockError = {};
    userService.login.mockReturnValue(throwError(() => mockError));
  
    component.onSubmit();
  
    expect(toastr.error).toHaveBeenCalledWith('Credenciales incorrectas', 'Error de autenticación');
  });
});
