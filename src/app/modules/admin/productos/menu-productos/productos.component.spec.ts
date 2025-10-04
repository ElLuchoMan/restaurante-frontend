import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavigationEnd, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Subject } from 'rxjs';

import { UserService } from '../../../../core/services/user.service';
import { createUserServiceMock } from '../../../../shared/mocks/test-doubles';
import { ProductosComponent } from './productos.component';

describe('ProductosComponent', () => {
  let component: ProductosComponent;
  let fixture: ComponentFixture<ProductosComponent>;
  let router: Router;
  let userService: any;

  beforeEach(async () => {
    userService = createUserServiceMock();

    await TestBed.configureTestingModule({
      imports: [ProductosComponent, RouterTestingModule],
      providers: [{ provide: UserService, useValue: userService }],
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(ProductosComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should update mostrarMenu on router events', () => {
    const events = router.events as Subject<any>;
    events.next(new NavigationEnd(1, '/admin/productos', '/admin/productos'));
    expect(component.mostrarMenu).toBe(true);

    events.next(new NavigationEnd(2, '/admin/productos/crear', '/admin/productos/crear'));
    expect(component.mostrarMenu).toBe(false);
  });

  it('should set esAdmin to true for Administrador role', () => {
    userService.getUserRole.mockReturnValue('Administrador');
    fixture.detectChanges();
    expect(component.esAdmin).toBe(true);
  });

  it('should redirect to crear when not admin and no menu', () => {
    userService.getUserRole.mockReturnValue('Cliente');
    component.mostrarMenu = false;
    const navegarASpy = jest.spyOn(component, 'navegarA');
    fixture.detectChanges();
    expect(navegarASpy).toHaveBeenCalledWith('/admin/productos/crear');
  });

  it('should have 3 options in the menu', () => {
    expect(component.opciones).toHaveLength(3);
  });

  it('should include categorias option in menu', () => {
    const categoriasOption = component.opciones.find(
      (op) => op.ruta === '/admin/productos/categorias',
    );
    expect(categoriasOption).toBeDefined();
    expect(categoriasOption?.titulo).toBe('Gestionar Categorías');
    expect(categoriasOption?.icono).toBe('fa-tags');
    expect(categoriasOption?.color).toBe('orange');
  });

  it('navegarA should navigate to the specified route', () => {
    const navigateSpy = jest.spyOn(router, 'navigate');
    component.navegarA('/admin/productos/categorias');
    expect(navigateSpy).toHaveBeenCalledWith(['/admin/productos/categorias']);
  });

  it('volver should navigate to /admin/productos', () => {
    const navigateSpy = jest.spyOn(router, 'navigate');
    component.volver();
    expect(navigateSpy).toHaveBeenCalledWith(['/admin/productos']);
  });
});
