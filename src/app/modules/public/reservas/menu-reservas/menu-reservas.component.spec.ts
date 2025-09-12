import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';

import { UserService } from '../../../../core/services/user.service';
import {
  createRouterWithEventsMock,
  createUserServiceMock,
} from '../../../../shared/mocks/test-doubles';
import { MenuReservasComponent } from './menu-reservas.component';

describe('MenuReservasComponent', () => {
  let component: MenuReservasComponent;
  let fixture: ComponentFixture<MenuReservasComponent>;
  let router: jest.Mocked<Router>;
  let userService: jest.Mocked<UserService>;
  let eventsSubject: Subject<any>;

  beforeEach(async () => {
    eventsSubject = new Subject<any>();

    const routerMock = createRouterWithEventsMock(eventsSubject.asObservable(), '/reservas');
    const userServiceMock = createUserServiceMock() as jest.Mocked<UserService>;

    await TestBed.configureTestingModule({
      imports: [MenuReservasComponent, CommonModule],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: UserService, useValue: userServiceMock },
      ],
    }).compileComponents();

    router = TestBed.inject(Router) as jest.Mocked<Router>;
    userService = TestBed.inject(UserService) as jest.Mocked<UserService>;
  });

  const createComponent = () => {
    fixture = TestBed.createComponent(MenuReservasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  it('should create', () => {
    createComponent();
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should set role and esAdmin to true for Administrador and not navigate', () => {
      userService.getUserRole.mockReturnValue('Administrador');
      router.url = '/reservas';
      createComponent();

      expect(component.rol).toBe('Administrador');
      expect(component.esAdmin).toBe(true);
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should set role and esAdmin to false for non-admin and navigate to "crear"', () => {
      userService.getUserRole.mockReturnValue('Cliente');
      router.url = '/reservas';
      createComponent();

      expect(component.rol).toBe('Cliente');
      expect(component.esAdmin).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/reservas/crear']);
    });

    it('should set mostrarMenu to true when currentUrl is "/reservas/"', () => {
      userService.getUserRole.mockReturnValue('Administrador');
      router.url = '/reservas/';
      createComponent();

      expect(component.mostrarMenu).toBe(true);
      expect(router.navigate).not.toHaveBeenCalled();
    });
  });

  describe('router events subscription', () => {
    beforeEach(() => {
      userService.getUserRole.mockReturnValue('Administrador');
      router.url = '/reservas';
      createComponent();
      router.navigate.mockClear();
    });

    it('should set mostrarMenu to true when NavigationEnd event urlAfterRedirects is "/reservas"', () => {
      eventsSubject.next(new NavigationEnd(1, '/reservas', '/reservas'));
      expect(component.mostrarMenu).toBe(true);
    });

    it('should set mostrarMenu to false when NavigationEnd event urlAfterRedirects is not "/reservas"', () => {
      eventsSubject.next(new NavigationEnd(1, '/otraRuta', '/otraRuta'));
      expect(component.mostrarMenu).toBe(false);
    });
  });

  describe('irA and volver methods', () => {
    beforeEach(() => {
      userService.getUserRole.mockReturnValue('Administrador');
      router.url = '/reservas';
      createComponent();
      router.navigate.mockClear();
    });

    it('irA should navigate to the given route under /reservas', () => {
      component.irA('detalle');
      expect(router.navigate).toHaveBeenCalledWith(['/reservas/detalle']);
    });

    it('volver should navigate to /reservas', () => {
      component.volver();
      expect(router.navigate).toHaveBeenCalledWith(['/reservas']);
    });
  });
});
