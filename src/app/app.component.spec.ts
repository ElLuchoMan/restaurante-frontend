import { HttpClient, HttpHandler } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, PLATFORM_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { BehaviorSubject, Subject } from 'rxjs';

import { AppComponent } from './app.component';
import { NativePushService } from './core/services/native-push.service';
import { NetworkService } from './core/services/network.service';
import { SeoService } from './core/services/seo.service';
import { WebPushService } from './core/services/web-push.service';
import {
  createNativePushServiceMock,
  createNetworkServiceMock,
  createRouterWithEventsMock,
  createSeoServiceMock,
  createSpy,
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
  let routerEventsSubject: Subject<any>;
  let networkOnlineSubject: BehaviorSubject<boolean>;

  beforeEach(async () => {
    // Create subjects for observables
    routerEventsSubject = new Subject();
    networkOnlineSubject = new BehaviorSubject(true);

    // Create mocks
    mockRouter = createRouterWithEventsMock(routerEventsSubject.asObservable(), '/home');

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
        { provide: WebPushService, useValue: mockWebPushService },
        { provide: NativePushService, useValue: mockNativePushService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: PLATFORM_ID, useValue: 'browser' },
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
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    routerEventsSubject.complete();
    networkOnlineSubject.complete();
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
      await TestBed.configureTestingModule({
        imports: [AppComponent],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
        providers: [
          { provide: Router, useValue: mockRouter },
          { provide: NetworkService, useValue: mockNetworkService },
          { provide: SeoService, useValue: mockSeoService },
          { provide: ActivatedRoute, useValue: mockActivatedRoute },
          { provide: PLATFORM_ID, useValue: 'server' }, // Server platform
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
      }).compileComponents();

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
