import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { createRouterMock } from '../../../../shared/mocks/test-doubles';
import { GestionarDomiciliosComponent } from './gestionar-domicilios.component';

describe('GestionarDomiciliosComponent', () => {
  let component: GestionarDomiciliosComponent;
  let fixture: ComponentFixture<GestionarDomiciliosComponent>;
  let router: jest.Mocked<Router>;

  beforeEach(async () => {
    const routerMock = createRouterMock();

    await TestBed.configureTestingModule({
      imports: [GestionarDomiciliosComponent],
      providers: [{ provide: Router, useValue: routerMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(GestionarDomiciliosComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router) as jest.Mocked<Router>;
    fixture.detectChanges();
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería tener el subtítulo correcto', () => {
    expect(component.subtitulo).toBe(
      'Consulta y administra los domicilios y entregas del restaurante',
    );
  });

  it('debería tener 5 opciones definidas', () => {
    expect(component.opciones).toHaveLength(5);
  });

  it('debería incluir la opción de Domicilios Activos', () => {
    const activos = component.opciones.find((op) => op.titulo === 'Domicilios Activos');
    expect(activos).toBeDefined();
    expect(activos?.ruta).toBe('/admin/pedidos/gestionar-domicilios/activos');
    expect(activos?.icono).toBe('fa-shipping-fast');
    expect(activos?.color).toBe('blue');
    expect(activos?.descripcion).toContain('domicilios en curso');
  });

  it('debería incluir la opción de Buscar por Usuario', () => {
    const porUsuario = component.opciones.find((op) => op.titulo === 'Buscar por Usuario');
    expect(porUsuario).toBeDefined();
    expect(porUsuario?.ruta).toBe('/admin/pedidos/gestionar-domicilios/por-usuario');
    expect(porUsuario?.icono).toBe('fa-user');
    expect(porUsuario?.color).toBe('green');
    expect(porUsuario?.descripcion).toContain('cliente');
  });

  it('debería incluir la opción de Buscar por Fecha', () => {
    const porFecha = component.opciones.find((op) => op.titulo === 'Buscar por Fecha');
    expect(porFecha).toBeDefined();
    expect(porFecha?.ruta).toBe('/admin/pedidos/gestionar-domicilios/por-fecha');
    expect(porFecha?.icono).toBe('fa-calendar');
    expect(porFecha?.color).toBe('purple');
    expect(porFecha?.descripcion).toContain('rango de fechas');
  });

  it('debería incluir la opción de Buscar por Domiciliario', () => {
    const porDomiciliario = component.opciones.find(
      (op) => op.titulo === 'Buscar por Domiciliario',
    );
    expect(porDomiciliario).toBeDefined();
    expect(porDomiciliario?.ruta).toBe('/admin/pedidos/gestionar-domicilios/por-domiciliario');
    expect(porDomiciliario?.icono).toBe('fa-motorcycle');
    expect(porDomiciliario?.color).toBe('orange');
    expect(porDomiciliario?.descripcion).toContain('repartidor específico');
  });

  it('debería incluir la opción de Buscar por Estado', () => {
    const porEstado = component.opciones.find((op) => op.titulo === 'Buscar por Estado');
    expect(porEstado).toBeDefined();
    expect(porEstado?.ruta).toBe('/admin/pedidos/gestionar-domicilios/por-estado');
    expect(porEstado?.icono).toBe('fa-tasks');
    expect(porEstado?.color).toBe('red');
    expect(porEstado?.descripcion).toContain('estado de entrega');
  });

  describe('navegarA', () => {
    it('debería navegar a domicilios activos', () => {
      component.navegarA('/admin/pedidos/gestionar-domicilios/activos');
      expect(router.navigate).toHaveBeenCalledWith(['/admin/pedidos/gestionar-domicilios/activos']);
    });

    it('debería navegar a buscar por usuario', () => {
      component.navegarA('/admin/pedidos/gestionar-domicilios/por-usuario');
      expect(router.navigate).toHaveBeenCalledWith([
        '/admin/pedidos/gestionar-domicilios/por-usuario',
      ]);
    });

    it('debería navegar a buscar por fecha', () => {
      component.navegarA('/admin/pedidos/gestionar-domicilios/por-fecha');
      expect(router.navigate).toHaveBeenCalledWith([
        '/admin/pedidos/gestionar-domicilios/por-fecha',
      ]);
    });

    it('debería navegar a buscar por domiciliario', () => {
      component.navegarA('/admin/pedidos/gestionar-domicilios/por-domiciliario');
      expect(router.navigate).toHaveBeenCalledWith([
        '/admin/pedidos/gestionar-domicilios/por-domiciliario',
      ]);
    });

    it('debería navegar a buscar por estado', () => {
      component.navegarA('/admin/pedidos/gestionar-domicilios/por-estado');
      expect(router.navigate).toHaveBeenCalledWith([
        '/admin/pedidos/gestionar-domicilios/por-estado',
      ]);
    });
  });

  describe('renderizado del template', () => {
    it('debería mostrar el título de la página', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const titulo = compiled.querySelector('.section-title');
      expect(titulo?.textContent).toContain('Gestionar Domicilios');
    });

    it('debería mostrar el subtítulo', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const subtitulo = compiled.querySelector('.subtitle');
      expect(subtitulo?.textContent).toContain(component.subtitulo);
    });

    it('debería renderizar todas las opciones del menú', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const menuCards = compiled.querySelectorAll('.menu-card');
      expect(menuCards.length).toBe(5);
    });

    it('debería llamar navegarA al hacer click en una opción', () => {
      const navegarSpy = jest.spyOn(component, 'navegarA');
      const compiled = fixture.nativeElement as HTMLElement;
      const firstCard = compiled.querySelector('.menu-card') as HTMLElement;

      firstCard.click();

      expect(navegarSpy).toHaveBeenCalledWith('/admin/pedidos/gestionar-domicilios/activos');
    });

    it('debería tener atributos de accesibilidad correctos', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const firstCard = compiled.querySelector('.menu-card') as HTMLElement;

      expect(firstCard.getAttribute('role')).toBe('button');
      expect(firstCard.getAttribute('tabindex')).toBe('0');
      expect(firstCard.getAttribute('aria-label')).toContain('Domicilios Activos');
    });
  });
});
