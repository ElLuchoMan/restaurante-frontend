import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { RoleGuard } from './role.guard';
import { UserService } from '../services/user.service';

describe('RoleGuard', () => {
  let roleGuard: RoleGuard;
  let userService: jest.Mocked<UserService>;
  let router: jest.Mocked<Router>;
  let toastr: jest.Mocked<ToastrService>;

  beforeEach(() => {
    const userServiceMock = {
      getUserRole: jest.fn()
    } as unknown as jest.Mocked<UserService>;

    const routerMock = {
      navigate: jest.fn()
    } as unknown as jest.Mocked<Router>;

    const toastrMock = {
      error: jest.fn()
    } as unknown as jest.Mocked<ToastrService>;

    TestBed.configureTestingModule({
      providers: [
        RoleGuard,
        { provide: UserService, useValue: userServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ToastrService, useValue: toastrMock }
      ]
    });

    roleGuard = TestBed.inject(RoleGuard);
    userService = TestBed.inject(UserService) as jest.Mocked<UserService>;
    router = TestBed.inject(Router) as jest.Mocked<Router>;
    toastr = TestBed.inject(ToastrService) as jest.Mocked<ToastrService>;
  });

  const mockRoute = {
    data: { roles: ['Administrador'] } // Corregido a un array
  } as unknown as ActivatedRouteSnapshot;

  it('should allow access if user has the expected role', () => {
    userService.getUserRole.mockReturnValue('Administrador');

    const result = roleGuard.canActivate(mockRoute);

    expect(result).toBe(true);
    expect(toastr.error).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should deny access and redirect if user does not have the expected role', () => {
    userService.getUserRole.mockReturnValue('cliente');

    const result = roleGuard.canActivate(mockRoute);

    expect(result).toBe(false);
    expect(toastr.error).toHaveBeenCalledWith('No tienes permisos para acceder a esta página', 'Acceso denegado');
    expect(router.navigate).toHaveBeenCalledWith(['/reservas/crear']); // Corregido a la ruta esperada
  });

  it('should deny access and redirect if user has no role', () => {
    userService.getUserRole.mockReturnValue(null); // Simula que el usuario no tiene rol

    const result = roleGuard.canActivate(mockRoute);

    expect(result).toBe(false);
    expect(toastr.error).toHaveBeenCalledWith('No tienes permisos para acceder a esta página', 'Acceso denegado');
    expect(router.navigate).toHaveBeenCalledWith(['/reservas/crear']); // Corregido a la ruta esperada
  });
});
