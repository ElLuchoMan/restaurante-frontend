import { PLATFORM_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { UserService } from '../../../core/services/user.service';
import { createUserServiceMock } from '../../mocks/test-doubles';
import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let userService: jest.Mocked<UserService>;
  let router: jest.Mocked<Router>;

  beforeEach(async () => {
    const userServiceMock = createUserServiceMock() as jest.Mocked<UserService>;

    await TestBed.configureTestingModule({
      imports: [HeaderComponent, RouterTestingModule],
      providers: [
        { provide: UserService, useValue: userServiceMock },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    userService = TestBed.inject(UserService) as jest.Mocked<UserService>;
    router = TestBed.inject(Router) as jest.Mocked<Router>;
    jest.spyOn(router, 'navigate');
  });

  it('should create', () => {
    userService.getAuthState.mockReturnValue(of(false));
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should generate menu for unauthenticated user', () => {
    userService.getAuthState.mockReturnValue(of(false));
    fixture.detectChanges();

    expect(component.userRole).toBeNull();
    const allMenu = [...component.menuLeft, ...component.menuRight];
    expect(allMenu.some((item) => item.label === 'Login')).toBe(true);
  });

  it('should generate menu for user "Cliente"', () => {
    userService.getAuthState.mockReturnValue(of(true));
    userService.getUserRole.mockReturnValue('Cliente');
    fixture.detectChanges();

    expect(component.userRole).toBe('Cliente');
    const allMenu = [...component.menuLeft, ...component.menuRight];
    expect(allMenu.some((item) => item.label === 'Perfil')).toBe(true);
    expect(allMenu.some((item) => item.label === 'Logout')).toBe(true);
  });

  it('should generate menu for user "Administrador"', () => {
    userService.getAuthState.mockReturnValue(of(true));
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
    userService.getAuthState.mockReturnValue(of(true));
    userService.getUserRole.mockReturnValue('Mesero');
    fixture.detectChanges();

    expect(component.userRole).toBe('Mesero');
    const allMenu = [...component.menuLeft, ...component.menuRight];
    expect(allMenu.some((item) => item.label === 'Pedidos')).toBe(true);
    expect(allMenu.some((item) => item.label === 'Logout')).toBe(true);
  });

  it('should generate menu for user "Domiciliario"', () => {
    userService.getAuthState.mockReturnValue(of(true));
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
    userService.getAuthState.mockReturnValue(of(false));
    fixture.detectChanges();
    component.logout();
    expect(userService.logout).toHaveBeenCalled();

    // Esperar el setTimeout de la animación
    await new Promise((resolve) => setTimeout(resolve, 200));
    expect(router.navigate).toHaveBeenCalledWith(['/home']);
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
});
