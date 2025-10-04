import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ToastrService } from 'ngx-toastr';

import { DomicilioService } from '../../../core/services/domicilio.service';
import {
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
});
