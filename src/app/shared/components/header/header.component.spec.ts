import { PLATFORM_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject } from 'rxjs';

import { CartService } from '../../../core/services/cart.service';
import { LiveAnnouncerService } from '../../../core/services/live-announcer.service';
import { NetworkService } from '../../../core/services/network.service';
import { UserService } from '../../../core/services/user.service';
import {
  createCartServiceMock,
  createLiveAnnouncerServiceMock,
  createNetworkServiceMock,
  createUserServiceMock,
} from '../../mocks/test-doubles';
import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let userService: jest.Mocked<UserService>;
  let cartService: ReturnType<typeof createCartServiceMock>;
  let networkService: ReturnType<typeof createNetworkServiceMock>;
  let liveAnnouncer: ReturnType<typeof createLiveAnnouncerServiceMock>;
  let router: jest.Mocked<Router>;
  let authStateSubject: BehaviorSubject<boolean>;
  let cartCountSubject: BehaviorSubject<number>;
  let isOnlineSubject: BehaviorSubject<boolean>;

  beforeEach(async () => {
    authStateSubject = new BehaviorSubject<boolean>(false);
    cartCountSubject = new BehaviorSubject<number>(0);
    isOnlineSubject = new BehaviorSubject<boolean>(true);

    const userServiceMock = createUserServiceMock(
      authStateSubject.asObservable(),
    ) as jest.Mocked<UserService>;
    cartService = createCartServiceMock();
    cartService.count$ = cartCountSubject.asObservable() as any;
    networkService = createNetworkServiceMock();
    networkService.isOnline$ = isOnlineSubject.asObservable() as any;
    liveAnnouncer = createLiveAnnouncerServiceMock();

    await TestBed.configureTestingModule({
      imports: [HeaderComponent, RouterTestingModule],
      providers: [
        { provide: UserService, useValue: userServiceMock },
        { provide: CartService, useValue: cartService },
        { provide: NetworkService, useValue: networkService },
        { provide: LiveAnnouncerService, useValue: liveAnnouncer },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    userService = TestBed.inject(UserService) as jest.Mocked<UserService>;
    router = TestBed.inject(Router) as jest.Mocked<Router>;
    jest.spyOn(router, 'navigate');
  });

  afterEach(() => {
    document
      .querySelectorAll('.navbar, #navbarCollapse, .navbar-toggler, .logo-container')
      .forEach((el) => {
        el.remove();
      });
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should generate menu for unauthenticated user', () => {
    fixture.detectChanges();

    expect(component.userRole).toBeNull();
    const allMenu = [...component.menuLeft, ...component.menuRight];
    expect(allMenu.some((item) => item.label === 'Login')).toBe(true);
  });

  it('should generate menu for user "Cliente"', () => {
    authStateSubject.next(true);
    userService.getUserRole.mockReturnValue('Cliente');
    fixture.detectChanges();

    expect(component.userRole).toBe('Cliente');
    const allMenu = [...component.menuLeft, ...component.menuRight];
    expect(allMenu.some((item) => item.label === 'Perfil')).toBe(true);
    expect(allMenu.some((item) => item.label === 'Logout')).toBe(true);
  });

  it('should generate menu for user "Administrador"', () => {
    authStateSubject.next(true);
    userService.getUserRole.mockReturnValue('Administrador');
    fixture.detectChanges();

    expect(component.userRole).toBe('Administrador');
    const allMenu = [...component.menuLeft, ...component.menuRight];
    expect(allMenu.some((item) => item.label === 'Registro')).toBe(true);
    expect(allMenu.some((item) => item.label === 'Logout')).toBe(true);
    expect(allMenu.some((item) => item.label === 'Galería')).toBe(false);
    expect(allMenu.some((item) => item.label === 'Menú')).toBe(false);
    expect(allMenu.some((item) => item.label === 'Ubicación')).toBe(false);
  });

  it('should generate menu for user "Mesero"', () => {
    authStateSubject.next(true);
    userService.getUserRole.mockReturnValue('Mesero');
    fixture.detectChanges();

    expect(component.userRole).toBe('Mesero');
    const allMenu = [...component.menuLeft, ...component.menuRight];
    expect(allMenu.some((item) => item.label === 'Pedidos')).toBe(true);
    expect(allMenu.some((item) => item.label === 'Logout')).toBe(true);
  });

  it('should generate menu for user "Domiciliario"', () => {
    authStateSubject.next(true);
    userService.getUserRole.mockReturnValue('Domiciliario');
    fixture.detectChanges();

    expect(component.userRole).toBe('Domiciliario');
    const allMenu = [...component.menuLeft, ...component.menuRight];
    expect(allMenu.some((item) => item.label === 'Logout')).toBe(true);
  });

  it('should update imagenVisible based on screen width and total menu items', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1300,
    });
    component.menuLeft = [{ label: 'Item1', route: '/item1', priority: 1 }];
    component.menuRight = [{ label: 'Item2', route: '/item2', priority: 2 }];
    component.checkScreenSize();
    expect(component.imagenVisible).toBe(false);

    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1000,
    });
    component.checkScreenSize();
    expect(component.imagenVisible).toBe(true);

    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1300,
    });
    component.menuLeft = new Array(4).fill({ label: 'Item', route: '/item', priority: 1 });
    component.menuRight = new Array(3).fill({ label: 'Item', route: '/item', priority: 1 });
    component.checkScreenSize();
    expect(component.imagenVisible).toBe(true);
  });

  it('should call checkScreenSize on window resize', () => {
    const checkScreenSizeSpy = jest.spyOn(component as any, 'checkScreenSize');
    component.isBrowser = true;
    component.onResize();
    expect(checkScreenSizeSpy).toHaveBeenCalled();
  });

  it('should execute logout and navigate to "/home"', async () => {
    fixture.detectChanges();
    component.logout();
    expect(userService.logout).toHaveBeenCalled();

    // Esperar el setTimeout de la animación
    await new Promise((resolve) => setTimeout(resolve, 200));
    expect(router.navigate).toHaveBeenCalledWith(['/home']);
    expect(liveAnnouncer.announce).toHaveBeenCalledWith('Sesión cerrada correctamente');
  });

  it('should remove "show" class from navbar when cerrarMenu is called and the navbar has "show" class', () => {
    const fakeNavbar = document.createElement('div');
    fakeNavbar.id = 'navbarCollapse';
    fakeNavbar.classList.add('show');
    document.body.appendChild(fakeNavbar);
    component.isBrowser = true;
    const getElementSpy = jest.spyOn(document, 'getElementById').mockReturnValue(fakeNavbar);
    component.cerrarMenu();
    expect(fakeNavbar.classList.contains('show')).toBe(false);
    getElementSpy.mockRestore();
    document.body.removeChild(fakeNavbar);
  });

  it('should do nothing when navbar exists but does not have "show" class', () => {
    const fakeNavbar = document.createElement('div');
    fakeNavbar.id = 'navbarCollapse';
    document.body.appendChild(fakeNavbar);
    component.cerrarMenu();
    expect(fakeNavbar.classList.contains('show')).toBe(false);
    document.body.removeChild(fakeNavbar);
  });

  it('should not throw an error when navbar element does not exist', () => {
    const existing = document.getElementById('navbarCollapse');
    if (existing) {
      existing.remove();
    }
    expect(() => component.cerrarMenu()).not.toThrow();
  });

  describe('Additional roles', () => {
    it('should generate menu for user "Cocinero"', () => {
      authStateSubject.next(true);
      userService.getUserRole.mockReturnValue('Cocinero');
      fixture.detectChanges();

      expect(component.userRole).toBe('Cocinero');
      const allMenu = [...component.menuLeft, ...component.menuRight];
      expect(allMenu.some((item) => item.label === 'Pedidos')).toBe(true);
      expect(allMenu.some((item) => item.label === 'Mi perfil')).toBe(true);
    });

    it('should generate menu for user "Oficios Varios"', () => {
      authStateSubject.next(true);
      userService.getUserRole.mockReturnValue('Oficios Varios');
      fixture.detectChanges();

      expect(component.userRole).toBe('Oficios Varios');
      const allMenu = [...component.menuLeft, ...component.menuRight];
      expect(allMenu.some((item) => item.label === 'Mi perfil')).toBe(true);
      expect(allMenu.some((item) => item.label === 'Galería')).toBe(true);
    });
  });

  describe('Subscriptions', () => {
    it('should update cartCount when cart service emits', () => {
      fixture.detectChanges();

      cartCountSubject.next(5);
      expect(component.cartCount).toBe(5);

      cartCountSubject.next(10);
      expect(component.cartCount).toBe(10);
    });

    it('should update online status when network service emits', () => {
      fixture.detectChanges();

      isOnlineSubject.next(false);
      expect(component.online).toBe(false);

      isOnlineSubject.next(true);
      expect(component.online).toBe(true);
    });

    it('should announce when connection is restored', () => {
      fixture.detectChanges();

      isOnlineSubject.next(false);
      isOnlineSubject.next(true);

      expect(liveAnnouncer.announce).toHaveBeenCalledWith('Conexión restablecida');
    });
  });

  describe('Event handlers', () => {
    it('should call cerrarMenu on scroll', () => {
      const cerrarMenuSpy = jest.spyOn(component, 'cerrarMenu');
      fixture.detectChanges();

      component.onScroll();

      expect(cerrarMenuSpy).toHaveBeenCalled();
    });

    it('should close menu when clicking outside', () => {
      const navbar = document.createElement('div');
      navbar.id = 'navbarCollapse';
      navbar.classList.add('show');
      document.body.appendChild(navbar);

      const toggler = document.createElement('button');
      toggler.classList.add('navbar-toggler');
      document.body.appendChild(toggler);

      const cerrarMenuSpy = jest.spyOn(component, 'cerrarMenu');
      fixture.detectChanges();

      const outsideElement = document.createElement('div');
      document.body.appendChild(outsideElement);

      const event = new MouseEvent('click', { bubbles: true });
      Object.defineProperty(event, 'target', { value: outsideElement, configurable: true });

      component.onDocumentClick(event);

      expect(cerrarMenuSpy).toHaveBeenCalled();

      outsideElement.remove();
      navbar.remove();
      toggler.remove();
    });

    it('should not close menu when clicking inside navbar', () => {
      const navbar = document.createElement('div');
      navbar.id = 'navbarCollapse';
      navbar.classList.add('show');
      document.body.appendChild(navbar);

      const insideElement = document.createElement('a');
      navbar.appendChild(insideElement);

      const cerrarMenuSpy = jest.spyOn(component, 'cerrarMenu');
      fixture.detectChanges();

      const event = new MouseEvent('click', { bubbles: true });
      Object.defineProperty(event, 'target', { value: insideElement, configurable: true });

      component.onDocumentClick(event);

      expect(cerrarMenuSpy).not.toHaveBeenCalled();

      navbar.remove();
    });

    it('should not close menu in non-browser platform', () => {
      component.isBrowser = false;
      const cerrarMenuSpy = jest.spyOn(component, 'cerrarMenu');

      const event = new MouseEvent('click');
      component.onDocumentClick(event);

      expect(cerrarMenuSpy).not.toHaveBeenCalled();
    });
  });

  describe('Platform and native detection', () => {
    it('should detect native platform correctly', () => {
      const mockCapacitor = {
        getPlatform: jest.fn().mockReturnValue('android'), // eslint-disable-line no-restricted-syntax
      };
      (window as any).Capacitor = mockCapacitor;

      const newFixture = TestBed.createComponent(HeaderComponent);
      const newComponent = newFixture.componentInstance;
      newFixture.detectChanges();

      expect(newComponent.isNative).toBe(true);
      expect(newComponent.showHeader).toBe(false);

      delete (window as any).Capacitor;
    });

    it('should show header on web platform', () => {
      delete (window as any).Capacitor;

      const newFixture = TestBed.createComponent(HeaderComponent);
      const newComponent = newFixture.componentInstance;
      newFixture.detectChanges();

      expect(newComponent.isNative).toBe(false);
      expect(newComponent.showHeader).toBe(true);
    });
  });

  describe('animateLogoTransition', () => {
    it('should add and remove transitioning class', (done) => {
      const logoContainer = document.createElement('div');
      logoContainer.classList.add('logo-container');
      document.body.appendChild(logoContainer);

      component.isBrowser = true;
      component['animateLogoTransition']();

      expect(logoContainer.classList.contains('transitioning')).toBe(true);

      setTimeout(() => {
        expect(logoContainer.classList.contains('transitioning')).toBe(false);
        logoContainer.remove();
        done();
      }, 350);
    });

    it('should not throw if logo container does not exist', () => {
      component.isBrowser = true;
      expect(() => component['animateLogoTransition']()).not.toThrow();
    });

    it('should not animate in non-browser platform', () => {
      const logoContainer = document.createElement('div');
      logoContainer.classList.add('logo-container');
      document.body.appendChild(logoContainer);

      component.isBrowser = false;
      component['animateLogoTransition']();

      expect(logoContainer.classList.contains('transitioning')).toBe(false);
      logoContainer.remove();
    });
  });

  describe('bindMenuA11yHandlers', () => {
    it('should bind accessibility handlers to menu toggler', (done) => {
      const toggler = document.createElement('button');
      toggler.classList.add('navbar-toggler');
      document.body.appendChild(toggler);

      const collapse = document.createElement('div');
      collapse.id = 'navbarCollapse';
      document.body.appendChild(collapse);

      const navLink = document.createElement('a');
      navLink.classList.add('nav-link');
      collapse.appendChild(navLink);

      component['bindMenuA11yHandlers']();

      // Simulate toggler click
      collapse.classList.add('show');
      toggler.click();

      setTimeout(() => {
        expect(toggler.getAttribute('aria-expanded')).toBe('true');

        toggler.remove();
        collapse.remove();
        done();
      }, 10);
    });

    it('should close menu on Escape key', () => {
      const toggler = document.createElement('button');
      toggler.classList.add('navbar-toggler');
      document.body.appendChild(toggler);

      const collapse = document.createElement('div');
      collapse.id = 'navbarCollapse';
      collapse.classList.add('show');
      document.body.appendChild(collapse);

      const cerrarMenuSpy = jest.spyOn(component, 'cerrarMenu');
      component['bindMenuA11yHandlers']();

      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      const stopPropagationSpy = jest.spyOn(escapeEvent, 'stopPropagation');
      collapse.dispatchEvent(escapeEvent);

      expect(cerrarMenuSpy).toHaveBeenCalled();

      toggler.remove();
      collapse.remove();
    });

    it('should not bind handlers if elements are missing', () => {
      expect(() => component['bindMenuA11yHandlers']()).not.toThrow();
    });
  });

  describe('checkScreenSize with animation', () => {
    it('should trigger animation when imagenVisible changes', () => {
      const animateSpy = jest.spyOn(component as any, 'animateLogoTransition');

      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1300,
      });
      component.imagenVisible = false;
      component.menuLeft = [];
      component.menuRight = [];
      component.checkScreenSize();

      expect(component.imagenVisible).toBe(false);
      expect(animateSpy).not.toHaveBeenCalled();

      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1000,
      });
      component.checkScreenSize();

      expect(component.imagenVisible).toBe(true);
      expect(animateSpy).toHaveBeenCalled();
    });
  });

  describe('ngOnDestroy', () => {
    it('should complete destroy$ subject', () => {
      const nextSpy = jest.spyOn(component['destroy$'], 'next');
      const completeSpy = jest.spyOn(component['destroy$'], 'complete');

      component.ngOnDestroy();

      expect(nextSpy).toHaveBeenCalled();
      expect(completeSpy).toHaveBeenCalled();
    });
  });
});
