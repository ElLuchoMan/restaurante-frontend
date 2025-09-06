import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { of, throwError } from 'rxjs';

import { LoggingService, LogLevel } from '../../../core/services/logging.service';
import { UserService } from '../../../core/services/user.service';
import { mockLogin } from '../../../shared/mocks/login.mock';
import { createLoggingServiceMock, createRouterMock, createToastrMock, createUserServiceMock } from '../../../shared/mocks/test-doubles';
import { mockLoginResponse } from './../../../shared/mocks/login.mock';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let userService: jest.Mocked<UserService>;
  let router: jest.Mocked<Router>;
  let toastr: jest.Mocked<ToastrService>;
  let loggingService: jest.Mocked<LoggingService>;

  beforeEach(async () => {
    const userServiceMock = createUserServiceMock() as jest.Mocked<UserService>;
    const routerMock = createRouterMock();
    const toastrMock = createToastrMock() as jest.Mocked<ToastrService>;
    const loggingServiceMock = createLoggingServiceMock() as jest.Mocked<LoggingService>;

    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule, CommonModule],
      providers: [
        { provide: UserService, useValue: userServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ToastrService, useValue: toastrMock },
        { provide: LoggingService, useValue: loggingServiceMock },
      ],
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
    expect(loggingService.log).toHaveBeenCalledWith(
      LogLevel.ERROR,
      'Error de inicio de sesión',
      mockError,
    );
  });

  it('should handle login error and show generic toastr error message when message is missing', () => {
    const mockError = {};
    userService.login.mockReturnValue(throwError(() => mockError));

    component.loginForm.setValue(mockLogin);
    component.onSubmit();

    expect(toastr.error).toHaveBeenCalledWith('Credenciales incorrectas', 'Error de autenticación');
    expect(loggingService.log).toHaveBeenCalledWith(
      LogLevel.ERROR,
      'No hay propiedad "message" en el error.',
    );
  });

  it('should early-return when form is invalid and mark all as touched', () => {
    const markSpy = jest.spyOn(component.loginForm, 'markAllAsTouched');
    // Form vacío es inválido
    component.onSubmit();
    expect(markSpy).toHaveBeenCalled();
    expect(userService.login).not.toHaveBeenCalled();
  });
});
