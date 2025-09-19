import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ToastrService } from 'ngx-toastr';
import { of, throwError } from 'rxjs';

import { LiveAnnouncerService } from '../../../core/services/live-announcer.service';
import { LoggingService, LogLevel } from '../../../core/services/logging.service';
import { TelemetryService } from '../../../core/services/telemetry.service';
import { UserService } from '../../../core/services/user.service';
import { mockLogin } from '../../../shared/mocks/login.mock';
import {
  createLiveAnnouncerServiceMock,
  createLoggingServiceMock,
  createRouterMock,
  createTelemetryServiceMock,
  createToastrMock,
  createUserServiceMock,
} from '../../../shared/mocks/test-doubles';
import { mockLoginResponse } from './../../../shared/mocks/login.mock';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let userService: jest.Mocked<UserService>;
  let router: jest.Mocked<Router>;
  let toastr: jest.Mocked<ToastrService>;
  let loggingService: jest.Mocked<LoggingService>;
  let telemetry: jest.Mocked<TelemetryService>;
  let liveAnnouncer: jest.Mocked<LiveAnnouncerService>;

  beforeEach(async () => {
    const userServiceMock = createUserServiceMock() as jest.Mocked<UserService>;
    const routerMock = createRouterMock();
    const toastrMock = createToastrMock() as jest.Mocked<ToastrService>;
    const loggingServiceMock = createLoggingServiceMock() as jest.Mocked<LoggingService>;
    const telemetryMock = createTelemetryServiceMock() as jest.Mocked<TelemetryService>;
    const liveAnnouncerMock = createLiveAnnouncerServiceMock() as jest.Mocked<LiveAnnouncerService>;

    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule, CommonModule, RouterTestingModule],
      providers: [
        { provide: UserService, useValue: userServiceMock },
        { provide: ToastrService, useValue: toastrMock },
        { provide: LoggingService, useValue: loggingServiceMock },
        { provide: TelemetryService, useValue: telemetryMock },
        { provide: LiveAnnouncerService, useValue: liveAnnouncerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    userService = TestBed.inject(UserService) as jest.Mocked<UserService>;
    router = TestBed.inject(Router);
    toastr = TestBed.inject(ToastrService) as jest.Mocked<ToastrService>;
    loggingService = TestBed.inject(LoggingService) as jest.Mocked<LoggingService>;
    telemetry = TestBed.inject(TelemetryService) as jest.Mocked<TelemetryService>;
    liveAnnouncer = TestBed.inject(LiveAnnouncerService) as jest.Mocked<LiveAnnouncerService>;

    // Spy on router navigate method
    jest.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call login service with correct credentials and save new tokens', () => {
    userService.login.mockReturnValue(of(mockLoginResponse));

    component.loginForm.setValue(mockLogin);
    component.onSubmit();

    expect(telemetry.logLoginAttempt).toHaveBeenCalled();
    expect(userService.login).toHaveBeenCalledWith(mockLogin);
    expect(userService.saveTokens).toHaveBeenCalledWith('testAccessToken', 'testRefreshToken');
    expect(liveAnnouncer.announce).toHaveBeenCalledWith('Sesión iniciada');
    expect(toastr.success).toHaveBeenCalledWith('Inicio de sesión exitoso', 'Bienvenido Test User');
    expect(telemetry.logLoginSuccess).toHaveBeenCalled();
  });

  it('should fallback to old token format if new tokens are not available', () => {
    const mockOldResponse = {
      ...mockLoginResponse,
      data: {
        token: 'oldToken',
        nombre: 'Test User',
        access_token: undefined,
        refresh_token: undefined,
      },
    };
    userService.login.mockReturnValue(of(mockOldResponse as any));

    component.loginForm.setValue(mockLogin);
    component.onSubmit();

    expect(userService.saveToken).toHaveBeenCalledWith('oldToken');
    expect(userService.saveTokens).not.toHaveBeenCalled();
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

  it('should log telemetry failure on login error', () => {
    userService.login.mockReturnValue(throwError(() => ({ message: 'e' })) as any);

    component.loginForm.setValue(mockLogin);
    component.onSubmit();

    expect(telemetry.logLoginAttempt).toHaveBeenCalled();
    expect(telemetry.logLoginFailure).toHaveBeenCalled();
  });

  it('should early-return when form is invalid and mark all as touched', () => {
    const markSpy = jest.spyOn(component.loginForm, 'markAllAsTouched');
    // Form vacío es inválido
    component.onSubmit();
    expect(markSpy).toHaveBeenCalled();
    expect(userService.login).not.toHaveBeenCalled();
  });

  describe('Remember Me functionality', () => {
    it('should initialize with rememberMe as true', () => {
      expect(component.rememberMe).toBe(true);
    });

    it('should call userService.setRemember on initialization', () => {
      expect(userService.setRemember).toHaveBeenCalledWith(true);
    });

    it('should toggle password visibility', () => {
      expect(component.isPasswordVisible).toBe(false);

      component.togglePasswordVisibility();
      expect(component.isPasswordVisible).toBe(true);

      component.togglePasswordVisibility();
      expect(component.isPasswordVisible).toBe(false);
    });

    it('should handle remember me change event', () => {
      const mockEvent = {
        target: { checked: false },
      } as any;

      component.onRememberChange(mockEvent);

      expect(component.rememberMe).toBe(false);
      expect(userService.setRemember).toHaveBeenCalledWith(false);
      expect(liveAnnouncer.announce).toHaveBeenCalledWith(
        'Sesión se cerrará al cerrar el navegador',
      );
    });

    it('should announce correct message when enabling remember me', () => {
      const mockEvent = {
        target: { checked: true },
      } as any;

      component.rememberMe = false; // Start with false
      component.onRememberChange(mockEvent);

      expect(component.rememberMe).toBe(true);
      expect(userService.setRemember).toHaveBeenCalledWith(true);
      expect(liveAnnouncer.announce).toHaveBeenCalledWith('Sesión se mantendrá activa por 30 días');
    });
  });

  describe('Progress functionality', () => {
    it('should start with 0% progress and button disabled', () => {
      expect(component.progress).toBe('0%');
      expect(component.isButtonEnabled).toBe(false);
    });

    it('should update progress to 50% when document is valid', () => {
      component.loginForm.get('documento')?.setValue('12345');

      // Trigger valueChanges manually since we're not using real form
      component['updateProgress']();

      expect(component.progress).toBe('50%');
      expect(component.isButtonEnabled).toBe(false);
    });

    it('should update progress to 100% and enable button when both fields are valid', (done) => {
      component.loginForm.get('documento')?.setValue('12345');
      component.loginForm.get('password')?.setValue('validpassword');

      component['updateProgress']();

      expect(component.progress).toBe('100%');
      expect(component.isButtonEnabled).toBe(false); // Still false initially

      // Check after timeout
      setTimeout(() => {
        expect(component.isButtonEnabled).toBe(true);
        done();
      }, 500);
    });

    it('should reset progress when fields become invalid', () => {
      // First make it valid
      component.loginForm.get('documento')?.setValue('12345');
      component.loginForm.get('password')?.setValue('validpassword');
      component['updateProgress']();

      // Then make document invalid
      component.loginForm.get('documento')?.setValue('');
      component['updateProgress']();

      expect(component.progress).toBe('0%');
      expect(component.isButtonEnabled).toBe(false);
    });
  });

  describe('Focus states', () => {
    it('should track document input focus state', () => {
      expect(component.documentoFocused).toBe(false);

      component.documentoFocused = true;
      expect(component.documentoFocused).toBe(true);

      component.documentoFocused = false;
      expect(component.documentoFocused).toBe(false);
    });

    it('should track password input focus state', () => {
      expect(component.passwordFocused).toBe(false);

      component.passwordFocused = true;
      expect(component.passwordFocused).toBe(true);

      component.passwordFocused = false;
      expect(component.passwordFocused).toBe(false);
    });
  });
});
