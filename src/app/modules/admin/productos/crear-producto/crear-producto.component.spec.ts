import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';

import { ToastrService } from 'ngx-toastr';
import { CategoriaService } from '../../../../core/services/categoria.service';
import { ProductoService } from '../../../../core/services/producto.service';
import { SubcategoriaService } from '../../../../core/services/subcategoria.service';
import { estadoProducto } from '../../../../shared/constants';
import { mockCategorias, mockSubcategorias } from '../../../../shared/mocks/categoria.mock';
import {
  createCategoriaServiceMock,
  createFileReaderMock,
  createProductoServiceMock,
  createSubcategoriaServiceMock,
  createToastrMock,
} from '../../../../shared/mocks/test-doubles';
import { CrearProductoComponent } from './crear-producto.component';

describe('CrearProductoComponent', () => {
  let component: CrearProductoComponent;
  let fixture: ComponentFixture<CrearProductoComponent>;
  let mockProductoService: any;
  let mockCategoriaService: any;
  let mockSubcategoriaService: any;
  let mockToastr: any;
  let router: Router;
  let activatedRouteMock: any;

  beforeEach(async () => {
    mockProductoService = createProductoServiceMock();
    mockCategoriaService = createCategoriaServiceMock();
    mockSubcategoriaService = createSubcategoriaServiceMock();
    mockToastr = createToastrMock();
    activatedRouteMock = { snapshot: { paramMap: convertToParamMap({}) } };

    // Configurar respuestas por defecto
    mockCategoriaService.list.mockReturnValue(of(mockCategorias));
    mockSubcategoriaService.list.mockReturnValue(of(mockSubcategorias));

    await TestBed.configureTestingModule({
      imports: [CrearProductoComponent, RouterTestingModule],
      providers: [
        { provide: ProductoService, useValue: mockProductoService },
        { provide: CategoriaService, useValue: mockCategoriaService },
        { provide: SubcategoriaService, useValue: mockSubcategoriaService },
        { provide: ToastrService, useValue: mockToastr },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
      ],
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

  describe('ngOnInit', () => {
    it('should detect WebView and load categories and subcategories', () => {
      const detectarSpy = jest.spyOn(component, 'detectarWebView');
      const cargarCatSpy = jest.spyOn(component, 'cargarCategorias');
      const cargarSubSpy = jest.spyOn(component, 'cargarSubcategorias');

      fixture.detectChanges();

      expect(detectarSpy).toHaveBeenCalled();
      expect(cargarCatSpy).toHaveBeenCalled();
      expect(cargarSubSpy).toHaveBeenCalled();
      expect(component.categorias).toEqual(mockCategorias);
      expect(component.subcategorias).toEqual(mockSubcategorias);
    });

    it('should not load product when no id is present', () => {
      const cargarSpy = jest.spyOn(component, 'cargarProducto');
      fixture.detectChanges();
      expect(component.esEdicion).toBe(false);
      expect(cargarSpy).not.toHaveBeenCalled();
    });

    it('should load product when id is present', () => {
      activatedRouteMock.snapshot.paramMap = convertToParamMap({ id: '5' });
      const cargarSpy = jest.spyOn(component, 'cargarProducto').mockImplementation(() => {});
      fixture.detectChanges();
      expect(component.esEdicion).toBe(true);
      expect(cargarSpy).toHaveBeenCalledWith('5');
    });
  });

  describe('detectarWebView', () => {
    it('should detect Capacitor', () => {
      (window as any).Capacitor = {};
      component.detectarWebView();
      expect(component.isWebView).toBe(true);
      delete (window as any).Capacitor;
    });

    it('should detect Cordova', () => {
      (window as any).cordova = {};
      component.detectarWebView();
      expect(component.isWebView).toBe(true);
      delete (window as any).cordova;
    });

    it('should not detect WebView in regular browser', () => {
      component.detectarWebView();
      expect(component.isWebView).toBe(false);
    });
  });

  describe('cargarCategorias', () => {
    it('should load categories successfully', () => {
      component.cargarCategorias();
      expect(mockCategoriaService.list).toHaveBeenCalled();
      expect(component.categorias).toEqual(mockCategorias);
    });

    it('should handle error when loading categories', () => {
      mockCategoriaService.list.mockReturnValue(throwError(() => new Error('Error')));
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      component.cargarCategorias();

      expect(mockToastr.error).toHaveBeenCalledWith('Error al cargar categorías', 'Error');
      consoleErrorSpy.mockRestore();
    });
  });

  describe('cargarSubcategorias', () => {
    it('should load subcategories successfully', () => {
      component.cargarSubcategorias();
      expect(mockSubcategoriaService.list).toHaveBeenCalled();
      expect(component.subcategorias).toEqual(mockSubcategorias);
      expect(component.subcategoriasFiltradas).toEqual(mockSubcategorias);
    });

    it('should handle error when loading subcategories', () => {
      mockSubcategoriaService.list.mockReturnValue(throwError(() => new Error('Error')));
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      component.cargarSubcategorias();

      expect(mockToastr.error).toHaveBeenCalledWith('Error al cargar subcategorías', 'Error');
      consoleErrorSpy.mockRestore();
    });
  });

  describe('onCategoriaChange', () => {
    it.skip('should filter subcategories when category is selected', () => {
      // Asegurar que las propiedades están inicializadas antes del test
      component.categorias = mockCategorias;
      component.subcategorias = mockSubcategorias;
      component.subcategoriasFiltradas = mockSubcategorias;

      component.producto.categoria = 'Comida';
      component.onCategoriaChange();

      expect(component.subcategoriasFiltradas.length).toBeGreaterThan(0);
      const allMatch = component.subcategoriasFiltradas.every(
        (sub) => sub.categoriaId === 1 || (sub.categoriaId as any).categoriaId === 1,
      );
      expect(allMatch).toBe(true);
    });

    it.skip('should clear subcategory if not in filtered list', () => {
      // Asegurar que las propiedades están inicializadas antes del test
      component.categorias = mockCategorias;
      component.subcategorias = mockSubcategorias;
      component.subcategoriasFiltradas = mockSubcategorias;

      component.producto.categoria = 'Comida';
      component.producto.subcategoria = 'Subcategoría inexistente';
      component.onCategoriaChange();

      expect(component.producto.subcategoria).toBe('');
    });

    it('should reset filter when no category selected', () => {
      // Asegurar que las propiedades están inicializadas antes del test
      component.categorias = mockCategorias;
      component.subcategorias = mockSubcategorias;
      component.subcategoriasFiltradas = mockSubcategorias;

      component.producto.categoria = '';
      component.onCategoriaChange();

      expect(component.subcategoriasFiltradas).toEqual(mockSubcategorias);
      expect(component.producto.subcategoria).toBe('');
    });
  });

  describe('seleccionarImagen', () => {
    it('should set image and preview when valid file is selected', () => {
      const file = new File([''], 'test.png', { type: 'image/png' });
      const event = { target: { files: [file] } };
      const readerMock: any = createFileReaderMock('data:image/png;base64,AAA');
      jest.spyOn(window as any, 'FileReader').mockImplementation(() => readerMock);

      component.seleccionarImagen(event as any);

      expect(component.producto.imagenBase64).toBe('data:image/png;base64,AAA');
      expect(component.imagenPreview).toBe('data:image/png;base64,AAA');
    });

    it('should warn when file size exceeds 5MB', () => {
      const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.png', {
        type: 'image/png',
      });
      const event = { target: { files: [largeFile], value: 'path' } };

      component.seleccionarImagen(event as any);

      expect(mockToastr.warning).toHaveBeenCalledWith(
        'La imagen no debe superar los 5MB',
        'Advertencia',
      );
      expect((event.target as any).value).toBe('');
    });

    it('should warn when file is not an image', () => {
      const textFile = new File([''], 'test.txt', { type: 'text/plain' });
      const event = { target: { files: [textFile], value: 'path' } };

      component.seleccionarImagen(event as any);

      expect(mockToastr.warning).toHaveBeenCalledWith(
        'Solo se permiten archivos de imagen',
        'Advertencia',
      );
      expect((event.target as any).value).toBe('');
    });
  });

  describe('eliminarImagen', () => {
    it('should clear image and preview', () => {
      document.body.innerHTML = '<input type="file" />';
      component.producto.imagenBase64 = 'base64data';
      component.imagenPreview = 'base64data';

      component.eliminarImagen();

      expect(component.producto.imagenBase64).toBeUndefined();
      expect(component.imagenPreview).toBeNull();
      document.body.innerHTML = '';
    });
  });

  describe('validarFormulario', () => {
    it('should return false when nombre is empty', () => {
      component.producto.nombre = '';
      component.producto.precio = 10;
      component.producto.categoria = 'Comida';
      component.producto.subcategoria = 'Hamburguesas';

      const result = component.validarFormulario();

      expect(result).toBe(false);
      expect(mockToastr.warning).toHaveBeenCalledWith(
        'El nombre del producto es obligatorio',
        'Validación',
      );
    });

    it('should return false when precio is 0 or negative', () => {
      component.producto.nombre = 'Test';
      component.producto.precio = 0;
      component.producto.categoria = 'Comida';
      component.producto.subcategoria = 'Hamburguesas';

      const result = component.validarFormulario();

      expect(result).toBe(false);
      expect(mockToastr.warning).toHaveBeenCalledWith('El precio debe ser mayor a 0', 'Validación');
    });

    it('should return false when categoria is empty', () => {
      component.producto.nombre = 'Test';
      component.producto.precio = 10;
      component.producto.categoria = '';
      component.producto.subcategoria = 'Hamburguesas';

      const result = component.validarFormulario();

      expect(result).toBe(false);
      expect(mockToastr.warning).toHaveBeenCalledWith(
        'Debe seleccionar una categoría',
        'Validación',
      );
    });

    it('should return false when subcategoria is empty', () => {
      component.producto.nombre = 'Test';
      component.producto.precio = 10;
      component.producto.categoria = 'Comida';
      component.producto.subcategoria = '';

      const result = component.validarFormulario();

      expect(result).toBe(false);
      expect(mockToastr.warning).toHaveBeenCalledWith(
        'Debe seleccionar una subcategoría',
        'Validación',
      );
    });

    it('should return true when all fields are valid', () => {
      component.producto.nombre = 'Test';
      component.producto.precio = 10;
      component.producto.categoria = 'Comida';
      component.producto.subcategoria = 'Hamburguesas';

      const result = component.validarFormulario();

      expect(result).toBe(true);
      expect(mockToastr.warning).not.toHaveBeenCalled();
    });
  });

  describe('crearProducto', () => {
    beforeEach(() => {
      component.producto = {
        nombre: 'Test',
        calorias: 10,
        descripcion: 'desc',
        precio: 20,
        estadoProducto: estadoProducto.DISPONIBLE,
        cantidad: 5,
        categoria: 'Comida',
        subcategoria: 'Hamburguesas',
      };
    });

    it('should not create product when validation fails', () => {
      component.producto.nombre = '';
      component.crearProducto();

      expect(mockProductoService.createProducto).not.toHaveBeenCalled();
      expect(mockToastr.warning).toHaveBeenCalled();
    });

    it('should create product and navigate on success', fakeAsync(() => {
      mockProductoService.createProducto.mockReturnValue(of({ code: 201 }));
      const navigateSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);

      component.crearProducto();

      expect(component.guardando).toBe(true);
      expect(mockProductoService.createProducto).toHaveBeenCalledWith(component.producto);
      expect(mockToastr.success).toHaveBeenCalledWith('Producto creado con éxito', 'Éxito');

      tick(1500);
      expect(navigateSpy).toHaveBeenCalledWith(['/admin/productos']);
    }));

    it('should handle error when creating product', () => {
      mockProductoService.createProducto.mockReturnValue(throwError(() => new Error('Error')));
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      component.crearProducto();

      expect(mockToastr.error).toHaveBeenCalledWith('Error al crear el producto', 'Error');
      expect(component.guardando).toBe(false);
      consoleErrorSpy.mockRestore();
    });
  });

  describe('cargarProducto', () => {
    it('should load product and set preview when image exists', () => {
      const producto = {
        nombre: 'Test',
        calorias: 10,
        descripcion: 'desc',
        precio: 20,
        estadoProducto: estadoProducto.DISPONIBLE,
        cantidad: 5,
        categoria: 'Comida',
        subcategoria: 'Hamburguesas',
        imagenBase64: 'base64data',
      };
      mockProductoService.getProductoById.mockReturnValue(of({ data: producto }));
      const onCategoriaChangeSpy = jest.spyOn(component, 'onCategoriaChange');

      component.cargarProducto('1');

      expect(mockProductoService.getProductoById).toHaveBeenCalledWith(1);
      expect(component.producto).toEqual(producto);
      expect(component.imagenPreview).toBe('base64data');
      expect(onCategoriaChangeSpy).toHaveBeenCalled();
      expect(component.cargando).toBe(false);
    });

    it('should handle error when loading product', () => {
      mockProductoService.getProductoById.mockReturnValue(throwError(() => new Error('Error')));
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const navigateSpy = jest.spyOn(router, 'navigate');

      component.cargarProducto('1');

      expect(mockToastr.error).toHaveBeenCalledWith('Error al cargar el producto', 'Error');
      expect(component.cargando).toBe(false);
      expect(navigateSpy).toHaveBeenCalledWith(['/admin/productos']);
      consoleErrorSpy.mockRestore();
    });
  });

  describe('actualizarProducto', () => {
    beforeEach(() => {
      component.productoId = '2';
      component.producto = {
        nombre: 'Test',
        calorias: 10,
        descripcion: 'desc',
        precio: 20,
        estadoProducto: estadoProducto.DISPONIBLE,
        cantidad: 5,
        categoria: 'Comida',
        subcategoria: 'Hamburguesas',
      };
    });

    it('should return if no productId', () => {
      component.productoId = null;
      component.actualizarProducto();

      expect(mockProductoService.updateProducto).not.toHaveBeenCalled();
    });

    it('should not update product when validation fails', () => {
      component.producto.nombre = '';
      component.actualizarProducto();

      expect(mockProductoService.updateProducto).not.toHaveBeenCalled();
      expect(mockToastr.warning).toHaveBeenCalled();
    });

    it('should update product and navigate on success', fakeAsync(() => {
      mockProductoService.updateProducto.mockReturnValue(of({ code: 200 }));
      const navigateSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);

      component.actualizarProducto();

      expect(component.guardando).toBe(true);
      expect(mockProductoService.updateProducto).toHaveBeenCalledWith(2, component.producto);
      expect(mockToastr.success).toHaveBeenCalledWith('Producto actualizado con éxito', 'Éxito');

      tick(1500);
      expect(navigateSpy).toHaveBeenCalledWith(['/admin/productos']);
    }));

    it('should handle error when updating product', () => {
      mockProductoService.updateProducto.mockReturnValue(throwError(() => new Error('Error')));
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      component.actualizarProducto();

      expect(mockToastr.error).toHaveBeenCalledWith('Error al actualizar el producto', 'Error');
      expect(component.guardando).toBe(false);
      consoleErrorSpy.mockRestore();
    });
  });

  describe('cancelar', () => {
    it('should navigate to products list', () => {
      const navigateSpy = jest.spyOn(router, 'navigate');
      component.cancelar();
      expect(navigateSpy).toHaveBeenCalledWith(['/admin/productos']);
    });
  });
});
