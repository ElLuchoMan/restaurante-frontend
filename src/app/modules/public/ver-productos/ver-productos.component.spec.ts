import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { CartService } from '../../../core/services/cart.service';
import { ModalService } from '../../../core/services/modal.service';
import { ProductoService } from '../../../core/services/producto.service';
import { UserService } from '../../../core/services/user.service';
import {
  createCartServiceMock,
  createModalServiceMock,
  createProductoServiceMock,
  createRouterMock,
  createUserServiceMock,
} from '../../../shared/mocks/test-doubles';
import { Producto } from '../../../shared/models/producto.model';
import { VerProductosComponent } from './ver-productos.component';

describe('VerProductosComponent', () => {
  let component: VerProductosComponent;
  let fixture: ComponentFixture<VerProductosComponent>;
  let productoService: any;
  let userService: any;
  let modalService: any;
  let router: any;
  let cartService: any;

  const productosMock: Producto[] = [
    {
      productoId: 1,
      nombre: 'Coca Cola',
      precio: 10,
      cantidad: 1,
      categoria: 'Bebidas',
      subcategoria: 'Gaseosas',
      calorias: 100,
    },
    {
      productoId: 2,
      nombre: 'Ensalada',
      precio: 15,
      cantidad: 1,
      categoria: 'Comidas',
      subcategoria: 'Entradas',
      calorias: 200,
    },
    {
      productoId: 3,
      nombre: 'Agua',
      precio: 5,
      cantidad: 1,
    },
  ];

  beforeEach(async () => {
    productoService = createProductoServiceMock();
    userService = createUserServiceMock();
    modalService = createModalServiceMock();
    router = createRouterMock();
    cartService = createCartServiceMock();

    await TestBed.configureTestingModule({
      imports: [VerProductosComponent],
      providers: [
        { provide: ProductoService, useValue: productoService },
        { provide: UserService, useValue: userService },
        { provide: ModalService, useValue: modalService },
        { provide: Router, useValue: router },
        { provide: CartService, useValue: cartService },
      ],
    }).compileComponents();
  });

  function createComponent() {
    fixture = TestBed.createComponent(VerProductosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('should create and load categories and subcategories', () => {
    productoService.getProductos.mockReturnValue(of({ data: productosMock, message: '' }));
    userService.getAuthState.mockReturnValue(of(false));

    createComponent();

    expect(component).toBeTruthy();
    expect(component.categorias).toEqual(['Bebidas', 'Comidas']);
    expect(component.subcategorias).toEqual(['Gaseosas', 'Entradas']);
  });

  it('should set mensaje when no data returned', () => {
    productoService.getProductos.mockReturnValue(of({ data: undefined, message: 'Error' }));
    userService.getAuthState.mockReturnValue(of(false));

    createComponent();

    expect(component.mensaje).toBe('Error');
  });

  it('should set userRole when user is logged in', () => {
    productoService.getProductos.mockReturnValue(of({ data: [], message: '' }));
    userService.getAuthState.mockReturnValue(of(true));
    userService.getUserRole.mockReturnValue('Cliente');

    createComponent();

    expect(component.userRole).toBe('Cliente');
  });

  it('should actualizar subcategorias based on categoriaSeleccionada', () => {
    productoService.getProductos.mockReturnValue(of({ data: productosMock, message: '' }));
    userService.getAuthState.mockReturnValue(of(false));

    createComponent();

    component.categoriaSeleccionada = 'Bebidas';
    component.actualizarSubcategorias();

    expect(component.subcategorias).toEqual(['Gaseosas']);
    expect(component.subcategoriaSeleccionada).toBe('');
  });

  it('should limpiar filtros and reset values', () => {
    productoService.getProductos.mockReturnValue(of({ data: productosMock, message: '' }));
    userService.getAuthState.mockReturnValue(of(false));

    createComponent();

    component.filtroNombre = 'Coca';
    component.categoriaSeleccionada = 'Bebidas';
    component.subcategoriaSeleccionada = 'Gaseosas';
    component.minCalorias = 50;
    component.maxCalorias = 150;

    component.limpiarFiltros();

    expect(component.filtroNombre).toBe('');
    expect(component.categoriaSeleccionada).toBe('');
    expect(component.subcategoriaSeleccionada).toBe('');
    expect(component.minCalorias).toBeUndefined();
    expect(component.maxCalorias).toBeUndefined();
    expect(component.subcategorias).toEqual([]);
  });

  it('productosFiltrados should apply all filters', () => {
    productoService.getProductos.mockReturnValue(of({ data: productosMock, message: '' }));
    userService.getAuthState.mockReturnValue(of(false));

    createComponent();

    // sin filtros
    expect(component.productosFiltrados.length).toBe(3);

    // filtros por nombre, categoria, subcategoria y calorias
    component.filtroNombre = 'coca';
    component.categoriaSeleccionada = 'Bebidas';
    component.subcategoriaSeleccionada = 'Gaseosas';
    component.minCalorias = 50;
    component.maxCalorias = 150;
    expect(component.productosFiltrados.length).toBe(1);

    // filtro que no coincide
    component.filtroNombre = 'no-existe';
    expect(component.productosFiltrados.length).toBe(0);

    // calorias mínima sin máximo
    component.filtroNombre = '';
    component.categoriaSeleccionada = '';
    component.subcategoriaSeleccionada = '';
    component.minCalorias = 150;
    component.maxCalorias = undefined;
    expect(component.productosFiltrados.length).toBe(1);
  });

  it('should paginate productos', () => {
    productoService.getProductos.mockReturnValue(of({ data: productosMock, message: '' }));
    userService.getAuthState.mockReturnValue(of(false));

    createComponent();

    component.productosPorPagina = 1;
    component.paginaActual = 2;

    expect(component.productosPaginados).toEqual([productosMock[1]]);
    expect(component.totalPaginas).toBe(3);
  });

  it('abrirDetalle should add cart button for Cliente', () => {
    productoService.getProductos.mockReturnValue(of({ data: productosMock, message: '' }));
    userService.getAuthState.mockReturnValue(of(true));
    userService.getUserRole.mockReturnValue('Cliente');

    createComponent();

    const producto = productosMock[0];
    component.abrirDetalle(producto);

    expect(modalService.openModal).toHaveBeenCalled();
    const args = modalService.openModal.mock.calls[0][0];
    expect(args.image).toBe('../../../../assets/img/logo2.webp');
    expect(args.buttons[0].label).toContain('Agregar al carrito');
    args.buttons[0].action();
    expect(cartService.addToCart).toHaveBeenCalledWith(producto);
    expect(modalService.closeModal).toHaveBeenCalled();
  });

  it('abrirDetalle should add edit button for Administrador', () => {
    productoService.getProductos.mockReturnValue(of({ data: productosMock, message: '' }));
    userService.getAuthState.mockReturnValue(of(true));
    userService.getUserRole.mockReturnValue('Administrador');

    createComponent();

    const producto = { ...productosMock[0], imagen: 'img.png' };
    component.abrirDetalle(producto);

    const args = modalService.openModal.mock.calls[0][0];
    expect(args.image).toBe('img.png');
    expect(args.buttons[0].label).toContain('Editar');
    args.buttons[0].action();
    expect(router.navigate).toHaveBeenCalledWith(['/admin/productos/editar', producto.productoId]);
    expect(modalService.closeModal).toHaveBeenCalled();
  });

  it('abrirDetalle should open modal without buttons when no role', () => {
    productoService.getProductos.mockReturnValue(of({ data: productosMock, message: '' }));
    userService.getAuthState.mockReturnValue(of(false));

    createComponent();

    component.userRole = null;
    component.abrirDetalle(productosMock[2]);

    const args = modalService.openModal.mock.calls[0][0];
    expect(args.buttons.length).toBe(0);
    expect(args.details.calorias).toBeUndefined();
  });
});
