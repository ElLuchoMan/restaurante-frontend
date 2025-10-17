import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { createRouterMock } from '../../../../shared/mocks/test-doubles';
import { MenuPedidosComponent } from './menu-pedidos.component';

describe('MenuPedidosComponent', () => {
  let component: MenuPedidosComponent;
  let fixture: ComponentFixture<MenuPedidosComponent>;
  let router: jest.Mocked<Router>;

  beforeEach(async () => {
    const routerMock = createRouterMock();

    await TestBed.configureTestingModule({
      imports: [MenuPedidosComponent],
      providers: [{ provide: Router, useValue: routerMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(MenuPedidosComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router) as jest.Mocked<Router>;
    fixture.detectChanges();
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería tener el subtítulo correcto', () => {
    expect(component.subtitulo).toBe('Gestiona pedidos, domicilios y pagos desde un solo lugar');
  });

  it('debería tener 3 opciones definidas', () => {
    expect(component.opciones).toHaveLength(3);
  });

  it('debería incluir la opción de Gestionar Pedidos', () => {
    const pedidos = component.opciones.find((op) => op.titulo === 'Gestionar Pedidos');
    expect(pedidos).toBeDefined();
    expect(pedidos?.ruta).toBe('/admin/pedidos/gestionar-pedidos');
    expect(pedidos?.icono).toBe('fa-clipboard-list');
    expect(pedidos?.color).toBe('blue');
    expect(pedidos?.descripcion).toContain('pedidos activos');
  });

  it('debería incluir la opción de Gestionar Domicilios', () => {
    const domicilios = component.opciones.find((op) => op.titulo === 'Gestionar Domicilios');
    expect(domicilios).toBeDefined();
    expect(domicilios?.ruta).toBe('/admin/pedidos/gestionar-domicilios');
    expect(domicilios?.icono).toBe('fa-truck');
    expect(domicilios?.color).toBe('green');
    expect(domicilios?.descripcion).toContain('domicilios');
  });

  it('debería incluir la opción de Gestionar Pagos', () => {
    const pagos = component.opciones.find((op) => op.titulo === 'Gestionar Pagos');
    expect(pagos).toBeDefined();
    expect(pagos?.ruta).toBe('/admin/pedidos/gestionar-pagos');
    expect(pagos?.icono).toBe('fa-credit-card');
    expect(pagos?.color).toBe('orange');
    expect(pagos?.descripcion).toContain('pagos');
  });

  describe('navegarA', () => {
    it('debería navegar a la ruta especificada', () => {
      component.navegarA('/admin/pedidos/gestionar-pedidos');
      expect(router.navigate).toHaveBeenCalledWith(['/admin/pedidos/gestionar-pedidos']);
    });

    it('debería navegar a gestionar-domicilios', () => {
      component.navegarA('/admin/pedidos/gestionar-domicilios');
      expect(router.navigate).toHaveBeenCalledWith(['/admin/pedidos/gestionar-domicilios']);
    });

    it('debería navegar a gestionar-pagos', () => {
      component.navegarA('/admin/pedidos/gestionar-pagos');
      expect(router.navigate).toHaveBeenCalledWith(['/admin/pedidos/gestionar-pagos']);
    });
  });

  describe('renderizado del template', () => {
    it('debería mostrar el título de la página', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const titulo = compiled.querySelector('.section-title');
      expect(titulo?.textContent).toContain('Gestión de Pedidos');
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

      expect(navegarSpy).toHaveBeenCalledWith('/admin/pedidos/gestionar-pedidos');
    });

    it('debería tener atributos de accesibilidad correctos', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const firstCard = compiled.querySelector('.menu-card') as HTMLElement;

      expect(firstCard.getAttribute('role')).toBe('button');
      expect(firstCard.getAttribute('tabindex')).toBe('0');
      expect(firstCard.getAttribute('aria-label')).toContain('Gestionar Pedidos');
    });
  });
});
