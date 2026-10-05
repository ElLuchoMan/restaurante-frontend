import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavigationStart, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject, Subject } from 'rxjs';

import { CartService } from '../../../core/services/cart.service';
import { UserService } from '../../../core/services/user.service';
import { NativeTopbarComponent, TopBarAction } from './native-topbar.component';

jest.mock('../../utils/notification-center.store', () => ({
  getUnseenCount: jest.fn(), // eslint-disable-line no-restricted-syntax
}));

const { getUnseenCount } = require('../../utils/notification-center.store') as {
  getUnseenCount: jest.Mock;
};

class UserServiceStub {
  private auth$ = new BehaviorSubject<boolean>(false);
  role: string | null = null;
  logout = jest.fn(); // eslint-disable-line no-restricted-syntax

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
  let addEventListenerSpy: jest.SpyInstance;
  let removeEventListenerSpy: jest.SpyInstance;

  beforeEach(async () => {
    getUnseenCount.mockReset();
    getUnseenCount.mockImplementation(() => 5);

    await TestBed.configureTestingModule({
      imports: [
        NativeTopbarComponent,
        RouterTestingModule.withRoutes([
          { path: '', redirectTo: '/', pathMatch: 'full' },
          { path: 'reservas', component: NativeTopbarComponent }, // Ruta dummy para testing
          { path: 'home/interno', component: NativeTopbarComponent }, // Ruta dummy para testing
        ]),
        CommonModule,
      ],
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

    addEventListenerSpy = jest.spyOn(window, 'addEventListener');
    removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

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
    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
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

  it('maneja errores al actualizar notificaciones cuando el store no está disponible', () => {
    // Autenticar como Cliente para tener acciones con notificaciones
    userService.emitAuthState(true, 'Cliente');

    // Mockear getUnseenCount para lanzar error
    getUnseenCount.mockReset();
    getUnseenCount.mockImplementation(() => {
      throw new Error('Store no disponible');
    });

    // Disparar el evento que debería actualizar el contador
    window.dispatchEvent(new Event('notification-center:update'));

    // El componente debe manejar el error sin crash y resetear el contador
    expect(component.notifCount).toBe(0);
    expect(component.topBarActions[2].badge).toBe(0);
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

  it('no ejecuta acciones cuando no hay ruta ni logout', async () => {
    const logoutSpy = jest.spyOn(component, 'onLogout');
    const navigateSpy = router.navigate as jest.Mock;
    navigateSpy.mockClear();

    await component.onActionClick({ icon: 'fa', ariaLabel: 'sin accion' });

    expect(logoutSpy).not.toHaveBeenCalled();
    expect(navigateSpy).not.toHaveBeenCalled();
    logoutSpy.mockRestore();
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

  // Nota: Los tests de padding dinámico del DOM se prueban mejor en E2E
  // ya que dependen de comportamiento específico del navegador

  it('no aplica padding cuando no está en plataforma de navegador', () => {
    const originalPlatform = component['platformId'];
    component['mainEl'] = mainElement;
    component['platformId'] = 'server';
    component['applyTopPadding']();
    expect(mainElement.style.paddingTop).toBe('0px');
    component['platformId'] = originalPlatform;
  });

  it('no ajusta padding si falta la barra o el contenedor principal', () => {
    topbarElement.remove();
    component['mainEl'] = mainElement;

    component['applyTopPadding']();

    // Cuando no hay barra, el método hace return sin cambiar el paddingTop,
    // así que mantiene el valor inicial '0px' del elemento
    expect(mainElement.style.paddingTop).toBe('0px');
  });

  it('aplica padding dinámico fuera de la página principal', async () => {
    // El beforeEach mockea router.navigate; se restaura para navegar de verdad
    (router.navigate as jest.Mock).mockRestore();
    component['mainEl'] = mainElement;

    await router.navigate(['/reservas']);
    fixture.detectChanges();

    expect(router.url).toBe('/reservas');
    // NavigationEnd dispara applyTopPadding vía la suscripción de ngOnInit
    expect(mainElement.style.paddingTop).toBe('60px');
  });

  it('quita padding cuando la ruta corresponde a Home', async () => {
    component['mainEl'] = mainElement;
    mainElement.style.paddingTop = 'calc(60px + max(env(safe-area-inset-top), 0px))';
    // Navegar realmente a home
    await router.navigate(['/home/interno']);
    fixture.detectChanges();

    component['applyTopPadding']();

    expect(mainElement.style.paddingTop).toBe('0px');
  });

  it('responde a los cambios del carrito', () => {
    userService.emitAuthState(true, 'Cliente');
    cartService.count$.next(7);
    expect(component.cartCount).toBe(7);
    expect(component.topBarActions[0].badge).toBe(7);
  });

  it('recalcula el padding cuando el router emite NavigationEnd', async () => {
    (router.navigate as jest.Mock).mockRestore();
    const spy = jest.spyOn(component as any, 'applyTopPadding');
    component['mainEl'] = mainElement;

    await router.navigate(['/reservas']);

    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });

  it('no recalcula el padding con eventos de router que no son NavigationEnd', () => {
    const spy = jest.spyOn(component as any, 'applyTopPadding');

    (router.events as unknown as Subject<unknown>).next(new NavigationStart(1, '/reservas'));

    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it('isLoggedOut$ refleja el estado de autenticación invertido', () => {
    const values: boolean[] = [];
    const sub = component.isLoggedOut$.subscribe((v) => values.push(v));

    userService.emitAuthState(true, 'Cliente');
    userService.emitAuthState(false, null);
    sub.unsubscribe();

    expect(values).toEqual([true, false, true]);
  });

  it('usa 0 como contador del carrito cuando el valor emitido es nulo', () => {
    cartService.count$.next(null as unknown as number);
    expect(component.cartCount).toBe(0);
  });

  it('regenera las acciones al cambiar el carrito solo para el rol Cliente', () => {
    userService.emitAuthState(true, 'Cliente');
    cartService.count$.next(7);
    expect(component.topBarActions[0].badge).toBe(7);

    userService.emitAuthState(true, 'Administrador');
    const before = component.topBarActions;
    cartService.count$.next(9);
    expect(component.cartCount).toBe(9);
    expect(component.topBarActions).toBe(before);
  });

  it('aplica 0px en Home exacto ("/") y 60px en otras rutas', () => {
    component['mainEl'] = mainElement;
    const urlSpy = jest.spyOn(router, 'url', 'get');

    urlSpy.mockReturnValue('/');
    component['applyTopPadding']();
    expect(mainElement.style.paddingTop).toBe('0px');

    urlSpy.mockReturnValue('/menu');
    component['applyTopPadding']();
    expect(mainElement.style.paddingTop).toBe('60px');

    urlSpy.mockReturnValue(undefined as unknown as string);
    mainElement.style.paddingTop = '10px';
    component['applyTopPadding']();
    expect(mainElement.style.paddingTop).toBe('60px');

    urlSpy.mockRestore();
  });

  it('no ajusta padding si falta el contenedor principal', () => {
    component['mainEl'] = null;
    const urlSpy = jest.spyOn(router, 'url', 'get').mockReturnValue('/menu');
    mainElement.style.paddingTop = '10px';

    component['applyTopPadding']();

    expect(mainElement.style.paddingTop).toBe('10px');
    urlSpy.mockRestore();
  });

  it('ngOnInit tolera que el store de notificaciones no esté disponible', () => {
    const fx = TestBed.createComponent(NativeTopbarComponent);
    getUnseenCount.mockImplementation(() => {
      throw new Error('boom');
    });

    expect(() => fx.detectChanges()).not.toThrow();
    expect(fx.componentInstance.notifCount).toBe(0);
    fx.destroy();
  });

  it('gestiona correctamente los cambios del centro de notificaciones', () => {
    // Autenticar como Cliente para tener las acciones correctas
    userService.emitAuthState(true, 'Cliente');

    expect(component.notifCount).toBe(5);
    expect(component.topBarActions[2].badge).toBe(5);

    // Mockear getUnseenCount para lanzar error en la siguiente llamada
    getUnseenCount.mockReset();
    getUnseenCount.mockImplementation(() => {
      throw new Error('error');
    });

    // Disparar el evento que debería actualizar el contador
    window.dispatchEvent(new Event('notification-center:update'));

    expect(component.notifCount).toBe(0);
    expect(component.topBarActions[2].badge).toBe(0);
  });

  // Nota: Los tests de limpieza del DOM se prueban mejor en E2E
  // ya que dependen de event listeners y comportamiento específico del navegador

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

  it('libera recursos al destruir el componente', () => {
    component['mainEl'] = mainElement;
    mainElement.style.paddingTop = 'calc(60px + max(env(safe-area-inset-top), 0px))';
    const destroy$ = (component as any).destroy$;
    const nextSpy = jest.spyOn(destroy$, 'next');
    const completeSpy = jest.spyOn(destroy$, 'complete');

    component.ngOnDestroy();

    expect(nextSpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
    expect(destroy$.isStopped).toBe(true);
    // jsdom convierte '' a '0px', ambos son valores válidos para resetear
    expect(['', '0px']).toContain(mainElement.style.paddingTop);
  });
});
