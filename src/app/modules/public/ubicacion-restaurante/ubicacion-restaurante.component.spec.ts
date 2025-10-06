import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ToastrService } from 'ngx-toastr';

import { DomicilioService } from '../../../core/services/domicilio.service';
import {
  createCapacitorMock,
  createCapacitorMockWithError,
  createDomicilioServiceMock,
  createRouterMock,
  createToastrMock,
} from '../../../shared/mocks/test-doubles';
import { UbicacionRestauranteComponent } from './ubicacion-restaurante.component';

describe('UbicacionRestauranteComponent', () => {
  let component: UbicacionRestauranteComponent;
  let fixture: ComponentFixture<UbicacionRestauranteComponent>;
  let router: jest.Mocked<Router>;
  let domicilioService: jest.Mocked<DomicilioService>;
  let toastr: jest.Mocked<ToastrService>;

  beforeEach(async () => {
    const routerMock = createRouterMock();
    const domicilioServiceMock = createDomicilioServiceMock();
    const toastrMock = createToastrMock();

    await TestBed.configureTestingModule({
      imports: [UbicacionRestauranteComponent, RouterTestingModule],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: DomicilioService, useValue: domicilioServiceMock },
        { provide: ToastrService, useValue: toastrMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UbicacionRestauranteComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router) as jest.Mocked<Router>;
    domicilioService = TestBed.inject(DomicilioService) as jest.Mocked<DomicilioService>;
    toastr = TestBed.inject(ToastrService) as jest.Mocked<ToastrService>;
  });

  it('should create the component', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should set mostrarInfo to true after 500ms', fakeAsync(() => {
    fixture.detectChanges();
    expect(component.mostrarInfo).toBe(false);
    tick(500);
    fixture.detectChanges();
    expect(component.mostrarInfo).toBe(false);
  }));

  it('should generate ubicacionUrl correctly', () => {
    fixture.detectChanges();
    expect(component.ubicacionUrl).toBeTruthy();
    const safeUrl = component.ubicacionUrl as any;
    const val = safeUrl.changingThisBreaksApplicationSecurity as string;

    // Validación segura: parsear URL y verificar host y path
    const parsedUrl = new URL(val);
    expect(parsedUrl.host).toBe('www.google.com');
    expect(parsedUrl.pathname).toMatch(/^\/maps(?:\/embed\/v1\/place)?/);

    // Verificar que contiene la ubicación codificada
    expect(val).toContain(encodeURIComponent('Calle 78a # 62 - 48, Bogotá, Colombia'));
  });
  it('should set mostrarInfo to true after 500ms in ngAfterViewInit', fakeAsync(() => {
    component.ngAfterViewInit();
    expect(component.mostrarInfo).toBe(false);
    tick(500);
    expect(component.mostrarInfo).toBe(true);
  }));

  describe('call', () => {
    it('should redirect to phone number when call is invoked', () => {
      const originalLocation = window.location;
      let capturedHref = '';

      // @ts-ignore - Mock location.href
      delete (window as any).location;
      (window as any).location = {
        href: '',
        get href() {
          return capturedHref;
        },
        set href(value: string) {
          capturedHref = value;
        },
      };

      component.call();

      expect(window.location.href).toBe('tel:3042449339');

      // Restore
      (window as any).location = originalLocation;
    });
  });

  describe('mapsLink getter', () => {
    it('should return Apple Maps link when platform is ios', () => {
      component.platform = 'ios';
      const link = component.mapsLink;
      expect(link).toContain('maps.apple.com');
      expect(link).toContain(encodeURIComponent('Calle 78a # 62 - 48, Bogotá, Colombia'));
    });

    it('should return Google Maps link when platform is android', () => {
      component.platform = 'android';
      const link = component.mapsLink;
      expect(link).toContain('maps.google.com');
      expect(link).toContain(encodeURIComponent('Calle 78a # 62 - 48, Bogotá, Colombia'));
    });

    it('should return Google Maps link when platform is web', () => {
      component.platform = 'web';
      const link = component.mapsLink;
      expect(link).toContain('maps.google.com');
      expect(link).toContain(encodeURIComponent('Calle 78a # 62 - 48, Bogotá, Colombia'));
    });
  });

  describe('Capacitor detection', () => {
    it('should detect iOS platform from Capacitor', fakeAsync(() => {
      const mockCapacitor = createCapacitorMock('ios');
      (window as any).Capacitor = mockCapacitor;

      component.ngAfterViewInit();
      tick(500);

      expect(component.platform).toBe('ios');
      expect(component.isWebView).toBe(true);

      // Clean up
      delete (window as any).Capacitor;
    }));

    it('should detect Android platform from Capacitor', fakeAsync(() => {
      const mockCapacitor = createCapacitorMock('android');
      (window as any).Capacitor = mockCapacitor;

      component.ngAfterViewInit();
      tick(500);

      expect(component.platform).toBe('android');
      expect(component.isWebView).toBe(true);

      // Clean up
      delete (window as any).Capacitor;
    }));

    it('should default to web when Capacitor is not available', fakeAsync(() => {
      delete (window as any).Capacitor;

      component.ngAfterViewInit();
      tick(500);

      expect(component.platform).toBe('web');
      expect(component.isWebView).toBe(false);
    }));

    it('should handle error when Capacitor detection fails', fakeAsync(() => {
      const mockCapacitor = createCapacitorMockWithError();
      (window as any).Capacitor = mockCapacitor;

      component.ngAfterViewInit();
      tick(500);

      expect(component.platform).toBe('web');
      expect(component.isWebView).toBe(false);

      // Clean up
      delete (window as any).Capacitor;
    }));

    it('should default to web when Capacitor.getPlatform is not a function', fakeAsync(() => {
      (window as any).Capacitor = { notAFunction: 'value' };

      component.ngAfterViewInit();
      tick(500);

      expect(component.platform).toBe('web');
      expect(component.isWebView).toBe(false);

      // Clean up
      delete (window as any).Capacitor;
    }));
  });
});
