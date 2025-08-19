import { mockLoginResponse } from './../../../shared/mocks/login.mock';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../../core/services/user.service';
import { LoginComponent } from './login.component';
import { of, throwError } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { mockLogin } from '../../../shared/mocks/login.mock';
import { LoggingService, LogLevel } from '../../../core/services/logging.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let userService: jest.Mocked<UserService>;
  let router: jest.Mocked<Router>;
  let toastr: jest.Mocked<ToastrService>;
  let loggingService: jest.Mocked<LoggingService>;

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

    const loggingServiceMock = {
      log: jest.fn()
    } as unknown as jest.Mocked<LoggingService>;

    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule, CommonModule],
      providers: [
        { provide: UserService, useValue: userServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ToastrService, useValue: toastrMock },
        { provide: LoggingService, useValue: loggingServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    userService = TestBed.inject(UserService) as jest.Mocked<UserService>;
    router = TestBed.inject(Router) as jest.Mocked<Router>;
    toastr = TestBed.inject(ToastrService) as jest.Mocked<ToastrService>;
    loggingService = TestBed.inject(LoggingService) as jest.Mocked<LoggingService>;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

    it('should call login service with correct credentials', () => {
      userService.login.mockReturnValue(of(mockLoginResponse));

      component.loginForm.setValue(mockLogin);
      component.onSubmit();

      expect(userService.login).toHaveBeenCalledWith(mockLogin);
      expect(userService.saveToken).toHaveBeenCalledWith('testToken');
      expect(toastr.success).toHaveBeenCalledWith('Inicio de sesión exitoso', 'Bienvenido Test User');
    });

    it('should navigate to admin route when user role is Administrador', () => {
      userService.login.mockReturnValue(of(mockLoginResponse));
      userService.getUserRole.mockReturnValue('Administrador');

      component.loginForm.setValue(mockLogin);
      component.onSubmit();

      expect(router.navigate).toHaveBeenCalledWith(['/home']);
    });

    it('should navigate to client route when user role is cliente', () => {
      userService.login.mockReturnValue(of(mockLoginResponse));
      userService.getUserRole.mockReturnValue('Cliente');

      component.loginForm.setValue(mockLogin);
      component.onSubmit();

      expect(router.navigate).toHaveBeenCalledWith(['/home']);
    });

    it('should handle login error and show toastr error message from service', () => {
      const mockError = { message: 'Error de conexión' };
      userService.login.mockReturnValue(throwError(() => mockError));

      component.loginForm.setValue(mockLogin);
      component.onSubmit();

      expect(toastr.error).toHaveBeenCalledWith('Error de conexión', 'Error de autenticación');
      expect(loggingService.log).toHaveBeenCalledWith(LogLevel.ERROR, 'Error de inicio de sesión', mockError);
    });

    it('should handle login error and show generic toastr error message when message is missing', () => {
      const mockError = {};
      userService.login.mockReturnValue(throwError(() => mockError));

      component.loginForm.setValue(mockLogin);
      component.onSubmit();

      expect(toastr.error).toHaveBeenCalledWith('Credenciales incorrectas', 'Error de autenticación');
      expect(loggingService.log).toHaveBeenCalledWith(LogLevel.ERROR, 'No hay propiedad "message" en el error.');
    });
});
