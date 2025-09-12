import { HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { createNextHandlerMock, createUserServiceMock } from '../../shared/mocks/test-doubles';
import { UserService } from '../services/user.service';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let interceptor: HttpInterceptorFn;
  let userService: jest.Mocked<UserService>;

  beforeEach(() => {
    const userServiceMock = createUserServiceMock() as jest.Mocked<UserService>;

    TestBed.configureTestingModule({
      providers: [{ provide: UserService, useValue: userServiceMock }],
    });

    interceptor = (req, next) => TestBed.runInInjectionContext(() => authInterceptor(req, next));
    userService = TestBed.inject(UserService) as jest.Mocked<UserService>;
  });

  it('should add Authorization header if validToken is present', () => {
    const token = 'test-token';
    userService.validateTokenAndLogout.mockReturnValue(token);

    const request = new HttpRequest('GET', '/api/test');
    const next = createNextHandlerMock();

    interceptor(request, next);

    const modifiedRequest = next.mock.calls[0][0];
    expect(modifiedRequest.headers.get('Authorization')).toBe(`Bearer ${token}`);
  });

  it('should not modify request if validToken is not present', () => {
    userService.validateTokenAndLogout.mockReturnValue(null);

    const request = new HttpRequest('GET', '/api/test');
    const next = createNextHandlerMock();

    interceptor(request, next);

    expect(next).toHaveBeenCalledWith(request);
  });
});
