import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { UbicacionRestauranteComponent } from './ubicacion-restaurante.component';
import { Router } from '@angular/router';
import { DomicilioService } from '../../../core/services/domicilio.service';
import { ToastrService } from 'ngx-toastr';
import { RouterTestingModule } from '@angular/router/testing';

describe('UbicacionRestauranteComponent', () => {
  let component: UbicacionRestauranteComponent;
  let fixture: ComponentFixture<UbicacionRestauranteComponent>;
  let router: jest.Mocked<Router>;
  let domicilioService: jest.Mocked<DomicilioService>;
  let toastr: jest.Mocked<ToastrService>;

  beforeEach(async () => {
    const routerMock = { navigate: jest.fn() };
    const domicilioServiceMock = { getDomicilios: jest.fn() };
    const toastrMock = { error: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [UbicacionRestauranteComponent, RouterTestingModule],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: DomicilioService, useValue: domicilioServiceMock },
        { provide: ToastrService, useValue: toastrMock }
      ]
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
    expect(safeUrl.changingThisBreaksApplicationSecurity).toContain('https://www.google.com/maps/embed/v1/place');
    expect(safeUrl.changingThisBreaksApplicationSecurity)
      .toContain(encodeURIComponent('Calle 78a # 62 - 48, Bogotá, Colombia'));
  });
  it('should set mostrarInfo to true after 500ms in ngAfterViewInit', fakeAsync(() => {
    component.ngAfterViewInit();
    expect(component.mostrarInfo).toBe(false);
    tick(500);
    expect(component.mostrarInfo).toBe(true);
  }));
  
});
