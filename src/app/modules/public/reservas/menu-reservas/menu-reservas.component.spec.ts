import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MenuReservasComponent } from './menu-reservas.component';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { UserService } from '../../../../core/services/user.service';
import { Subject } from 'rxjs';
import { CommonModule } from '@angular/common';

describe('MenuReservasComponent', () => {
  let component: MenuReservasComponent;
  let fixture: ComponentFixture<MenuReservasComponent>;
  let router: jest.Mocked<Router>;
  let userService: jest.Mocked<UserService>;
  let eventsSubject: Subject<any>;

  beforeEach(async () => {
    eventsSubject = new Subject<any>();
    const routerMock = {
      navigate: jest.fn(),
      events: eventsSubject.asObservable()
    } as unknown as jest.Mocked<Router>;

    const userServiceMock = {
      getUserRole: jest.fn()
    } as unknown as jest.Mocked<UserService>;

    await TestBed.configureTestingModule({
      imports: [MenuReservasComponent, CommonModule],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: UserService, useValue: userServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MenuReservasComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router) as jest.Mocked<Router>;
    userService = TestBed.inject(UserService) as jest.Mocked<UserService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should set role and esAdmin to true for Administrador and navigate to "crear"', () => {
      userService.getUserRole.mockReturnValue('Administrador');
      fixture = TestBed.createComponent(MenuReservasComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.rol).toBe('Administrador');
      expect(component.esAdmin).toBe(true);
      expect(router.navigate).toHaveBeenCalled();
    });

    it('should set role and esAdmin to false for non-admin and navigate to "crear"', () => {
      userService.getUserRole.mockReturnValue('Cliente');

      component.ngOnInit();

      expect(component.rol).toBe('Cliente');
      expect(component.esAdmin).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/reservas/crear']);
    });
  });

  describe('router events subscription', () => {
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
