import { Location } from '@angular/common';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, PLATFORM_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { SwPush, SwUpdate } from '@angular/service-worker';
import { BehaviorSubject, Subject } from 'rxjs';

import { AppComponent } from './app.component';
import { NativePushService } from './core/services/native-push.service';
import { NetworkService } from './core/services/network.service';
import { PushService } from './core/services/push.service';
import { SeoService } from './core/services/seo.service';
import { UserService } from './core/services/user.service';
import { WebPushService } from './core/services/web-push.service';
import {
  createCapacitorAppMock,
  createCapacitorMock,
  createLocationMock,
  createNativePushServiceMock,
  createNetworkServiceMock,
  createPushServiceMock,
  createRouterWithEventsMock,
  createSeoServiceMock,
  createSpy,
  createSwPushMock,
  createUserServiceMock,
  createWebPushServiceMock,
} from './shared/mocks/test-doubles';

const mockCapacitorApp = createCapacitorAppMock();

jest.mock('@capacitor/app', () => ({
  App: mockCapacitorApp,
}));

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let mockRouter: jest.Mocked<Router>;
  let mockNetworkService: jest.Mocked<NetworkService>;
  let mockSeoService: jest.Mocked<SeoService>;
  let mockActivatedRoute: jest.Mocked<ActivatedRoute>;
  let mockWebPushService: jest.Mocked<WebPushService>;
  let mockNativePushService: jest.Mocked<NativePushService>;
  let mockUserService: jest.Mocked<UserService>;
  let routerEventsSubject: Subject<any>;
  let networkOnlineSubject: BehaviorSubject<boolean>;
  let authStateSubject: BehaviorSubject<boolean>;
  let originalHistoryLengthDescriptor: PropertyDescriptor | undefined;

  beforeAll(() => {
    originalHistoryLengthDescriptor = Object.getOwnPropertyDescriptor(history, 'length');
  });

  beforeEach(async () => {
    // Mock window.scrollTo
    jest.spyOn(window, 'scrollTo').mockImplementation();

    mockCapacitorApp.addListener.mockReset();
    Object.defineProperty(history, 'length', {
      configurable: true,
      writable: true,
      value: 2,
    });

    // Create subjects for observables
    routerEventsSubject = new Subject();
    networkOnlineSubject = new BehaviorSubject(true);
    authStateSubject = new BehaviorSubject(false);

    // Create mocks
    mockRouter = createRouterWithEventsMock(routerEventsSubject.asObservable(), '/home');
    // Por defecto, navigateByUrl retorna una promesa resuelta con true
    mockRouter.navigateByUrl.mockResolvedValue(true as any);

    mockNetworkService = createNetworkServiceMock(true) as any;
    // Conectar el subject del test con el mock para emitir estados online/offline
    (mockNetworkService as any).isOnline$ = routerEventsSubject as any; // temp placeholder
    (mockNetworkService as any).isOnline$ = networkOnlineSubject.asObservable();

    mockSeoService = createSeoServiceMock() as any;

    mockWebPushService = createWebPushServiceMock() as any;
    (mockWebPushService.isSupported as jest.Mock).mockReturnValue(false);
    (mockWebPushService.getPermissionStatus as jest.Mock).mockReturnValue('default');
    (mockWebPushService.requestPermissionAndSubscribe as jest.Mock).mockResolvedValue(false);

    mockNativePushService = createNativePushServiceMock() as any;
    (mockNativePushService.init as jest.Mock).mockResolvedValue(undefined);

    mockUserService = createUserServiceMock(authStateSubject.asObservable());

    mockActivatedRoute = {
      snapshot: {
        data: { title: 'Home' },
        url: [],
        params: {},
        queryParams: {},
        fragment: null,
        outlet: 'primary',
        component: null,
        routeConfig: null,
        root: null as any,
        parent: null,
        firstChild: null,
        children: [],
        pathFromRoot: [],
        paramMap: null as any,
        queryParamMap: null as any,
      },
    } as any;

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: NetworkService, useValue: mockNetworkService },
        { provide: SeoService, useValue: mockSeoService },
        { provide: NativePushService, useValue: mockNativePushService },
        { provide: PushService, useValue: createPushServiceMock() },
        { provide: UserService, useValue: mockUserService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: Location, useValue: createLocationMock() },
        { provide: SwPush, useValue: createSwPushMock() },
        {
          provide: SwUpdate,
          useValue: {
            isEnabled: false,
            versionUpdates: { subscribe: () => ({ unsubscribe: () => {} }) },
          },
        },
        HttpClient,
        HttpHandler,
      ],
    })
      .overrideProvider(WebPushService, { useValue: mockWebPushService })
      .compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    routerEventsSubject.complete();
    networkOnlineSubject.complete();
    authStateSubject.complete();
    delete (window as any).Capacitor;
    mockCapacitorApp.addListener.mockReset();
    if (originalHistoryLengthDescriptor) {
      Object.defineProperty(history, 'length', originalHistoryLengthDescriptor);
    } else {
      delete (history as any).length;
    }
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it(`should have title as 'restaurante-frontend'`, () => {
    expect(component.title).toEqual('restaurante-frontend');
  });

  it('should render the router outlet', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('router-outlet')).not.toBeNull();
  });

  describe('ngOnInit', () => {
    beforeEach(() => {
      // Mock document.getElementById
      const mockMainElement = { focus: createSpy() } as any;
      jest.spyOn(document, 'getElementById').mockReturnValue(mockMainElement as any);
    });

    it('should return early if not in browser platform', async () => {
      // Arrange - Create a separate TestBed for server platform
      await TestBed.resetTestingModule();
      const serverMockWebPushService = createWebPushServiceMock() as any;
      (serverMockWebPushService.isSupported as jest.Mock).mockReturnValue(false);

      await TestBed.configureTestingModule({
        imports: [AppComponent],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
        providers: [
          { provide: Router, useValue: mockRouter },
          { provide: NetworkService, useValue: mockNetworkService },
          { provide: SeoService, useValue: mockSeoService },
          { provide: NativePushService, useValue: mockNativePushService },
          { provide: PushService, useValue: createPushServiceMock() },
          { provide: ActivatedRoute, useValue: mockActivatedRoute },
          { provide: PLATFORM_ID, useValue: 'server' }, // Server platform
          { provide: SwPush, useValue: createSwPushMock() },
          {
            provide: SwUpdate,
            useValue: {
              isEnabled: false,
              versionUpdates: { subscribe: () => ({ unsubscribe: () => {} }) },
            },
          },
          HttpClient,
          HttpHandler,
        ],
      })
        .overrideProvider(WebPushService, { useValue: serverMockWebPushService })
        .compileComponents();

      const serverFixture = TestBed.createComponent(AppComponent);
      const serverComponent = serverFixture.componentInstance;

      // Act
      serverComponent.ngOnInit();

      // Assert - no subscriptions should be set up
      expect(mockSeoService.applyForRoute).not.toHaveBeenCalled();
    });

    it('should handle NavigationEnd events correctly', () => {
      // Arrange
      const mockMainElement = document.getElementById('main');

      // Act
      component.ngOnInit();
      routerEventsSubject.next(new NavigationEnd(1, '/home', '/home'));

      // Assert
      expect(mockMainElement?.focus).toHaveBeenCalled();
      expect(mockSeoService.applyForRoute).toHaveBeenCalledWith(
        mockActivatedRoute.snapshot,
        '/home',
      );
      expect(mockSeoService.updateCanonical).toHaveBeenCalledWith('/home');
      expect(mockNetworkService.setLastOnlinePath).toHaveBeenCalledWith('/home');
    });

    it('should not set last online path when network is offline', () => {
      // Arrange
      mockNetworkService.current = false;

      // Act
      component.ngOnInit();
      routerEventsSubject.next(new NavigationEnd(1, '/home', '/home'));

      // Assert
      expect(mockNetworkService.setLastOnlinePath).not.toHaveBeenCalled();
    });

    it('should ignore non-NavigationEnd events', () => {
      // Act
      component.ngOnInit();
      routerEventsSubject.next({ type: 'other-event' });

      // Assert
      expect(mockSeoService.applyForRoute).not.toHaveBeenCalled();
    });

    it('should handle network going offline', () => {
      // Act
      component.ngOnInit();
      networkOnlineSubject.next(false);

      // Assert
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/offline']);
    });

    it('should handle network coming back online with previous path', () => {
      // Arrange
      mockNetworkService.consumeLastOnlinePath.mockReturnValue('/menu');

      // Act
      component.ngOnInit();
      networkOnlineSubject.next(false); // Go offline first
      networkOnlineSubject.next(true); // Come back online

      // Assert
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/menu');
    });

    it('should navigate to home when coming online without previous path', () => {
      // Arrange
      mockNetworkService.consumeLastOnlinePath.mockReturnValue(null);

      // Act
      component.ngOnInit();
      networkOnlineSubject.next(false); // Go offline first
      networkOnlineSubject.next(true); // Come back online

      // Assert
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
    });

    it('should navigate to home when previous path was offline', () => {
      // Arrange
      mockNetworkService.consumeLastOnlinePath.mockReturnValue('/offline');

      // Act
      component.ngOnInit();
      networkOnlineSubject.next(false); // Go offline first
      networkOnlineSubject.next(true); // Come back online

      // Assert
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
    });

    it('should not redirect when online without being offline first', () => {
      // Act
      component.ngOnInit();
      networkOnlineSubject.next(true); // Stay online

      // Assert
      expect(mockRouter.navigateByUrl).not.toHaveBeenCalled();
      expect(mockRouter.navigate).not.toHaveBeenCalledWith(['/home']);
    });

    it('should set up isLoggedOut$ observable', () => {
      // Act
      component.ngOnInit();

      // Assert
      expect(component.isLoggedOut$).toBeDefined();
    });

    it('should emit login state changes through isLoggedOut$', async () => {
      // Act
      component.ngOnInit();

      const received: boolean[] = [];
      const subscription = component.isLoggedOut$.subscribe((value) => received.push(value));
      authStateSubject.next(true);
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Assert
      expect(received).toEqual([true, false]);

      subscription.unsubscribe();
    });

    it('should set up isHome$ observable', () => {
      // Act
      component.ngOnInit();

      // Assert
      expect(component.isHome$).toBeDefined();
    });

    it('should set up showGlobalBack$ observable', () => {
      // Act
      component.ngOnInit();

      // Assert
      expect(component.showGlobalBack$).toBeDefined();
    });

    it('should evaluate showGlobalBack$ when router url is falsy', () => {
      // Arrange
      mockRouter.url = '';

      // Act
      component.ngOnInit();

      const values: boolean[] = [];
      const subscription = component.showGlobalBack$.subscribe((value) =>
        values.push(value),
      );
      routerEventsSubject.next(new NavigationEnd(1, '', ''));

      // Assert
      expect(values[0]).toBe(true);

      subscription.unsubscribe();
    });

    it('should detect WebView environment', () => {
      // Arrange
      (window as any).Capacitor = createCapacitorMock('android');

      // Act
      component.ngOnInit();

      // Assert
      expect(component.isWebView).toBe(true);

      // Cleanup
      delete (window as any).Capacitor;
    });

    it('should not detect WebView when platform is web', () => {
      // Arrange
      (window as any).Capacitor = createCapacitorMock('web');

      // Act
      component.ngOnInit();

      // Assert
      expect(component.isWebView).toBe(false);

      // Cleanup
      delete (window as any).Capacitor;
    });

    it('should not detect WebView when Capacitor is not available', () => {
      // Arrange
      delete (window as any).Capacitor;

      // Act
      component.ngOnInit();

      // Assert
      expect(component.isWebView).toBe(false);
    });

    it('should initialize web push when supported and granted', async () => {
      // Arrange
      (mockWebPushService.isSupported as jest.Mock).mockReturnValue(true);
      (mockWebPushService.getPermissionStatus as jest.Mock).mockReturnValue('granted');

      // Act
      component.ngOnInit();

      // Wait for async initialization
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Assert
      expect(mockWebPushService.requestPermissionAndSubscribe).toHaveBeenCalled();
    });

    it('should handle push initialization errors gracefully', async () => {
      // Arrange
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      (mockWebPushService.isSupported as jest.Mock).mockReturnValue(true);
      (mockWebPushService.getPermissionStatus as jest.Mock).mockReturnValue('granted');
      (mockWebPushService.requestPermissionAndSubscribe as jest.Mock).mockRejectedValue(
        new Error('Push init failed'),
      );

      // Act
      component.ngOnInit();

      // Wait for async initialization
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[AppComponent] Error inicializando push:',
        expect.any(Error),
      );

      consoleErrorSpy.mockRestore();
    });

    it('should re-register web push when user logs in with granted permission', async () => {
      // Arrange
      (mockWebPushService.getPermissionStatus as jest.Mock).mockReturnValue('granted');

      // Act
      component.ngOnInit();
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Simulate user login
      authStateSubject.next(true);
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Assert
      expect(mockWebPushService.requestPermissionAndSubscribe).toHaveBeenCalled();
    });

    it('should handle popstate event', () => {
      // Arrange
      Object.defineProperty(history, 'length', { writable: true, value: 1 });

      // Act
      component.ngOnInit();
      window.dispatchEvent(new PopStateEvent('popstate'));

      // Assert
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
    });

    it('should not navigate home on popstate when history has entries', () => {
      // Arrange
      component.ngOnInit();
      mockRouter.navigate.mockClear();
      Object.defineProperty(history, 'length', {
        configurable: true,
        writable: true,
        value: 2,
      });

      // Act
      window.dispatchEvent(new PopStateEvent('popstate'));

      // Assert
      expect(mockRouter.navigate).not.toHaveBeenCalledWith(['/home']);
    });

    it('should handle push-notification-action event with valid URL', async () => {
      // Arrange
      mockRouter.navigateByUrl.mockResolvedValue(true);
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      // Act
      component.ngOnInit();
      const event = new CustomEvent('push-notification-action', {
        detail: { url: '/menu' },
      });
      window.dispatchEvent(event);

      await new Promise((resolve) => setTimeout(resolve, 50));

      // Assert
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/menu');

      consoleLogSpy.mockRestore();
    });

    it('should ignore push-notification-action event without URL', () => {
      // Arrange
      mockRouter.navigateByUrl.mockClear();

      // Act
      component.ngOnInit();
      const event = new CustomEvent('push-notification-action', {
        detail: { url: null },
      });
      window.dispatchEvent(event);

      // Assert
      expect(mockRouter.navigateByUrl).not.toHaveBeenCalled();
    });

    it('should handle window.scrollTo with fallback', () => {
      // Arrange
      const scrollToSpy = jest.spyOn(window, 'scrollTo');
      scrollToSpy.mockImplementationOnce(() => {
        throw new Error('Not supported');
      });

      // Act
      component.ngOnInit();
      routerEventsSubject.next(new NavigationEnd(1, '/home', '/home'));

      // Assert - should have been called at least twice (once failed, once fallback)
      expect(scrollToSpy).toHaveBeenCalled();
    });

    it('should initialize native push in WebView environment', async () => {
      // Arrange
      (window as any).Capacitor = createCapacitorMock('android');

      // Act
      component.ngOnInit();

      // Wait for async initialization
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Assert
      expect(mockNativePushService.init).toHaveBeenCalled();

      // Cleanup
      delete (window as any).Capacitor;
    });

    it('should re-register native push when user logs in in WebView', async () => {
      // Arrange
      (window as any).Capacitor = createCapacitorMock('android');

      // Act
      component.ngOnInit();
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Simulate user login
      authStateSubject.next(true);
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Assert
      expect(mockNativePushService.init).toHaveBeenCalledTimes(2);

      // Cleanup
      delete (window as any).Capacitor;
    });

    it('should handle native push initialization error gracefully in WebView', async () => {
      // Arrange
      (window as any).Capacitor = createCapacitorMock('android');
      (mockNativePushService.init as jest.Mock).mockRejectedValueOnce(
        new Error('Native push init failed'),
      );

      // Act
      component.ngOnInit();

      // Simulate user login
      authStateSubject.next(true);
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Assert - should not throw
      expect(mockNativePushService.init).toHaveBeenCalled();

      // Cleanup
      delete (window as any).Capacitor;
    });

    it('should emit true for isHome$ when navigating to /', async () => {
      // Arrange
      let isHomeValue: boolean | undefined;
      mockRouter.url = '/';

      // Act
      component.ngOnInit();
      component.isHome$.subscribe((val) => (isHomeValue = val));
      routerEventsSubject.next(new NavigationEnd(1, '/', '/'));

      // Assert
      expect(isHomeValue).toBe(true);
    });

    it('should emit true for isHome$ when navigating to /home', async () => {
      // Arrange
      let isHomeValue: boolean | undefined;
      mockRouter.url = '/home';

      // Act
      component.ngOnInit();
      component.isHome$.subscribe((val) => (isHomeValue = val));
      routerEventsSubject.next(new NavigationEnd(1, '/home', '/home'));

      // Assert
      expect(isHomeValue).toBe(true);
    });

    it('should emit true for isHome$ when navigating to /home/section', async () => {
      // Arrange
      let isHomeValue: boolean | undefined;
      mockRouter.url = '/home/section';

      // Act
      component.ngOnInit();
      component.isHome$.subscribe((val) => (isHomeValue = val));
      routerEventsSubject.next(new NavigationEnd(1, '/home/section', '/home/section'));

      // Assert
      expect(isHomeValue).toBe(true);
    });

    it('should emit false for isHome$ when navigating to /menu', async () => {
      // Arrange
      let isHomeValue: boolean | undefined;
      mockRouter.url = '/menu';

      // Act
      component.ngOnInit();
      component.isHome$.subscribe((val) => (isHomeValue = val));
      routerEventsSubject.next(new NavigationEnd(1, '/menu', '/menu'));

      // Assert
      expect(isHomeValue).toBe(false);
    });

    it('should emit false for showGlobalBack$ when at home', async () => {
      // Arrange
      let showBackValue: boolean | undefined;
      mockRouter.url = '/';

      // Act
      component.ngOnInit();
      component.showGlobalBack$.subscribe((val) => (showBackValue = val));
      routerEventsSubject.next(new NavigationEnd(1, '/', '/'));

      // Assert
      expect(showBackValue).toBe(false);
    });

    it('should emit false for showGlobalBack$ when at login', async () => {
      // Arrange
      let showBackValue: boolean | undefined;
      mockRouter.url = '/login';

      // Act
      component.ngOnInit();
      component.showGlobalBack$.subscribe((val) => (showBackValue = val));
      routerEventsSubject.next(new NavigationEnd(1, '/login', '/login'));

      // Assert
      expect(showBackValue).toBe(false);
    });

    it('should emit false for showGlobalBack$ when at registro-cliente', async () => {
      // Arrange
      let showBackValue: boolean | undefined;
      mockRouter.url = '/registro-cliente';

      // Act
      component.ngOnInit();
      component.showGlobalBack$.subscribe((val) => (showBackValue = val));
      routerEventsSubject.next(new NavigationEnd(1, '/registro-cliente', '/registro-cliente'));

      // Assert
      expect(showBackValue).toBe(false);
    });

    it('should emit false for showGlobalBack$ when at admin/registro-admin', async () => {
      // Arrange
      let showBackValue: boolean | undefined;
      mockRouter.url = '/admin/registro-admin';

      // Act
      component.ngOnInit();
      component.showGlobalBack$.subscribe((val) => (showBackValue = val));
      routerEventsSubject.next(
        new NavigationEnd(1, '/admin/registro-admin', '/admin/registro-admin'),
      );

      // Assert
      expect(showBackValue).toBe(false);
    });

    it('should emit true for showGlobalBack$ when at other routes', async () => {
      // Arrange
      let showBackValue: boolean | undefined;
      mockRouter.url = '/menu';

      // Act
      component.ngOnInit();
      component.showGlobalBack$.subscribe((val) => (showBackValue = val));
      routerEventsSubject.next(new NavigationEnd(1, '/menu', '/menu'));

      // Assert
      expect(showBackValue).toBe(true);
    });

    it('should handle showGlobalBack$ with query params', async () => {
      // Arrange
      let showBackValue: boolean | undefined;
      mockRouter.url = '/menu?category=bebidas';

      // Act
      component.ngOnInit();
      component.showGlobalBack$.subscribe((val) => (showBackValue = val));
      routerEventsSubject.next(new NavigationEnd(1, '/menu?category=bebidas', '/menu'));

      // Assert
      expect(showBackValue).toBe(true);
    });

    it('should handle push-notification-action with navigation failure', async () => {
      // Arrange
      mockRouter.navigateByUrl.mockResolvedValue(false);
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      // Act
      component.ngOnInit();
      const event = new CustomEvent('push-notification-action', {
        detail: { url: '/invalid-route' },
      });
      window.dispatchEvent(event);

      await new Promise((resolve) => setTimeout(resolve, 50));

      // Assert
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[AppComponent] Navigation failed, URL might not exist:',
        '/invalid-route',
      );

      consoleWarnSpy.mockRestore();
    });

    it('should handle push-notification-action with navigation error', async () => {
      // Arrange
      mockRouter.navigateByUrl.mockRejectedValue(new Error('Navigation error'));
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act
      component.ngOnInit();
      const event = new CustomEvent('push-notification-action', {
        detail: { url: '/error-route' },
      });
      window.dispatchEvent(event);

      await new Promise((resolve) => setTimeout(resolve, 50));

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[AppComponent] Navigation error:',
        expect.any(Error),
      );

      consoleErrorSpy.mockRestore();
    });

    it('should ignore push-notification-action with empty string URL', () => {
      // Arrange
      mockRouter.navigateByUrl.mockClear();

      // Act
      component.ngOnInit();
      const event = new CustomEvent('push-notification-action', {
        detail: { url: '' },
      });
      window.dispatchEvent(event);

      // Assert
      expect(mockRouter.navigateByUrl).not.toHaveBeenCalled();
    });

    it('should ignore push-notification-action without detail', () => {
      // Arrange
      mockRouter.navigateByUrl.mockClear();

      // Act
      component.ngOnInit();
      const event = new CustomEvent('push-notification-action', {});
      window.dispatchEvent(event);

      // Assert
      expect(mockRouter.navigateByUrl).not.toHaveBeenCalled();
    });

    it('should handle Capacitor App backButton at root', async () => {
      // Arrange
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      mockRouter.url = '/';
      (window as any).Capacitor = createCapacitorMock('android');

      // Act
      component.ngOnInit();
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Assert
      expect(mockCapacitorApp.addListener).toHaveBeenCalledWith(
        'backButton',
        expect.any(Function),
      );
      const backButtonHandler = mockCapacitorApp.addListener.mock.calls[0][1];

      Object.defineProperty(history, 'length', {
        configurable: true,
        writable: true,
        value: 1,
      });
      backButtonHandler();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);

      consoleLogSpy.mockRestore();
    });

    it('should handle Capacitor App backButton at non-root', async () => {
      // Arrange
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      const mockLocation = TestBed.inject(Location) as jest.Mocked<any>;
      mockRouter.url = '/menu';
      (window as any).Capacitor = createCapacitorMock('android');

      // Act
      component.ngOnInit();
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(mockCapacitorApp.addListener).toHaveBeenCalledWith(
        'backButton',
        expect.any(Function),
      );
      const backButtonHandler = mockCapacitorApp.addListener.mock.calls[0][1];
      backButtonHandler();

      expect(mockLocation.back).toHaveBeenCalled();
      consoleLogSpy.mockRestore();
    });

    it('should fallback to empty url when handling Capacitor backButton', async () => {
      // Arrange
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      const mockLocation = TestBed.inject(Location) as jest.Mocked<any>;
      mockRouter.url = '';
      (window as any).Capacitor = createCapacitorMock('android');

      // Act
      component.ngOnInit();
      await new Promise((resolve) => setTimeout(resolve, 50));

      const backButtonHandler = mockCapacitorApp.addListener.mock.calls[0][1];
      backButtonHandler();

      // Assert
      expect(mockLocation.back).toHaveBeenCalled();
      consoleLogSpy.mockRestore();
    });

    it('should not add Capacitor backButton listener when platform is web', async () => {
      // Arrange
      (window as any).Capacitor = createCapacitorMock('web');

      // Act
      component.ngOnInit();
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Assert - listener should not be registered
      expect(mockCapacitorApp.addListener).not.toHaveBeenCalled();
    });

    it('should handle Capacitor listener errors gracefully', async () => {
      // Arrange
      (window as any).Capacitor = createCapacitorMock('android');
      mockCapacitorApp.addListener.mockImplementationOnce(() => {
        throw new Error('Listener failed');
      });

      // Act
      expect(() => component.ngOnInit()).not.toThrow();
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Assert - even after the error the component remains stable
      expect(mockCapacitorApp.addListener).toHaveBeenCalled();
    });

    it('should not re-register web push when permission is denied', async () => {
      // Arrange
      (mockWebPushService.getPermissionStatus as jest.Mock).mockReturnValue('denied');

      // Act
      component.ngOnInit();
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Simulate user login
      authStateSubject.next(true);
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Assert
      expect(mockWebPushService.requestPermissionAndSubscribe).not.toHaveBeenCalled();
    });
  });

  describe('goBack', () => {
    it('should call location.back', () => {
      // Arrange
      const locationMock = TestBed.inject(Location) as jest.Mocked<any>;

      // Act
      component.goBack();

      // Assert
      expect(locationMock.back).toHaveBeenCalled();
    });
  });

  describe('ngOnDestroy', () => {
    it('should complete destroy subject', () => {
      // Arrange
      const nextSpy = jest.spyOn(component['destroy$'], 'next');
      const completeSpy = jest.spyOn(component['destroy$'], 'complete');

      // Act
      component.ngOnDestroy();

      // Assert
      expect(nextSpy).toHaveBeenCalled();
      expect(completeSpy).toHaveBeenCalled();
    });
  });
});
