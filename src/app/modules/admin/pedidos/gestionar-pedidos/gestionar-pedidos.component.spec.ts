import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { createRouterMock } from '../../../../shared/mocks/test-doubles';
import { GestionarPedidosComponent } from './gestionar-pedidos.component';

describe('GestionarPedidosComponent', () => {
  let component: GestionarPedidosComponent;
  let fixture: ComponentFixture<GestionarPedidosComponent>;
  let router: jest.Mocked<Router>;

  beforeEach(async () => {
    const routerMock = createRouterMock();

    await TestBed.configureTestingModule({
      imports: [GestionarPedidosComponent],
      providers: [{ provide: Router, useValue: routerMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(GestionarPedidosComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router) as jest.Mocked<Router>;
    fixture.detectChanges();
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería tener el subtítulo correcto', () => {
    expect(component.subtitulo).toBe('Consulta y administra los pedidos del restaurante');
  });

  it('debería tener 3 opciones definidas', () => {
    expect(component.opciones).toHaveLength(3);
  });

  it('debería incluir la opción de Pedidos Activos', () => {
    const activos = component.opciones.find((op) => op.titulo === 'Pedidos Activos');
    expect(activos).toBeDefined();
    expect(activos?.ruta).toBe('/admin/pedidos/gestionar-pedidos/activos');
    expect(activos?.icono).toBe('fa-clock');
    expect(activos?.color).toBe('blue');
    expect(activos?.descripcion).toContain('pedidos activos');
  });

  it('debería incluir la opción de Buscar por Usuario', () => {
    const porUsuario = component.opciones.find((op) => op.titulo === 'Buscar por Usuario');
    expect(porUsuario).toBeDefined();
    expect(porUsuario?.ruta).toBe('/admin/pedidos/gestionar-pedidos/por-usuario');
    expect(porUsuario?.icono).toBe('fa-user');
    expect(porUsuario?.color).toBe('green');
    expect(porUsuario?.descripcion).toContain('historial de pedidos');
  });

  it('debería incluir la opción de Buscar por Fecha', () => {
    const porFecha = component.opciones.find((op) => op.titulo === 'Buscar por Fecha');
    expect(porFecha).toBeDefined();
    expect(porFecha?.ruta).toBe('/admin/pedidos/gestionar-pedidos/por-fecha');
    expect(porFecha?.icono).toBe('fa-calendar');
    expect(porFecha?.color).toBe('purple');
    expect(porFecha?.descripcion).toContain('rango de fechas');
  });

  describe('navegarA', () => {
    it('debería navegar a pedidos activos', () => {
      component.navegarA('/admin/pedidos/gestionar-pedidos/activos');
      expect(router.navigate).toHaveBeenCalledWith(['/admin/pedidos/gestionar-pedidos/activos']);
    });

    it('debería navegar a buscar por usuario', () => {
      component.navegarA('/admin/pedidos/gestionar-pedidos/por-usuario');
      expect(router.navigate).toHaveBeenCalledWith([
        '/admin/pedidos/gestionar-pedidos/por-usuario',
      ]);
    });

    it('debería navegar a buscar por fecha', () => {
      component.navegarA('/admin/pedidos/gestionar-pedidos/por-fecha');
      expect(router.navigate).toHaveBeenCalledWith(['/admin/pedidos/gestionar-pedidos/por-fecha']);
    });
  });

  describe('renderizado del template', () => {
    it('debería mostrar el título de la página', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const titulo = compiled.querySelector('.section-title');
      expect(titulo?.textContent).toContain('Gestionar Pedidos');
    });

    it('debería mostrar el subtítulo', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const subtitulo = compiled.querySelector('.subtitle');
      expect(subtitulo?.textContent).toContain(component.subtitulo);
    });

    it('debería renderizar todas las opciones del menú', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const menuCards = compiled.querySelectorAll('.menu-card');
      expect(menuCards.length).toBe(3);
    });

    it('debería llamar navegarA al hacer click en una opción', () => {
      const navegarSpy = jest.spyOn(component, 'navegarA');
      const compiled = fixture.nativeElement as HTMLElement;
      const firstCard = compiled.querySelector('.menu-card') as HTMLElement;

      firstCard.click();

      expect(navegarSpy).toHaveBeenCalledWith('/admin/pedidos/gestionar-pedidos/activos');
    });

    it('debería tener atributos de accesibilidad correctos', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const firstCard = compiled.querySelector('.menu-card') as HTMLElement;

      expect(firstCard.getAttribute('role')).toBe('button');
      expect(firstCard.getAttribute('tabindex')).toBe('0');
      expect(firstCard.getAttribute('aria-label')).toContain('Pedidos Activos');
    });
  });
});
