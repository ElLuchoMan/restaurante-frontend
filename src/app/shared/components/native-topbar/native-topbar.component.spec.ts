import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject } from 'rxjs';

import { CartService } from '../../../core/services/cart.service';
import { UserService } from '../../../core/services/user.service';
import { NativeTopbarComponent, TopBarAction } from './native-topbar.component';

jest.mock('../../utils/notification-center.store', () => ({
  getUnseenCount: jest.fn(),
}));

const { getUnseenCount } = require('../../utils/notification-center.store') as {
  getUnseenCount: jest.Mock;
};

class UserServiceStub {
  private auth$ = new BehaviorSubject<boolean>(false);
  role: string | null = null;
  logout = jest.fn();

  getAuthState() {
    return this.auth$.asObservable();
  }

  getUserRole() {
    return this.role;
  }

  emitAuthState(isLoggedIn: boolean, role: string | null = this.role) {
    this.role = role;
    this.auth$.next(isLoggedIn);
  }
}

class CartServiceStub {
  count$ = new BehaviorSubject<number>(2);
}

describe('NativeTopbarComponent', () => {
  let component: NativeTopbarComponent;
  let fixture: ComponentFixture<NativeTopbarComponent>;
  let userService: UserServiceStub;
  let cartService: CartServiceStub;
  let router: Router;
  let mainElement: HTMLElement;
  let topbarElement: HTMLElement;

  beforeEach(async () => {
    getUnseenCount.mockReset();
    getUnseenCount.mockImplementation(() => 5);

    await TestBed.configureTestingModule({
      imports: [NativeTopbarComponent, RouterTestingModule.withRoutes([]), CommonModule],
      providers: [
        { provide: UserService, useClass: UserServiceStub },
        { provide: CartService, useClass: CartServiceStub },
      ],
    }).compileComponents();

    mainElement = document.createElement('div');
    mainElement.id = 'main';
    document.body.appendChild(mainElement);

    topbarElement = document.createElement('div');
    topbarElement.classList.add('home-topbar');
    document.body.appendChild(topbarElement);

    fixture = TestBed.createComponent(NativeTopbarComponent);
    component = fixture.componentInstance;
    userService = TestBed.inject(UserService) as unknown as UserServiceStub;
    cartService = TestBed.inject(CartService) as unknown as CartServiceStub;
    router = TestBed.inject(Router);

    jest.spyOn(router, 'navigate').mockResolvedValue(true as never);

    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    mainElement.remove();
    topbarElement.remove();
    jest.clearAllMocks();
  });

  it('debería crearse', () => {
    expect(component).toBeTruthy();
  });

  it('muestra el logo con enlace a Home', () => {
    const element = fixture.nativeElement as HTMLElement;
    const link = element.querySelector('a[aria-label="Ir al inicio"]');
    expect(link).not.toBeNull();
    expect(component.logoLink).toBe('/home');
  });

  it('omite la inicialización cuando la plataforma no es un navegador', () => {
    const originalPlatform = component['platformId'];
    const spy = jest.spyOn(document, 'getElementById');
    component['mainEl'] = null;
    component['platformId'] = 'server';

    component.ngOnInit();

    expect(spy).not.toHaveBeenCalled();
    component['platformId'] = originalPlatform;
    spy.mockRestore();
  });

  it('emite acciones de login cuando el usuario no está autenticado', () => {
    const action = component.topBarActions[0];
    expect(action).toMatchObject<TopBarAction>({
      icon: 'fa fa-user',
      route: '/login',
    });
  });

  it('actualiza las acciones cuando cambia el rol del usuario', () => {
    userService.emitAuthState(true, 'Cliente');
    fixture.detectChanges();

    expect(component.topBarActions.map((a) => a.icon)).toEqual([
      'fa fa-shopping-cart',
      'fa fa-user-circle',
      'fa fa-bell',
      'fa fa-sign-out-alt',
    ]);
    expect(component.topBarActions[0].badge).toBe(2);
    expect(component.topBarActions[2].badge).toBe(5);

    userService.emitAuthState(true, 'Administrador');
    fixture.detectChanges();

    expect(component.topBarActions.map((a) => a.icon)).toEqual([
      'fa fa-cogs',
      'fa fa-user-circle',
      'fa fa-bell',
      'fa fa-sign-out-alt',
    ]);
  });

  it('genera acciones específicas para cada rol soportado', () => {
    const scenarios: Array<[string, string[]]> = [
      ['Domiciliario', ['fa fa-user-circle', 'fa fa-bell', 'fa fa-sign-out-alt']],
      ['Mesero', ['fa fa-user-circle', 'fa fa-bell', 'fa fa-sign-out-alt']],
      ['Cocinero', ['fa fa-user-circle', 'fa fa-bell', 'fa fa-sign-out-alt']],
      ['Oficios Varios', ['fa fa-user-circle', 'fa fa-sign-out-alt']],
    ];

    for (const [role, expectedIcons] of scenarios) {
      component['userRole'] = role;
      component['notifCount'] = 3;
      component['generateTopBarActions']();
      expect(component.topBarActions.map((a) => a.icon)).toEqual(expectedIcons);
    }
  });

  it('limpia las acciones cuando no hay rol reconocido', () => {
    component['userRole'] = 'Rol Desconocido';
    component['generateTopBarActions']();
    expect(component.topBarActions).toEqual([]);
  });

  it('navega al ejecutar una acción con ruta', async () => {
    const action: TopBarAction = {
      icon: 'fa fa-user',
      route: '/perfil',
      ariaLabel: 'perfil',
    };

    await component.onActionClick(action);
    expect(router.navigate).toHaveBeenCalledWith(['/perfil']);
  });

  it('cierra la sesión cuando la acción es logout', () => {
    const logoutSpy = jest.spyOn(component, 'onLogout');
    component.onActionClick({ icon: 'fa', action: 'logout', ariaLabel: 'Cerrar' });
    expect(logoutSpy).toHaveBeenCalled();
  });

  it('invoca al servicio de usuario y navega al cerrar sesión', () => {
    component.onLogout();
    expect(userService.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/home']);
  });

  it('actualiza el padding principal en Home y en otras rutas', async () => {
    expect(mainElement.style.paddingTop).toBe('0px');

    await router.navigate(['/cliente/carrito-cliente']);
    component['applyTopPadding']();
    expect(mainElement.style.paddingTop).toContain('calc(60px');
  });

  it('no aplica padding cuando no está en plataforma de navegador', () => {
    const originalPlatform = component['platformId'];
    component['mainEl'] = mainElement;
    component['platformId'] = 'server';
    component['applyTopPadding']();
    expect(mainElement.style.paddingTop).toBe('0px');
    component['platformId'] = originalPlatform;
  });

  it('responde a los cambios del carrito', () => {
    userService.emitAuthState(true, 'Cliente');
    cartService.count$.next(7);
    expect(component.cartCount).toBe(7);
    expect(component.topBarActions[0].badge).toBe(7);
  });

  it('gestiona correctamente los cambios del centro de notificaciones', () => {
    expect(component.notifCount).toBe(5);
    expect(component.topBarActions[2].badge).toBe(5);

    getUnseenCount.mockImplementationOnce(() => {
      throw new Error('error');
    });

    window.dispatchEvent(new Event('focus'));
    expect(component.notifCount).toBe(0);
    expect(component.topBarActions[2].badge).toBe(0);
  });

  it('elimina listeners y reinicia el padding al destruirse', () => {
    const removeSpy = jest.spyOn(window, 'removeEventListener');
    const destroy$ = component['destroy$'];
    destroy$.next();

    expect(removeSpy).toHaveBeenCalledWith('notification-center:update', expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith('focus', expect.any(Function));

    component['mainEl'] = mainElement;
    mainElement.style.paddingTop = '10px';
    component.ngOnDestroy();

    expect(mainElement.style.paddingTop).toBe('');
  });

  it('vuelve a aplicar el padding cuando cambia el tamaño de la ventana', () => {
    const spy = jest.spyOn(component as any, 'applyTopPadding');
    component.onResize();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('evita recalcular el padding al cambiar de tamaño si no es navegador', () => {
    const spy = jest.spyOn(component as any, 'applyTopPadding');
    const originalPlatform = component['platformId'];
    component['platformId'] = 'server';
    component.onResize();
    expect(spy).not.toHaveBeenCalled();
    component['platformId'] = originalPlatform;
    spy.mockRestore();
  });
});
