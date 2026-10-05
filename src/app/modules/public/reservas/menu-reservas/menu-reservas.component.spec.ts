import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
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
    const activatedRouteMock = {
      snapshot: { data: {} },
      params: new Subject(),
      queryParams: new Subject(),
    };

    await TestBed.configureTestingModule({
      imports: [MenuReservasComponent, CommonModule],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: UserService, useValue: userServiceMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
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

    it('should set mostrarMenu to true when NavigationEnd event urlAfterRedirects is not a subroute', () => {
      eventsSubject.next(new NavigationEnd(1, '/otraRuta', '/otraRuta'));
      // mostrarMenu es true porque '/otraRuta' no contiene /consultar, /hoy, o /crear
      expect(component.mostrarMenu).toBe(true);
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

  describe('ramas adicionales', () => {
    it('ignora eventos de router que no son NavigationEnd', () => {
      userService.getUserRole.mockReturnValue('Administrador');
      router.url = '/reservas';
      createComponent();
      const spy = jest.spyOn(component as any, 'updateState');
      router.url = '/reservas/crear';

      eventsSubject.next({ some: 'otro evento' });

      expect(spy).not.toHaveBeenCalled();
      expect(component.mostrarMenu).toBe(true);
    });

    it('usa basePath admin y oculta el menú en una subruta de /admin/reservas', () => {
      userService.getUserRole.mockReturnValue('Administrador');
      router.url = '/admin/reservas/consultar?x=1';
      createComponent();

      expect(component.basePath).toBe('/admin/reservas');
      expect(component.mostrarMenu).toBe(false);

      component.irA('hoy');
      expect(router.navigate).toHaveBeenCalledWith(['/admin/reservas/hoy']);
      component.volver();
      expect(router.navigate).toHaveBeenCalledWith(['/admin/reservas']);
    });

    it('un no administrador en una subruta no es redirigido', () => {
      userService.getUserRole.mockReturnValue('Cliente');
      router.url = '/reservas/crear';
      createComponent();

      expect(component.mostrarMenu).toBe(false);
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('rol vacío se normaliza a null y se trata como no administrador', () => {
      userService.getUserRole.mockReturnValue('');
      router.url = '/reservas';
      createComponent();

      expect(component.rol).toBeNull();
      expect(component.esAdmin).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/reservas/crear']);
    });

    it('NavigationEnd actualiza basePath al entrar a la zona admin', () => {
      userService.getUserRole.mockReturnValue('Administrador');
      router.url = '/reservas';
      createComponent();

      router.url = '/admin/reservas';
      eventsSubject.next(new NavigationEnd(2, '/admin/reservas', '/admin/reservas'));

      expect(component.basePath).toBe('/admin/reservas');
      expect(component.mostrarMenu).toBe(true);
    });
  });
});
