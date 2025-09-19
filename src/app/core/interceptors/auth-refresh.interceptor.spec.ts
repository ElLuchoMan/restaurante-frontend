import { HttpErrorResponse, HttpRequest, HttpResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { createRouterMock, createUserServiceMock } from '../../shared/mocks/test-doubles';
import { UserService } from '../services/user.service';
import { authRefreshInterceptor } from './auth-refresh.interceptor';

describe('AuthRefreshInterceptor', () => {
  let userService: jest.Mocked<UserService>;
  let router: jest.Mocked<Router>;
  let mockNext: jest.Mock;
  let mockRequest: HttpRequest<any>;

  beforeEach(() => {
    const userServiceMock = createUserServiceMock() as jest.Mocked<UserService>;
    const routerMock = createRouterMock() as jest.Mocked<Router>;

    TestBed.configureTestingModule({
      providers: [
        { provide: UserService, useValue: userServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    });

    userService = TestBed.inject(UserService) as jest.Mocked<UserService>;
    router = TestBed.inject(Router) as jest.Mocked<Router>;

    // Crear mock para next function
    mockNext = userServiceMock.login as jest.Mock; // Reutilizar mock existente
    mockNext.mockClear(); // Limpiar para usar como mockNext

    mockRequest = new HttpRequest('GET', '/api/test');
  });

  it('should pass through successful requests', (done) => {
    const mockResponse = new HttpResponse({ status: 200, body: { data: 'test' } });
    mockNext.mockReturnValue(of(mockResponse));

    const interceptor = authRefreshInterceptor;
    const result = TestBed.runInInjectionContext(() => interceptor(mockRequest, mockNext));

    result.subscribe({
      next: (response) => {
        expect(response).toBe(mockResponse);
        expect(mockNext).toHaveBeenCalledWith(mockRequest);
        done();
      },
    });
  });

  it('should pass through non-401 errors', (done) => {
    const mockError = new HttpErrorResponse({ status: 500, statusText: 'Server Error' });
    mockNext.mockReturnValue(throwError(() => mockError));

    const interceptor = authRefreshInterceptor;
    const result = TestBed.runInInjectionContext(() => interceptor(mockRequest, mockNext));

    result.subscribe({
      error: (error) => {
        expect(error).toBe(mockError);
        expect(userService.attemptTokenRefresh).not.toHaveBeenCalled();
        done();
      },
    });
  });

  it('should pass through 401 errors for login endpoint', (done) => {
    const loginRequest = new HttpRequest('POST', '/api/login');
    const mockError = new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' });
    mockNext.mockReturnValue(throwError(() => mockError));

    const interceptor = authRefreshInterceptor;
    const result = TestBed.runInInjectionContext(() => interceptor(loginRequest, mockNext));

    result.subscribe({
      error: (error) => {
        expect(error).toBe(mockError);
        expect(userService.attemptTokenRefresh).not.toHaveBeenCalled();
        done();
      },
    });
  });

  it('should pass through 401 errors for refresh endpoint', (done) => {
    const refreshRequest = new HttpRequest('POST', '/api/auth/refresh');
    const mockError = new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' });
    mockNext.mockReturnValue(throwError(() => mockError));

    const interceptor = authRefreshInterceptor;
    const result = TestBed.runInInjectionContext(() => interceptor(refreshRequest, mockNext));

    result.subscribe({
      error: (error) => {
        expect(error).toBe(mockError);
        expect(userService.attemptTokenRefresh).not.toHaveBeenCalled();
        done();
      },
    });
  });

  it('should attempt token refresh on 401 error and retry request on success', (done) => {
    const mockError = new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' });
    const mockResponse = new HttpResponse({ status: 200, body: { data: 'test' } });
    const newToken = 'new-access-token';

    mockNext
      .mockReturnValueOnce(throwError(() => mockError)) // Primera llamada falla con 401
      .mockReturnValueOnce(of(mockResponse)); // Segunda llamada (retry) es exitosa

    userService.attemptTokenRefresh.mockReturnValue(of(true));
    userService.getToken.mockReturnValue(newToken);

    const interceptor = authRefreshInterceptor;
    const result = TestBed.runInInjectionContext(() => interceptor(mockRequest, mockNext));

    result.subscribe({
      next: (response) => {
        expect(response).toBe(mockResponse);
        expect(userService.attemptTokenRefresh).toHaveBeenCalled();
        expect(mockNext).toHaveBeenCalledTimes(2);

        // Verificar que la segunda llamada incluye el nuevo token
        const retryRequest = mockNext.mock.calls[1][0] as HttpRequest<any>;
        expect(retryRequest.headers.get('Authorization')).toBe(`Bearer ${newToken}`);
        done();
      },
    });
  });

  it('should redirect to login when token refresh fails', (done) => {
    const mockError = new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' });
    mockNext.mockReturnValue(throwError(() => mockError));
    userService.attemptTokenRefresh.mockReturnValue(of(false));

    const interceptor = authRefreshInterceptor;
    const result = TestBed.runInInjectionContext(() => interceptor(mockRequest, mockNext));

    result.subscribe({
      error: (error) => {
        expect(userService.attemptTokenRefresh).toHaveBeenCalled();
        expect(router.navigate).toHaveBeenCalledWith(['/login']);
        expect(error.message).toBe('Token refresh failed');
        done();
      },
    });
  });

  it('should redirect to login when token refresh throws error', (done) => {
    const mockError = new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' });
    const refreshError = new Error('Refresh failed');

    mockNext.mockReturnValue(throwError(() => mockError));
    userService.attemptTokenRefresh.mockReturnValue(throwError(() => refreshError));

    const interceptor = authRefreshInterceptor;
    const result = TestBed.runInInjectionContext(() => interceptor(mockRequest, mockNext));

    result.subscribe({
      error: (error) => {
        expect(userService.attemptTokenRefresh).toHaveBeenCalled();
        expect(router.navigate).toHaveBeenCalledWith(['/login']);
        expect(error).toBe(refreshError);
        done();
      },
    });
  });

  it('should handle case when no new token is available after refresh', (done) => {
    const mockError = new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' });
    mockNext.mockReturnValue(throwError(() => mockError));
    userService.attemptTokenRefresh.mockReturnValue(of(true));
    userService.getToken.mockReturnValue(null); // No token disponible

    const interceptor = authRefreshInterceptor;
    const result = TestBed.runInInjectionContext(() => interceptor(mockRequest, mockNext));

    result.subscribe({
      error: (error) => {
        expect(userService.attemptTokenRefresh).toHaveBeenCalled();
        expect(router.navigate).toHaveBeenCalledWith(['/login']);
        expect(error.message).toBe('Token refresh failed');
        done();
      },
    });
  });
});
