import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { By } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject, Subject } from 'rxjs';

import { UserService } from '../../../core/services/user.service';
import { QuickActionItem, QuickActionsComponent } from './quick-actions.component';

class UserServiceStub {
  private auth$ = new BehaviorSubject<boolean>(false);
  role: string | null = null;
  logout = jest.fn(() => {
    this.setAuth(false);
  });

  getAuthState() {
    return this.auth$.asObservable();
  }

  setAuth(isAuthenticated: boolean) {
    this.auth$.next(isAuthenticated);
  }

  setRole(role: string | null) {
    this.role = role;
  }

  getUserRole() {
    return this.role;
  }
}

class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = [];
  public observed: Element | null = null;
  disconnect = jest.fn();

  constructor(private callback: IntersectionObserverCallback) {
    MockIntersectionObserver.instances.push(this);
  }

  observe = jest.fn((element: Element) => {
    this.observed = element;
  });

  trigger(isIntersecting: boolean) {
    const entry = {
      isIntersecting,
      target: this.observed,
    } as IntersectionObserverEntry;
    this.callback([entry], this as unknown as IntersectionObserver);
  }
}

describe('QuickActionsComponent', () => {
  let userService: UserServiceStub;
  let router: Router;
  let originalIO: typeof IntersectionObserver | undefined;
  let originalViewport: VisualViewport | undefined;
  let originalInnerHeight: number;
  let fixture: ComponentFixture<QuickActionsComponent>;
  let component: QuickActionsComponent;

  const createMain = () => {
    const main = document.createElement('div');
    main.id = 'main';
    document.body.appendChild(main);
    return main;
  };

  const createFooter = () => {
    const footerWrapper = document.createElement('app-footer');
    const footer = document.createElement('div');
    footer.classList.add('footer');
    footerWrapper.appendChild(footer);
    document.body.appendChild(footerWrapper);
    return { footerWrapper, footer };
  };

  const setupVisualViewport = () => {
    const listeners = new Map<string, () => void>();
    const viewport = {
      height: 800,
      addEventListener: jest.fn((event: string, handler: () => void) => {
        listeners.set(event, handler);
      }),
      removeEventListener: jest.fn((event: string) => {
        listeners.delete(event);
      }),
      trigger: (event: string) => {
        const handler = listeners.get(event);
        handler?.();
      },
    } as unknown as VisualViewport & { trigger: (event: string) => void };
    return viewport;
  };

  const createComponent = async (options: { platformId?: string; attachMain?: boolean; withFooter?: boolean } = {}) => {
    if (options.platformId) {
      TestBed.overrideProvider(PLATFORM_ID, { useValue: options.platformId });
    }

    if (options.attachMain !== false) {
      createMain();
    }

    if (options.withFooter) {
      createFooter();
    }

    fixture = TestBed.createComponent(QuickActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    jest.runOnlyPendingTimers();
    return { fixture, component };
  };

  beforeAll(() => {
    originalIO = (window as any).IntersectionObserver;
    originalViewport = (window as any).visualViewport;
  });

  beforeEach(async () => {
    jest.useFakeTimers();
    await TestBed.configureTestingModule({
      imports: [QuickActionsComponent, RouterTestingModule],
      providers: [
        { provide: UserService, useClass: UserServiceStub },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    }).compileComponents();

    userService = TestBed.inject(UserService) as unknown as UserServiceStub;
    router = TestBed.inject(Router);
    (window as any).IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;
    (window as any).visualViewport = setupVisualViewport();
    originalInnerHeight = window.innerHeight;
  });

  afterEach(() => {
    fixture?.destroy();
    document.body.innerHTML = '';
    MockIntersectionObserver.instances = [];
    jest.clearAllTimers();
    jest.useRealTimers();
    delete (router as { url?: string }).url;
    Object.defineProperty(window, 'innerHeight', {
      value: originalInnerHeight,
      configurable: true,
      writable: true,
    });
  });

  afterAll(() => {
    (window as any).IntersectionObserver = originalIO;
    (window as any).visualViewport = originalViewport;
  });

  it('crea la instancia y muestra accesos por defecto cuando está desloggeado', async () => {
    await createComponent();
    const items = fixture.debugElement.queryAll(By.css('.qa-item'));
    expect(component).toBeTruthy();
    expect(items.length).toBe(4);
    const labels = items.map((item) => item.nativeElement.textContent.trim());
    expect(labels).toContain('Menú');
    expect(labels).toContain('Login');
  });

  it('omite la configuración del DOM en plataforma no navegador', () => {
    const manualComponent = new QuickActionsComponent(
      userService as unknown as UserService,
      router,
      'server' as unknown as object,
    );
    manualComponent.ngAfterViewInit();
    expect((manualComponent as unknown as { barEl?: HTMLElement | null }).barEl).toBeUndefined();
  });

  it('sale temprano si no encuentra los contenedores requeridos', async () => {
    await createComponent({ attachMain: false });
    expect((component as unknown as { mainEl: HTMLElement | null }).mainEl).toBeNull();
    expect((component as unknown as { barEl: HTMLElement | null }).barEl).toBeTruthy();
    expect((component as unknown as { teardownFns: Array<() => void> }).teardownFns.length).toBe(0);
  });

  it('emite el estado de logout invertido', async () => {
    await createComponent();
    const values: boolean[] = [];
    const sub = component.isLoggedOut$.subscribe((value) => values.push(value));
    userService.setAuth(true);
    userService.setAuth(false);
    expect(values).toEqual([true, false, true]);
    sub.unsubscribe();
  });

  it.each<{
    role: string | null;
    expected: QuickActionItem[];
  }>([
    {
      role: null,
      expected: [
        { label: 'Menú', route: '/menu', icon: 'fa fa-utensils' },
        { label: 'Reservas', route: '/reservas', icon: 'fa fa-calendar' },
        { label: 'Ubicación', route: '/ubicacion', icon: 'fa fa-map-marker-alt' },
        { label: 'Login', route: '/login', icon: 'fa fa-sign-in-alt' },
      ],
    },
    {
      role: 'Cliente',
      expected: [
        { label: 'Menú', route: '/menu', icon: 'fa fa-utensils' },
        { label: 'Reservas', route: '/reservas', icon: 'fa fa-calendar' },
        { label: 'Ubicación', route: '/ubicacion', icon: 'fa fa-map-marker-alt' },
        { label: 'Galería', route: '/gallery', icon: 'fa fa-images' },
      ],
    },
    {
      role: 'Administrador',
      expected: [
        { label: 'Menú', route: '/menu', icon: 'fa fa-utensils' },
        { label: 'Registro', route: '/admin/registro-admin', icon: 'fa fa-address-card' },
        { label: 'Reservas', route: '/admin/reservas', icon: 'fa fa-calendar' },
        { label: 'Logout', route: '/logout', icon: 'fa fa-sign-out-alt', isButton: true },
      ],
    },
    {
      role: 'Domiciliario',
      expected: [
        { label: 'Domicilios', route: '/trabajador/domicilios/tomar', icon: 'fa fa-motorcycle' },
        { label: 'Menú', route: '/menu', icon: 'fa fa-utensils' },
        { label: 'Mi perfil', route: '/trabajador/perfil', icon: 'fa fa-user' },
        { label: 'Logout', route: '/logout', icon: 'fa fa-sign-out-alt', isButton: true },
      ],
    },
    {
      role: 'Mesero',
      expected: [
        { label: 'Pedidos', route: '/trabajador/pedidos', icon: 'fa fa-clipboard-list' },
        { label: 'Menú', route: '/menu', icon: 'fa fa-utensils' },
        { label: 'Mi perfil', route: '/trabajador/perfil', icon: 'fa fa-user' },
        { label: 'Logout', route: '/logout', icon: 'fa fa-sign-out-alt', isButton: true },
      ],
    },
    {
      role: 'Cocinero',
      expected: [
        { label: 'Pedidos', route: '/trabajador/pedidos', icon: 'fa fa-clipboard-list' },
        { label: 'Menú', route: '/menu', icon: 'fa fa-utensils' },
        { label: 'Mi perfil', route: '/trabajador/perfil', icon: 'fa fa-user' },
        { label: 'Logout', route: '/logout', icon: 'fa fa-sign-out-alt', isButton: true },
      ],
    },
    {
      role: 'Oficios Varios',
      expected: [
        { label: 'Menú', route: '/menu', icon: 'fa fa-utensils' },
        { label: 'Mi perfil', route: '/trabajador/perfil', icon: 'fa fa-user' },
        { label: 'Galería', route: '/gallery', icon: 'fa fa-images' },
        { label: 'Logout', route: '/logout', icon: 'fa fa-sign-out-alt', isButton: true },
      ],
    },
  ])('genera accesos correctos para $role', async ({ role, expected }) => {
    await createComponent();
    (component as unknown as { userRole: string | null }).userRole = role;
    (component as unknown as { generateQuickActions: () => void }).generateQuickActions();
    expect(component.quickActions).toEqual(expected);
  });

  it('ejecuta logout y redirige al home', async () => {
    userService.setRole('Administrador');
    userService.setAuth(true);
    const navigateSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);
    await createComponent();
    const logoutAction = component.quickActions.find((action) => action.isButton)!;
    component.onActionClick(logoutAction);
    expect(userService.logout).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/home']);
  });

  it('navega a la ruta indicada cuando la acción no es botón', async () => {
    userService.setRole('Cliente');
    userService.setAuth(true);
    const navigateSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);
    await createComponent();
    const action = component.quickActions[0];
    component.onActionClick(action);
    expect(navigateSpy).toHaveBeenCalledWith([action.route]);
  });

  it('gestiona los efectos visuales y eventos del teclado y footer', async () => {
    Object.defineProperty(window, 'innerHeight', { value: 900, writable: true, configurable: true });
    const urlSpy = jest.spyOn(router, 'url', 'get');
    urlSpy.mockReturnValue('/home');
    const focusHandlers: { in?: EventListener; out?: EventListener } = {};
    const originalAddEventListener = document.addEventListener.bind(document);
    const addListenerSpy = jest
      .spyOn(document, 'addEventListener')
      .mockImplementation(
        (
          type: string,
          listener: EventListenerOrEventListenerObject,
          options?: boolean | AddEventListenerOptions,
        ) => {
          if (type === 'focusin') focusHandlers.in = listener as EventListener;
          if (type === 'focusout') focusHandlers.out = listener as EventListener;
          return originalAddEventListener(type, listener as EventListener, options as boolean | AddEventListenerOptions | undefined);
        },
      );

    userService.setAuth(false);
    await createComponent({ withFooter: true });

    const bar = fixture.nativeElement.querySelector('.quick-actions-bar') as HTMLElement;
    const main = document.getElementById('main') as HTMLElement;
    (component as unknown as { barEl: HTMLElement | null }).barEl = bar;
    (component as unknown as { mainEl: HTMLElement | null }).mainEl = main;
    const rectSpy = jest.spyOn(bar, 'getBoundingClientRect').mockReturnValue({ height: 56 } as DOMRect);

    const observer = MockIntersectionObserver.instances.at(-1)!;
    observer.trigger(true);
    expect(bar.classList.contains('qa-hidden')).toBe(true);
    const paddingWhenHidden = main.style.paddingBottom;
    expect(
      paddingWhenHidden === '' || paddingWhenHidden.includes('calc(8px + max(env(safe-area-inset-bottom), 0px))'),
    ).toBe(true);

    observer.trigger(false);
    expect(bar.classList.contains('qa-hidden')).toBe(false);

    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();
    input.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    expect(bar.classList.contains('qa-hidden')).toBe(true);
    input.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
    expect(bar.classList.contains('qa-hidden')).toBe(false);

    const viewport = (window as any).visualViewport as VisualViewport & { trigger: (event: string) => void };
    viewport.height = 700;
    viewport.trigger('resize');
    expect(bar.classList.contains('qa-hidden')).toBe(true);
    viewport.height = 900;
    viewport.trigger('resize');
    expect(bar.classList.contains('qa-hidden')).toBe(false);
    viewport.height = undefined as unknown as number;
    viewport.trigger('resize');

    const firstItem = fixture.debugElement.query(By.css('.qa-item')).nativeElement as HTMLElement;
    firstItem.dispatchEvent(new Event('pointerdown'));
    expect(firstItem.classList.contains('qa-tap')).toBe(true);
    jest.advanceTimersByTime(240);
    expect(firstItem.classList.contains('qa-tap')).toBe(false);

    firstItem.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(firstItem.classList.contains('qa-tap')).toBe(true);
    jest.advanceTimersByTime(240);
    expect(firstItem.classList.contains('qa-tap')).toBe(false);

    firstItem.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
    expect(firstItem.classList.contains('qa-tap')).toBe(true);
    jest.advanceTimersByTime(240);
    expect(firstItem.classList.contains('qa-tap')).toBe(false);

    const events$ = router.events as unknown as Subject<unknown>;
    events$.next(new NavigationEnd(1, '/a', '/b'));
    jest.runOnlyPendingTimers();
    expect(MockIntersectionObserver.instances.length).toBeGreaterThan(1);

    const originalMainEl = (component as unknown as { mainEl: HTMLElement | null }).mainEl;
    (component as unknown as { mainEl: HTMLElement | null }).mainEl = null;
    observer.trigger(true);
    (component as unknown as { mainEl: HTMLElement | null }).mainEl = originalMainEl;

    const originalBarEl = (component as unknown as { barEl: HTMLElement | null }).barEl;
    (component as unknown as { barEl: HTMLElement | null }).barEl = null;
    observer.trigger(true);
    (component as unknown as { barEl: HTMLElement | null }).barEl = originalBarEl;
    observer.trigger(false);

    urlSpy.mockReturnValue('/');
    observer.trigger(true);
    urlSpy.mockReturnValue('/menu');
    observer.trigger(true);
    urlSpy.mockImplementation(() => undefined as unknown as string);
    observer.trigger(true);
    urlSpy.mockReturnValue('/home');

    focusHandlers.in?.call(document, { target: null } as unknown as Event);
    const span = document.createElement('span');
    focusHandlers.in?.call(document, { target: span } as unknown as Event);
    const editable = document.createElement('div');
    editable.contentEditable = 'true';
    focusHandlers.in?.call(document, { target: editable } as unknown as Event);
    const textarea = document.createElement('textarea');
    focusHandlers.in?.call(document, { target: textarea } as unknown as Event);
    focusHandlers.in?.call(
      document,
      { target: { isContentEditable: false } as unknown as HTMLElement } as unknown as Event,
    );

    bar.classList.remove('qa-hidden');
    component.onResize();
    expect(rectSpy).toHaveBeenCalled();
    bar.classList.add('qa-hidden');
    component.onResize();
    expect(main.style.paddingBottom).toBe('');

    const savedMain = (component as unknown as { mainEl: HTMLElement | null }).mainEl;
    (component as unknown as { mainEl: HTMLElement | null }).mainEl = null;
    component.onResize();
    (component as unknown as { mainEl: HTMLElement | null }).mainEl = savedMain;

    addListenerSpy.mockRestore();
    urlSpy.mockRestore();
    component.ngOnDestroy();
    expect(observer.disconnect).toHaveBeenCalled();
    const latestObserver = MockIntersectionObserver.instances.at(-1)!;
    expect(latestObserver.disconnect).toHaveBeenCalled();
    expect(main.style.paddingBottom).toBe('');
  });

  it('ignora el viewport visual cuando no expone addEventListener', async () => {
    (window as any).visualViewport = { height: 760 } as VisualViewport;
    await createComponent();
    expect(component).toBeTruthy();
  });

  it('soporta ausencia de visualViewport', async () => {
    (window as any).visualViewport = undefined;
    await createComponent();
    expect(component).toBeTruthy();
  });
});
