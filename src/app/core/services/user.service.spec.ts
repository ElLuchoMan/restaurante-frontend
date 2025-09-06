import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { mockLoginResponse } from '../../shared/mocks/login.mock';
import { createHandleErrorServiceMock, createLoggingServiceMock } from '../../shared/mocks/test-doubles';
import { ApiResponse } from '../../shared/models/api-response.model';
import { HandleErrorService } from './handle-error.service';
import { LoggingService, LogLevel } from './logging.service';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let httpTestingController: HttpTestingController;

  const mockHandleErrorService = createHandleErrorServiceMock();
  const mockLoggingService = createLoggingServiceMock();

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        UserService,
        { provide: HandleErrorService, useValue: mockHandleErrorService },
        { provide: LoggingService, useValue: mockLoggingService },
      ],
    });

    service = TestBed.inject(UserService);
    httpTestingController = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpTestingController.verify();
    localStorage.clear();
    mockHandleErrorService.handleError.mockReset();
    mockLoggingService.log.mockReset();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should send login request and return response', () => {
    const credentials = { documento: '123', password: 'password' };

    service.login(credentials).subscribe((response: ApiResponse<any>) => {
      expect(response).toEqual(mockLoginResponse);
    });

    const req = httpTestingController.expectOne(`${environment.apiUrl}/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(credentials);
    req.flush(mockLoginResponse);
  });

  it('should handle error on login request', () => {
    const credentials = { documento: '123', password: 'password' };

    service.login(credentials).subscribe({
      error: (error) => {
        expect(error).toBeTruthy();
      },
    });

    const req = httpTestingController.expectOne(`${environment.apiUrl}/login`);
    req.error(new ErrorEvent('Network error'));
    expect(mockHandleErrorService.handleError).toHaveBeenCalled();
  });

  it('should save token to localStorage and emit true on auth state', (done) => {
    service.getAuthState().subscribe((state: boolean) => {
      if (state) {
        expect(state).toBe(true);
        done();
      }
    });
    service.saveToken('testToken');
    expect(localStorage.getItem('auth_token')).toBe('testToken');
  });

  it('should get token from localStorage', () => {
    const token = 'testToken';
    localStorage.setItem('auth_token', token);
    expect(service.getToken()).toBe(token);
  });

  it('should return null if window is undefined', () => {
    const originalWindow = globalThis.window;
    delete (globalThis as any).window;
    const token = service.getToken();
    expect(token).toBe(null);
    globalThis.window = originalWindow;
  });

  it('should return true for isLoggedIn if token exists', () => {
    localStorage.setItem('auth_token', 'testToken');
    expect(service.isLoggedIn()).toBe(true);
  });

  it('should return false for isLoggedIn if token does not exist', () => {
    localStorage.removeItem('auth_token');
    expect(service.isLoggedIn()).toBe(false);
  });

  it('should decode token correctly', () => {
    const tokenPayload = {
      rol: 'Administrador',
      documento: 1,
      exp: Math.floor(Date.now() / 1000) + 1000,
    };
    const encodedPayload = btoa(JSON.stringify(tokenPayload));
    localStorage.setItem('auth_token', `header.${encodedPayload}.signature`);
    const decoded = service.decodeToken();
    expect(decoded).toEqual(tokenPayload);
  });

  it('should log an error and return null if token decoding fails', () => {
    const invalidToken = 'invalid.token.value';
    jest.spyOn(service, 'getToken').mockReturnValue(invalidToken);
    const result = service.decodeToken();
    expect(mockLoggingService.log).toHaveBeenCalledWith(
      LogLevel.ERROR,
      'Error al decodificar el token',
      expect.any(Error),
    );
    expect(result).toBe(null);
  });

  it('should return null if no token is found', () => {
    jest.spyOn(service, 'getToken').mockReturnValue(null);
    const result = service.decodeToken();
    expect(result).toBe(null);
  });

  it('should return user role if token is valid', () => {
    const decodedToken = {
      rol: 'Administrador',
      documento: 1,
      exp: Math.floor(Date.now() / 1000) + 1000,
    };
    jest.spyOn(service, 'decodeToken').mockReturnValue(decodedToken);
    const result = service.getUserRole();
    expect(result).toBe('Administrador');
  });

  it('should return null if token is invalid for user role', () => {
    jest.spyOn(service, 'decodeToken').mockReturnValue(null);
    const result = service.getUserRole();
    expect(result).toBe(null);
  });

  it('should identify expired token', () => {
    const expiredTokenPayload = { exp: Math.floor(Date.now() / 1000) - 1000 };
    const encodedPayload = btoa(JSON.stringify(expiredTokenPayload));
    localStorage.setItem('auth_token', `header.${encodedPayload}.signature`);
    expect(service.isTokenExpired()).toBe(true);
  });

  it('should identify valid token', () => {
    const validTokenPayload = { exp: Math.floor(Date.now() / 1000) + 1000 };
    const encodedPayload = btoa(JSON.stringify(validTokenPayload));
    localStorage.setItem('auth_token', `header.${encodedPayload}.signature`);
    expect(service.isTokenExpired()).toBe(false);
  });

  it('should treat malformed token as expired', () => {
    localStorage.setItem('auth_token', 'invalid.token.value');
    const result = service.isTokenExpired();
    expect(result).toBe(true);
    expect(mockLoggingService.log).toHaveBeenCalledWith(
      LogLevel.ERROR,
      'Error al decodificar el token',
      expect.any(Error),
    );
  });

  it('should return false if token does not exist for token expiry', () => {
    localStorage.removeItem('auth_token');
    const result = service.isTokenExpired();
    expect(result).toBe(false);
  });

  it('should return true if decodeTokenSafely returns null for token expiry', () => {
    localStorage.setItem('auth_token', 'testToken');
    jest.spyOn<any>(service, 'decodeTokenSafely').mockReturnValue(null);
    const result = service.isTokenExpired();
    expect(result).toBe(true);
  });

  it('should return true if decoded token does not have exp property', () => {
    const decodedToken: any = { rol: 'Usuario', documento: 1 };
    jest.spyOn(service, 'decodeToken').mockReturnValue(decodedToken);
    const result = service.isTokenExpired();
    expect(result).toBe(true);
  });

  it('should remove token on logout', () => {
    localStorage.setItem('auth_token', 'testToken');
    service.logout();
    expect(localStorage.getItem('auth_token')).toBeNull();
  });

  it('should call logout if token is expired in validateTokenAndLogout', () => {
    const expiredPayload = {
      rol: 'Cliente',
      documento: 123,
      exp: Math.floor(Date.now() / 1000) - 10,
    };
    const encodedPayload = btoa(JSON.stringify(expiredPayload));
    localStorage.setItem('auth_token', `header.${encodedPayload}.signature`);
    const logoutSpy = jest.spyOn(service, 'logout');
    service.validateTokenAndLogout();
    expect(logoutSpy).toHaveBeenCalled();
  });

  it('should not call logout if token is valid in validateTokenAndLogout', () => {
    const validPayload = {
      rol: 'Cliente',
      documento: 123,
      exp: Math.floor(Date.now() / 1000) + 3600,
    };
    const encodedPayload = btoa(JSON.stringify(validPayload));
    localStorage.setItem('auth_token', `header.${encodedPayload}.signature`);
    const logoutSpy = jest.spyOn(service, 'logout');
    service.validateTokenAndLogout();
    expect(logoutSpy).not.toHaveBeenCalled();
  });

  it('should allow subscription to auth state and emit false when not logged in', (done) => {
    service.getAuthState().subscribe((state: boolean) => {
      expect(state).toBe(false);
      done();
    });
  });

  it('should return user id if token is valid', () => {
    const decodedToken = {
      rol: 'Cliente',
      documento: 12345,
      exp: Math.floor(Date.now() / 1000) + 1000,
    };
    jest.spyOn(service, 'decodeToken').mockReturnValue(decodedToken);
    const result = service.getUserId();
    expect(result).toBe(12345);
  });

  it('should return 0 for user id if token is invalid', () => {
    jest.spyOn(service, 'decodeToken').mockReturnValue(null);
    const result = service.getUserId();
    expect(result).toBe(0);
  });
});
