import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, NavigationEnd } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Subject } from 'rxjs';

import { ProductosComponent } from './productos.component';
import { UserService } from '../../../../core/services/user.service';

describe('ProductosComponent', () => {
  let component: ProductosComponent;
  let fixture: ComponentFixture<ProductosComponent>;
  let router: Router;
  let userService: { getUserRole: jest.Mock };

  beforeEach(async () => {
    userService = { getUserRole: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [ProductosComponent, RouterTestingModule],
      providers: [{ provide: UserService, useValue: userService }]
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
    const irASpy = jest.spyOn(component, 'irA');
    fixture.detectChanges();
    expect(irASpy).toHaveBeenCalledWith('crear');
  });

  it('irA ver should navigate to /menu', () => {
    const navigateSpy = jest.spyOn(router, 'navigate');
    component.irA('ver');
    expect(navigateSpy).toHaveBeenCalledWith(['/menu']);
  });

  it('irA crear should navigate to admin/productos/crear', () => {
    const navigateSpy = jest.spyOn(router, 'navigate');
    component.irA('crear');
    expect(navigateSpy).toHaveBeenCalledWith(['admin/productos/crear']);
  });

  it('volver should navigate to /admin/productos', () => {
    const navigateSpy = jest.spyOn(router, 'navigate');
    component.volver();
    expect(navigateSpy).toHaveBeenCalledWith(['/admin/productos']);
  });
});
