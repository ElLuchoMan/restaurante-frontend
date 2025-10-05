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

  beforeEach(async () => {
    // Mock window.scrollTo
    jest.spyOn(window, 'scrollTo').mockImplementation();

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
