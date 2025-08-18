import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { UserService } from './user.service';
import { environment } from '../../../environments/environment';
import { HandleErrorService } from './handle-error.service';
import { ApiResponse } from '../../shared/models/api-response.model';
import { mockLoginResponse } from '../../shared/mocks/login.mock';

describe('UserService', () => {
  let service: UserService;
  let httpTestingController: HttpTestingController;

  const mockHandleErrorService = {
    handleError: jest.fn((error: any) => {
      throw error;
    }),
  };

  const clearAuthCookie = () => {
    document.cookie =
      'auth_token=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        UserService,
        { provide: HandleErrorService, useValue: mockHandleErrorService },
      ],
    });

    service = TestBed.inject(UserService);
    httpTestingController = TestBed.inject(HttpTestingController);
    clearAuthCookie();
  });

  afterEach(() => {
    httpTestingController.verify();
    clearAuthCookie();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should send login request with credentials', () => {
    const credentials = { documento: '123', password: 'password' };

    service.login(credentials).subscribe((response: ApiResponse<any>) => {
      expect(response).toEqual(mockLoginResponse);
    });

    const req = httpTestingController.expectOne(`${environment.apiUrl}/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.withCredentials).toBe(true);
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

  it('should get token from cookies', () => {
    document.cookie = 'auth_token=testToken';
    expect(service.getToken()).toBe('testToken');
  });

  it('should return true for isLoggedIn if token exists', () => {
    document.cookie = 'auth_token=testToken';
    expect(service.isLoggedIn()).toBe(true);
  });

  it('should return false for isLoggedIn if token does not exist', () => {
    clearAuthCookie();
    expect(service.isLoggedIn()).toBe(false);
  });

  it('should decode token correctly', () => {
    const tokenPayload = {
      rol: 'Administrador',
      documento: 1,
      exp: Math.floor(Date.now() / 1000) + 1000,
    };
    const encodedPayload = btoa(JSON.stringify(tokenPayload));
    document.cookie = `auth_token=header.${encodedPayload}.signature`;
    const decoded = service.decodeToken();
    expect(decoded).toEqual({
      rol: 'Administrador',
      documento: expect.any(Number),
      exp: expect.any(Number),
    });
  });

  it('should log an error and return null if token decoding fails', () => {
    document.cookie = 'auth_token=invalid.token.value';
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const result = service.decodeToken();
    expect(consoleSpy).toHaveBeenCalled();
    expect(result).toBe(null);
    consoleSpy.mockRestore();
  });

  it('should return null if no token is found', () => {
    clearAuthCookie();
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
    const expiredTokenPayload = {
      exp: Math.floor(Date.now() / 1000) - 1000,
    };
    const encodedPayload = btoa(JSON.stringify(expiredTokenPayload));
    document.cookie = `auth_token=header.${encodedPayload}.signature`;
    expect(service.isTokenExpired()).toBe(true);
  });

  it('should identify valid token', () => {
    const validTokenPayload = {
      exp: Math.floor(Date.now() / 1000) + 1000,
    };
    const encodedPayload = btoa(JSON.stringify(validTokenPayload));
    document.cookie = `auth_token=header.${encodedPayload}.signature`;
    expect(service.isTokenExpired()).toBe(false);
  });

  it('should return true if decodeToken returns null for token expiry', () => {
    jest.spyOn(service, 'decodeToken').mockReturnValue(null);
    const result = service.isTokenExpired();
    expect(result).toBe(true);
  });

  it('should return true if decoded token does not have exp property', () => {
    const decodedToken: any = { rol: 'Usuario', documento: 1 };
    jest.spyOn(service, 'decodeToken').mockReturnValue(decodedToken);
    const result = service.isTokenExpired();
    expect(result).toBe(true);
  });

  it('should send logout request', () => {
    service.logout();
    const req = httpTestingController.expectOne(`${environment.apiUrl}/logout`);
    expect(req.request.method).toBe('POST');
    expect(req.request.withCredentials).toBe(true);
    req.flush({});
  });

  it('should call logout if token is expired in validateTokenAndLogout', () => {
    const expiredPayload = {
      rol: 'Cliente',
      documento: 123,
      exp: Math.floor(Date.now() / 1000) - 10,
    };
    const encodedPayload = btoa(JSON.stringify(expiredPayload));
    document.cookie = `auth_token=header.${encodedPayload}.signature`;
    const logoutSpy = jest
      .spyOn(service, 'logout')
      .mockImplementation(() => {});
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
    document.cookie = `auth_token=header.${encodedPayload}.signature`;
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

