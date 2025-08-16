import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';

import { CrearProductoComponent } from './crear-producto.component';
import { ProductoService } from '../../../../core/services/producto.service';
import { estadoProducto } from '../../../../shared/constants';


describe('CrearProductoComponent', () => {
  let component: CrearProductoComponent;
  let fixture: ComponentFixture<CrearProductoComponent>;
  let productoServiceMock: any;
  let router: Router;
  let activatedRouteMock: any;

  beforeEach(async () => {
    productoServiceMock = {
      createProducto: jest.fn(),
      getProductoById: jest.fn(),
      updateProducto: jest.fn()
    };
    activatedRouteMock = { snapshot: { paramMap: convertToParamMap({}) } };

    await TestBed.configureTestingModule({
      imports: [CrearProductoComponent, RouterTestingModule],
      providers: [
        { provide: ProductoService, useValue: productoServiceMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CrearProductoComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('ngOnInit without id should not load product', () => {
    const cargarSpy = jest.spyOn(component, 'cargarProducto');
    fixture.detectChanges();
    expect(component.esEdicion).toBe(false);
    expect(cargarSpy).not.toHaveBeenCalled();
  });

  it('ngOnInit with id should load product', () => {
    activatedRouteMock.snapshot.paramMap = convertToParamMap({ id: '5' });
    const cargarSpy = jest.spyOn(component, 'cargarProducto').mockImplementation(() => {});
    fixture.detectChanges();
    expect(component.esEdicion).toBe(true);
    expect(cargarSpy).toHaveBeenCalledWith('5');
  });

  it('seleccionarImagen should set image', () => {
    const file = new File([''], 'test.png', { type: 'image/png' });
    const event = { target: { files: [file] } };
    component.seleccionarImagen(event as any);
    expect(component.imagenSeleccionada).toBe(file);
  });

  it('crearProducto should validate required fields', () => {
    component.producto.nombre = '';
    component.producto.precio = 0;
    component.crearProducto();
    expect(component.mensaje).toBe('El nombre y el precio son obligatorios');
    expect(productoServiceMock.createProducto).not.toHaveBeenCalled();
  });

  it('crearProducto should send product without image and navigate', () => {
    jest.useFakeTimers();
    component.producto = {
      nombre: 'Test',
      calorias: 10,
      descripcion: 'desc',
      precio: 20,
      estadoProducto: estadoProducto.DISPONIBLE,
      cantidad: 5,
      categoria: 'cat',
      subcategoria: 'sub'
    };
    component.imagenSeleccionada = null;
    productoServiceMock.createProducto.mockReturnValue(of({ code: 201 }));
    const navigateSpy = jest.spyOn(router, 'navigate');

    component.crearProducto();

    expect(productoServiceMock.createProducto).toHaveBeenCalled();
    expect(component.mensaje).toBe('Producto creado con éxito');
    expect(navigateSpy).not.toHaveBeenCalled();
    jest.runAllTimers();
    expect(navigateSpy).toHaveBeenCalledWith(['/admin/productos']);
  });

  it('crearProducto should append image when present', () => {
    component.producto = {
      nombre: 'Test',
      calorias: 10,
      descripcion: 'desc',
      precio: 20,
      estadoProducto: estadoProducto.DISPONIBLE,
      cantidad: 5,
      categoria: 'cat',
      subcategoria: 'sub'
    };
    const file = new File(['data'], 'image.jpg');
    component.imagenSeleccionada = file;
    productoServiceMock.createProducto.mockReturnValue(of({ code: 201 }));
    const appendSpy = jest.spyOn(FormData.prototype, 'append');

    component.crearProducto();

    expect(appendSpy).toHaveBeenCalledWith('IMAGEN', file);
    appendSpy.mockRestore();
  });

  it('crearProducto should not navigate on error response and use defaults for optional fields', () => {
    component.producto = {
      nombre: 'Test',
      precio: 20,
      cantidad: 1
    } as any;
    component.imagenSeleccionada = null;
    productoServiceMock.createProducto.mockReturnValue(of({ code: 500 }));
    const navigateSpy = jest.spyOn(router, 'navigate');
    const appendSpy = jest.spyOn(FormData.prototype, 'append');

    component.crearProducto();

    expect(productoServiceMock.createProducto).toHaveBeenCalled();
    expect(component.mensaje).toBe('');
    expect(navigateSpy).not.toHaveBeenCalled();
    expect(appendSpy).toHaveBeenCalledWith('CALORIAS', '');
    expect(appendSpy).toHaveBeenCalledWith('DESCRIPCION', '');
    expect(appendSpy).toHaveBeenCalledWith('ESTADO_PRODUCTO', 'DISPONIBLE');
    expect(appendSpy).toHaveBeenCalledWith('CATEGORIA', '');
    expect(appendSpy).toHaveBeenCalledWith('SUBCATEGORIA', '');
    appendSpy.mockRestore();
  });

  it('cargarProducto should set product when data exists', () => {
    const producto = {
      nombre: 'n',
      calorias: 1,
      descripcion: 'd',
      precio: 1,
      estadoProducto: estadoProducto.DISPONIBLE,
      cantidad: 1,
      categoria: 'c',
      subcategoria: 's'
    };
    productoServiceMock.getProductoById.mockReturnValue(of({ data: producto }));
    component.cargarProducto('1');
    expect(productoServiceMock.getProductoById).toHaveBeenCalledWith(1);
    expect(component.producto).toEqual(producto);
  });

  it('cargarProducto should not set product when no data', () => {
    const initial = { ...component.producto };
    productoServiceMock.getProductoById.mockReturnValue(of({}));
    component.cargarProducto('1');
    expect(component.producto).toEqual(initial);
  });

  it('actualizarProducto should return if no productId', () => {
    component.productoId = null;
    component.actualizarProducto();
    expect(productoServiceMock.updateProducto).not.toHaveBeenCalled();
  });

  it('actualizarProducto should update product and navigate without image', () => {
    jest.useFakeTimers();
    component.productoId = '2';
    component.producto = {
      nombre: 'Test',
      calorias: 10,
      descripcion: 'desc',
      precio: 20,
      estadoProducto: estadoProducto.DISPONIBLE,
      cantidad: 5,
      categoria: 'cat',
      subcategoria: 'sub'
    };
    productoServiceMock.updateProducto.mockReturnValue(of({ code: 200 }));
    const navigateSpy = jest.spyOn(router, 'navigate');

    component.actualizarProducto();

    expect(productoServiceMock.updateProducto).toHaveBeenCalledWith(2, expect.any(FormData));
    expect(component.mensaje).toBe('Producto actualizado con éxito');
    jest.runAllTimers();
    expect(navigateSpy).toHaveBeenCalledWith(['/admin/productos']);
  });

  it('actualizarProducto should append image when present', () => {
    component.productoId = '3';
    component.producto = {
      nombre: 'Test',
      calorias: 10,
      descripcion: 'desc',
      precio: 20,
      estadoProducto: estadoProducto.DISPONIBLE,
      cantidad: 5,
      categoria: 'cat',
      subcategoria: 'sub'
    };
    const file = new File(['data'], 'img.png');
    component.imagenSeleccionada = file;
    productoServiceMock.updateProducto.mockReturnValue(of({ code: 200 }));
    const appendSpy = jest.spyOn(FormData.prototype, 'append');

    component.actualizarProducto();

    expect(appendSpy).toHaveBeenCalledWith('IMAGEN', file);
    appendSpy.mockRestore();
  });

  it('actualizarProducto should not navigate on error response and use defaults for optional fields', () => {
    component.productoId = '4';
    component.producto = {
      nombre: 'Test',
      precio: 20,
      cantidad: 1
    } as any;
    component.imagenSeleccionada = null;
    productoServiceMock.updateProducto.mockReturnValue(of({ code: 500 }));
    const navigateSpy = jest.spyOn(router, 'navigate');
    const appendSpy = jest.spyOn(FormData.prototype, 'append');

    component.actualizarProducto();

    expect(productoServiceMock.updateProducto).toHaveBeenCalled();
    expect(component.mensaje).toBe('');
    expect(navigateSpy).not.toHaveBeenCalled();
    expect(appendSpy).toHaveBeenCalledWith('CALORIAS', '');
    expect(appendSpy).toHaveBeenCalledWith('DESCRIPCION', '');
    expect(appendSpy).toHaveBeenCalledWith('ESTADO_PRODUCTO', 'DISPONIBLE');
    expect(appendSpy).toHaveBeenCalledWith('CATEGORIA', '');
    expect(appendSpy).toHaveBeenCalledWith('SUBCATEGORIA', '');
    appendSpy.mockRestore();
  });
});

