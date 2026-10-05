import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { createRouterMock } from '../../../../shared/mocks/test-doubles';
import { GestionarPagosComponent } from './gestionar-pagos.component';

describe('GestionarPagosComponent', () => {
  let component: GestionarPagosComponent;
  let fixture: ComponentFixture<GestionarPagosComponent>;
  let router: jest.Mocked<Router>;

  beforeEach(async () => {
    const routerMock = createRouterMock();

    await TestBed.configureTestingModule({
      imports: [GestionarPagosComponent],
      providers: [{ provide: Router, useValue: routerMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(GestionarPagosComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router) as jest.Mocked<Router>;
    fixture.detectChanges();
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería tener el subtítulo correcto', () => {
    expect(component.subtitulo).toBe(
      'Consulta, ordena y agrupa información de pagos y transacciones',
    );
  });

  it('debería tener 4 opciones definidas', () => {
    expect(component.opciones).toHaveLength(4);
  });

  it('debería incluir la opción de Pagos del Día', () => {
    const delDia = component.opciones.find((op) => op.titulo === 'Pagos del Día');
    expect(delDia).toBeDefined();
    expect(delDia?.ruta).toBe('/admin/pedidos/gestionar-pagos/del-dia');
    expect(delDia?.icono).toBe('fa-calendar-day');
    expect(delDia?.color).toBe('blue');
    expect(delDia?.descripcion).toContain('pagos realizados');
  });

  it('debería incluir la opción de Buscar por Fecha', () => {
    const porFecha = component.opciones.find((op) => op.titulo === 'Buscar por Fecha');
    expect(porFecha).toBeDefined();
    expect(porFecha?.ruta).toBe('/admin/pedidos/gestionar-pagos/por-fecha');
    expect(porFecha?.icono).toBe('fa-calendar');
    expect(porFecha?.color).toBe('green');
    expect(porFecha?.descripcion).toContain('rango de fechas');
  });

  it('debería incluir la opción de Buscar por Método de Pago', () => {
    const porMetodo = component.opciones.find((op) => op.titulo === 'Buscar por Método de Pago');
    expect(porMetodo).toBeDefined();
    expect(porMetodo?.ruta).toBe('/admin/pedidos/gestionar-pagos/por-metodo');
    expect(porMetodo?.icono).toBe('fa-credit-card');
    expect(porMetodo?.color).toBe('purple');
    expect(porMetodo?.descripcion).toContain('efectivo, tarjeta');
  });

  it('debería incluir la opción de Agrupar y Ordenar', () => {
    const agrupar = component.opciones.find((op) => op.titulo === 'Agrupar y Ordenar');
    expect(agrupar).toBeDefined();
    expect(agrupar?.ruta).toBe('/admin/pedidos/gestionar-pagos/agrupar');
    expect(agrupar?.icono).toBe('fa-sort-amount-down');
    expect(agrupar?.color).toBe('orange');
    expect(agrupar?.descripcion).toContain('precio, fecha');
  });

  describe('navegarA', () => {
    it('debería navegar a pagos del día', () => {
      component.navegarA('/admin/pedidos/gestionar-pagos/del-dia');
      expect(router.navigate).toHaveBeenCalledWith(['/admin/pedidos/gestionar-pagos/del-dia']);
    });

    it('debería navegar a buscar por fecha', () => {
      component.navegarA('/admin/pedidos/gestionar-pagos/por-fecha');
      expect(router.navigate).toHaveBeenCalledWith(['/admin/pedidos/gestionar-pagos/por-fecha']);
    });

    it('debería navegar a buscar por método de pago', () => {
      component.navegarA('/admin/pedidos/gestionar-pagos/por-metodo');
      expect(router.navigate).toHaveBeenCalledWith(['/admin/pedidos/gestionar-pagos/por-metodo']);
    });

    it('debería navegar a agrupar y ordenar', () => {
      component.navegarA('/admin/pedidos/gestionar-pagos/agrupar');
      expect(router.navigate).toHaveBeenCalledWith(['/admin/pedidos/gestionar-pagos/agrupar']);
    });
  });

  describe('renderizado del template', () => {
    it('debería mostrar el título de la página', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const titulo = compiled.querySelector('.section-title');
      expect(titulo?.textContent).toContain('Gestionar Pagos');
    });

    it('debería mostrar el subtítulo', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const subtitulo = compiled.querySelector('.subtitle');
      expect(subtitulo?.textContent).toContain(component.subtitulo);
    });

    it('debería renderizar todas las opciones del menú', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const menuCards = compiled.querySelectorAll('.menu-card');
      expect(menuCards.length).toBe(4);
    });

    it('debería llamar navegarA al hacer click en una opción', () => {
      const navegarSpy = jest.spyOn(component, 'navegarA');
      const compiled = fixture.nativeElement as HTMLElement;
      const firstCard = compiled.querySelector('.menu-card') as HTMLElement;

      firstCard.click();

      expect(navegarSpy).toHaveBeenCalledWith('/admin/pedidos/gestionar-pagos/del-dia');
    });

    it('debería tener atributos de accesibilidad correctos', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const firstCard = compiled.querySelector('.menu-card') as HTMLElement;

      expect(firstCard.getAttribute('role')).toBe('button');
      expect(firstCard.getAttribute('tabindex')).toBe('0');
      expect(firstCard.getAttribute('aria-label')).toContain('Pagos del Día');
    });
  });
});
