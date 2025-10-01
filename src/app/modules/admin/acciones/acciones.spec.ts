import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { createRouterMock } from '../../../shared/mocks/test-doubles';
import { AccionesComponent } from './acciones';

describe('AccionesComponent', () => {
  let component: AccionesComponent;
  let fixture: ComponentFixture<AccionesComponent>;
  let router: jest.Mocked<Router>;

  beforeEach(async () => {
    const routerMock = createRouterMock();

    await TestBed.configureTestingModule({
      imports: [AccionesComponent],
      providers: [{ provide: Router, useValue: routerMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(AccionesComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router) as jest.Mocked<Router>;
    fixture.detectChanges();
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería tener 3 acciones definidas', () => {
    expect(component.acciones).toHaveLength(3);
  });

  it('debería incluir la acción de Telemetría', () => {
    const telemetria = component.acciones.find((a) => a.titulo === 'Telemetría');
    expect(telemetria).toBeDefined();
    expect(telemetria?.ruta).toBe('/admin/telemetria');
    expect(telemetria?.icono).toBe('fa-chart-line');
  });

  it('debería incluir la acción de Productos', () => {
    const productos = component.acciones.find((a) => a.titulo === 'Productos');
    expect(productos).toBeDefined();
    expect(productos?.ruta).toBe('/admin/productos');
    expect(productos?.icono).toBe('fa-utensils');
  });

  it('debería incluir la acción de Notificaciones', () => {
    const notificaciones = component.acciones.find((a) => a.titulo === 'Notificaciones');
    expect(notificaciones).toBeDefined();
    expect(notificaciones?.ruta).toBe('/admin/enviar-notificacion');
    expect(notificaciones?.icono).toBe('fa-bell');
    expect(notificaciones?.descripcion).toContain('clientes y trabajadores');
  });

  describe('navegarA', () => {
    it('debería navegar a la ruta especificada', () => {
      component.navegarA('/admin/telemetria');
      expect(router.navigate).toHaveBeenCalledWith(['/admin/telemetria']);
    });

    it('debería navegar a notificaciones', () => {
      component.navegarA('/admin/enviar-notificacion');
      expect(router.navigate).toHaveBeenCalledWith(['/admin/enviar-notificacion']);
    });
  });
});
