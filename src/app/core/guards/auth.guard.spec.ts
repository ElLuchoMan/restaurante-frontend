import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { UserService } from '../services/user.service';
import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  let authGuard: AuthGuard;
  let userService: jest.Mocked<UserService>;
  let router: jest.Mocked<Router>;
  let toastr: jest.Mocked<ToastrService>;

  beforeEach(() => {
    const userServiceMock = {
      isLoggedIn: jest.fn(),
      isTokenExpired: jest.fn(),
    } as unknown as jest.Mocked<UserService>;

    const routerMock = {
      navigate: jest.fn(),
    } as unknown as jest.Mocked<Router>;

    const toastrMock = {
      error: jest.fn(),
      clear: jest.fn(),
    } as unknown as jest.Mocked<ToastrService>;

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: UserService, useValue: userServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ToastrService, useValue: toastrMock },
      ],
    });

    authGuard = TestBed.inject(AuthGuard);
    userService = TestBed.inject(UserService) as jest.Mocked<UserService>;
    router = TestBed.inject(Router) as jest.Mocked<Router>;
    toastr = TestBed.inject(ToastrService) as jest.Mocked<ToastrService>;
  });

  it('should be created', () => {
    expect(authGuard).toBeTruthy();
  });

  it('should allow access if user is logged in and token is not expired', () => {
    userService.isLoggedIn.mockReturnValue(true);
    userService.isTokenExpired.mockReturnValue(false);

    const result = authGuard.canActivate();

    expect(result).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
    expect(toastr.error).not.toHaveBeenCalled();
    expect(toastr.clear).not.toHaveBeenCalled();
  });

  it('should deny access and navigate to login without toast if user is not logged in', () => {
    userService.isLoggedIn.mockReturnValue(false);

    const result = authGuard.canActivate();

    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
    expect(toastr.error).not.toHaveBeenCalled();
    expect(toastr.clear).not.toHaveBeenCalled();
    expect(userService.isTokenExpired).not.toHaveBeenCalled();
  });

  it('should deny access, clear toasts and navigate to login if token is expired', () => {
    userService.isLoggedIn.mockReturnValue(true);
    userService.isTokenExpired.mockReturnValue(true);

    const result = authGuard.canActivate();

    expect(result).toBe(false);
    expect(toastr.clear).toHaveBeenCalled();
    expect(toastr.error).toHaveBeenCalledWith(
      'La sesión ha expirado, por favor inicia sesión nuevamente',
      'Sesión expirada',
    );
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
