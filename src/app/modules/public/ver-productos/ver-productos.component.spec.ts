import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { VerProductosComponent } from './ver-productos.component';
import { ProductoService } from '../../../core/services/producto.service';
import { Producto } from '../../../shared/models/producto.model';
import { UserService } from '../../../core/services/user.service';
import { ModalService } from '../../../core/services/modal.service';
import { Router } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';

describe('VerProductosComponent', () => {
  let component: VerProductosComponent;
  let fixture: ComponentFixture<VerProductosComponent>;
  let productoService: Partial<ProductoService>;

  beforeEach(async () => {
    const productosMock: Producto[] = [
      { productoId: 1, nombre: 'Coca Cola', precio: 10, cantidad: 1, categoria: 'Bebidas', subcategoria: 'Gaseosas' },
      { productoId: 2, nombre: 'Ensalada', precio: 15, cantidad: 1, categoria: 'Comidas', subcategoria: 'Entradas' }
    ];

    productoService = {
      getProductos: jest.fn().mockReturnValue(of({ data: productosMock, message: '' }))
    } as Partial<ProductoService>;

    await TestBed.configureTestingModule({
      imports: [VerProductosComponent],
      providers: [
        { provide: ProductoService, useValue: productoService },
        { provide: UserService, useValue: { getAuthState: () => of(false), getUserRole: () => null } },
        { provide: ModalService, useValue: {} },
        { provide: Router, useValue: { navigate: jest.fn() } },
        { provide: CartService, useValue: { addToCart: jest.fn() } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(VerProductosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load categories and subcategories', () => {
    expect(component.categorias).toEqual(['Bebidas', 'Comidas']);
    expect(component.subcategorias).toEqual(['Gaseosas', 'Entradas']);
  });
});
