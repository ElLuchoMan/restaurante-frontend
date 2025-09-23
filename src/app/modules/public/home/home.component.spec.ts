import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TransferState } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject } from 'rxjs';

import { CartService } from '../../../core/services/cart.service';
import { UserService } from '../../../core/services/user.service';
import { HomeComponent } from './home.component';

class UserServiceStub {
  private auth$ = new BehaviorSubject<boolean>(false);
  getAuthState() {
    return this.auth$.asObservable();
  }
  setAuth(v: boolean) {
    this.auth$.next(v);
  }
}
class CartServiceStub {
  count$ = new BehaviorSubject<number>(0);
}

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let userStub: UserServiceStub;
  // TransferState stub sin jest.fn
  let hasKeyReturn: boolean;
  let setCalled: boolean;
  let tsStub: { hasKey: () => boolean; set: () => void };

  beforeEach(async () => {
    // Mock de IntersectionObserver global
    (window as any).IntersectionObserver = class {
      constructor(cb: any) {
        setTimeout(() => cb([{ isIntersecting: false }]), 0);
      }
      observe() {}
      disconnect() {}
    } as any;

    // Stub TransferState
    hasKeyReturn = false;
    setCalled = false;
    tsStub = {
      hasKey: () => hasKeyReturn,
      set: () => {
        setCalled = true;
      },
    };

    await TestBed.configureTestingModule({
      imports: [HomeComponent, RouterTestingModule, HttpClientTestingModule],
      providers: [
        { provide: UserService, useClass: UserServiceStub },
        { provide: CartService, useClass: CartServiceStub },
        { provide: TransferState, useValue: tsStub },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    userStub = TestBed.inject(UserService) as unknown as UserServiceStub;
  });

  it('debería crearse', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('muestra quick-actions propia sólo en navegador (no webview) y cuando invitado', () => {
    // isWebView = false implica navegador
    (component as any).isWebView = false as any;
    userStub.setAuth(false); // invitado
    fixture.detectChanges();
    const bar = fixture.debugElement.query(By.css('.quick-actions-bar'));
    expect(bar).toBeTruthy();
  });

  it('oculta quick-actions propia en webview', () => {
    // Simular entorno nativo (Capacitor no-web)
    (window as any).Capacitor = { getPlatform: () => 'android' };
    // Estados antes de render
    userStub.setAuth(false); // invitado
    fixture.detectChanges(); // dispara ngOnInit y calcula isWebView=true
    // La barra local no debe renderizarse en webview
    const bars = fixture.debugElement.queryAll(By.css('.quick-actions-bar'));
    expect(bars.length).toBe(0);
    // Limpieza
    delete (window as any).Capacitor;
  });

  it('detecta webview y añade clase al body; la remueve en ngOnDestroy', () => {
    (window as any).Capacitor = { getPlatform: () => 'android' };
    fixture.detectChanges();
    expect((component as any).isWebView).toBe(true);
    expect(document.body.classList.contains('is-native')).toBe(true);
    component.ngOnDestroy();
    expect(document.body.classList.contains('is-native')).toBe(false);
    delete (window as any).Capacitor;
  });

  it('no marca webview cuando getPlatform() retorna web', () => {
    (window as any).Capacitor = { getPlatform: () => 'web' };
    fixture.detectChanges();
    expect((component as any).isWebView).toBe(false);
    expect(document.body.classList.contains('is-native')).toBe(false);
    delete (window as any).Capacitor;
  });

  it('actualiza cartCount desde CartService', () => {
    fixture.detectChanges();
    const cart = TestBed.inject(CartService) as unknown as CartServiceStub;
    cart.count$.next(3);
    expect(component.cartCount).toBe(3);
  });

  it('al desloguearse inicializa el observer del footer; si se loguea desconecta', fakeAsync(() => {
    // Reemplazo de spy con bandera
    let initCalled = false;
    (component as any).initFooterObserver = () => {
      initCalled = true;
    };
    component.ngOnInit();
    userStub.setAuth(false); // invitado
    tick(0); // setTimeout(0)
    expect(initCalled).toBe(true);

    // preparar observer falso para probar desconexión
    let disconnectCalled = false;
    (component as any).footerObserver = {
      disconnect: () => {
        disconnectCalled = true;
      },
    } as any;
    userStub.setAuth(true); // autenticado
    tick(0);
    expect(disconnectCalled).toBe(true);
  }));

  it('ngAfterViewInit: crea Carousel y llama cycle; setea TransferState', fakeAsync(() => {
    // Agregar elemento del carrusel al DOM
    const el = document.createElement('div');
    el.id = 'header-carousel';
    document.body.appendChild(el);
    // Mock de bootstrap.Carousel sin jest.fn
    let cycleCalled = false;
    function cycle() {
      cycleCalled = true;
    }
    const Carousel = function (this: any) {
      (this as any).cycle = cycle;
      return this as any;
    } as any;
    (window as any).bootstrap = { Carousel };

    fixture.detectChanges(); // dispara ngOnInit
    component.ngAfterViewInit();
    // hasKey fue consultado implícitamente; verificamos el efecto (se llamó set)
    expect(setCalled).toBe(true);
    tick(100); // para el setTimeout de cycle
    expect(cycleCalled).toBe(true);

    // Limpieza
    document.body.removeChild(el);
    delete (window as any).bootstrap;
  }));

  it('ngAfterViewInit: cuando TransferState ya tiene la clave, retorna temprano', () => {
    // Forzar hasKey=true temporalmente
    hasKeyReturn = true;
    const localFixture = TestBed.createComponent(HomeComponent);
    const localComp = localFixture.componentInstance as any;
    // Reemplazar método con stub y bandera
    let initCalled = false;
    localComp.initFooterObserver = () => {
      initCalled = true;
    };
    localFixture.detectChanges();
    localComp.ngAfterViewInit();
    expect(initCalled).toBe(false);
    hasKeyReturn = false;
  });

  it('initFooterObserver: reintenta si no hay footer', fakeAsync(() => {
    // Asegurar entorno browser
    fixture.detectChanges();
    const attemptsBefore = (component as any).footerObserverInitAttempts;
    (component as any).initFooterObserver();
    tick(300);
    expect((component as any).footerObserverInitAttempts).toBeGreaterThan(attemptsBefore);
  }));

  it('initFooterObserver: oculta/muestra la barra al ver el footer', () => {
    // Render inicial (para que si la plantilla incluye la barra, exista)
    fixture.detectChanges();
    // Preparar DOM: footer
    const footerHost = document.createElement('app-footer');
    const footer = document.createElement('div');
    footer.className = 'footer';
    footer.getBoundingClientRect = () =>
      ({ top: 0, bottom: 10, left: 0, right: 0, width: 100, height: 10, x: 0, y: 0 }) as any;
    footerHost.appendChild(footer);
    document.body.appendChild(footerHost);

    // Capturar callback del mock de IntersectionObserver
    let cbRef: any;
    (window as any).IntersectionObserver = class {
      constructor(cb: any) {
        cbRef = cb;
      }
      observe() {}
      disconnect() {}
    } as any;

    (component as any).initFooterObserver();
    const bar = document.querySelector('.quick-actions-bar') as HTMLElement | null;
    if (!bar) {
      document.body.removeChild(footerHost);
      return;
    }
    // Simular footer visible
    cbRef([{ isIntersecting: true }]);
    expect(bar.classList.contains('qa-hidden')).toBe(true);
    // Simular footer no visible
    cbRef([{ isIntersecting: false }]);
    expect(bar.classList.contains('qa-hidden')).toBe(false);

    // Limpieza
    document.body.removeChild(footerHost);
  });

  it('renderiza topbar local sólo en navegador (no webview)', () => {
    (component as any).isWebView = false as any;
    fixture.detectChanges();
    const topbar = fixture.debugElement.query(By.css('.home-topbar'));
    expect(topbar).toBeTruthy();
  });
});
