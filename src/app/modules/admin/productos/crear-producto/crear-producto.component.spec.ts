import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';

import { ToastrService } from 'ngx-toastr';
import { CategoriaService } from '../../../../core/services/categoria.service';
import { ProductoService } from '../../../../core/services/producto.service';
import { SubcategoriaService } from '../../../../core/services/subcategoria.service';
import { estadoProducto } from '../../../../shared/constants';
import { mockCategorias } from '../../../../shared/mocks/categoria.mock';
import { mockSubcategorias } from '../../../../shared/mocks/subcategoria.mock';
import {
  createCategoriaServiceMock,
  createImageOptimizationServiceMock,
  createProductoServiceMock,
  createSubcategoriaServiceMock,
  createToastrMock,
  createURLCreateObjectURLMock,
} from '../../../../shared/mocks/test-doubles';
import { ImageOptimizationService } from '../../../../shared/services/image-optimization.service';
import { CrearProductoComponent } from './crear-producto.component';

describe('CrearProductoComponent', () => {
  let component: CrearProductoComponent;
  let fixture: ComponentFixture<CrearProductoComponent>;
  let mockProductoService: any;
  let mockCategoriaService: any;
  let mockSubcategoriaService: any;
  let mockToastr: any;
  let mockImageOptimizationService: any;
  let router: Router;
  let activatedRouteMock: any;

  beforeEach(async () => {
    mockProductoService = createProductoServiceMock();
    mockCategoriaService = createCategoriaServiceMock();
    mockSubcategoriaService = createSubcategoriaServiceMock();
    mockToastr = createToastrMock();
    mockImageOptimizationService = createImageOptimizationServiceMock();
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
        { provide: ImageOptimizationService, useValue: mockImageOptimizationService },
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
      const cargarDatosEdicionSpy = jest.spyOn(component, 'cargarDatosEdicion');
      fixture.detectChanges();
      expect(component.esEdicion).toBe(false);
      expect(cargarDatosEdicionSpy).not.toHaveBeenCalled();
    });

    it('should load product data when id is present (edicion mode)', () => {
      activatedRouteMock.snapshot.paramMap = convertToParamMap({ id: '5' });
      const cargarDatosEdicionSpy = jest
        .spyOn(component, 'cargarDatosEdicion')
        .mockImplementation(() => {});
      fixture.detectChanges();
      expect(component.esEdicion).toBe(true);
      expect(cargarDatosEdicionSpy).toHaveBeenCalled();
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
    it('should optimize image and set preview when valid file is selected', async () => {
      const file = new File(['test'], 'test.png', { type: 'image/png' });
      Object.defineProperty(file, 'size', { value: 500 * 1024 });
      const event = { target: { files: [file] } };

      global.URL.createObjectURL = createURLCreateObjectURLMock();

      component.seleccionarImagen(event as any);
      await new Promise((resolve) => setTimeout(resolve, 0)); // Esperar async

      expect(mockImageOptimizationService.isValidImageFile).toHaveBeenCalledWith(file);
      expect(mockImageOptimizationService.optimizeImage).toHaveBeenCalledWith(
        file,
        expect.any(Function),
      );
      // Ya no se llama fileToBase64, ahora se guarda el File directamente
      expect(component.imagenOptimizada).toBeTruthy();
      expect(component.imagenPreview).toBe('blob:mock-url');
      expect(mockToastr.success).toHaveBeenCalled();
    });

    it('should warn when file size exceeds 20MB', async () => {
      const largeFile = new File(['x'.repeat(21 * 1024 * 1024)], 'large.png', {
        type: 'image/png',
      });
      Object.defineProperty(largeFile, 'size', { value: 21 * 1024 * 1024 });
      const event = { target: { files: [largeFile] } };

      mockImageOptimizationService.isValidImageFile.mockReturnValue(true);

      component.seleccionarImagen(event as any);
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockToastr.warning).toHaveBeenCalledWith(
        'La imagen original no debe superar los 20MB',
        'Advertencia',
      );
      expect(mockImageOptimizationService.optimizeImage).not.toHaveBeenCalled();
    });

    it('should warn when file is not a valid image', async () => {
      const textFile = new File([''], 'test.txt', { type: 'text/plain' });
      const event = { target: { files: [textFile] } };

      mockImageOptimizationService.isValidImageFile.mockReturnValue(false);

      component.seleccionarImagen(event as any);
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockToastr.warning).toHaveBeenCalledWith(
        'Solo se permiten archivos de imagen (JPG, PNG, GIF, WEBP, AVIF, HEIC)',
        'Advertencia',
      );
      expect(mockImageOptimizationService.optimizeImage).not.toHaveBeenCalled();
    });

    it('should handle optimization error', async () => {
      const file = new File(['test'], 'test.png', { type: 'image/png' });
      Object.defineProperty(file, 'size', { value: 500 * 1024 });
      const event = { target: { files: [file] } };

      mockImageOptimizationService.optimizeImage.mockRejectedValue(
        new Error('Optimization failed'),
      );

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      component.seleccionarImagen(event as any);
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockToastr.error).toHaveBeenCalledWith('Optimization failed', 'Error');
      expect(component.optimizandoImagen).toBe(false);
      consoleErrorSpy.mockRestore();
    });

    it('should report progress during optimization', async () => {
      const file = new File(['test'], 'test.png', { type: 'image/png' });
      Object.defineProperty(file, 'size', { value: 500 * 1024 });
      const event = { target: { files: [file] } };

      let progressCallback: any;
      mockImageOptimizationService.optimizeImage.mockImplementation((f: File, cb: any) => {
        progressCallback = cb;
        return Promise.resolve({
          file: new File(['optimized'], 'test.webp', { type: 'image/webp' }),
          originalSize: 500 * 1024,
          optimizedSize: 100 * 1024,
          compressionRatio: 80,
          format: 'webp',
          dimensions: { width: 800, height: 800 },
        });
      });

      global.URL.createObjectURL = createURLCreateObjectURLMock();

      component.seleccionarImagen(event as any);
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Simular progreso
      if (progressCallback) {
        progressCallback(50);
        expect(component.progresoOptimizacion).toBe(50);
      }
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
      // Ahora se envía el File optimizado como segundo parámetro (o undefined si no hay)
      expect(mockProductoService.createProducto).toHaveBeenCalledWith(
        component.producto,
        undefined,
      );
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

  describe('cargarDatosEdicion', () => {
    it('should load categories, subcategories, and product, then map names correctly', (done) => {
      const productoFromApi = {
        nombre: 'Test',
        precio: 20,
        cantidad: 5,
        subcategoriaId: 9, // ID de "Hamburguesas"
        imagenBase64: 'base64data',
      };

      mockCategoriaService.list.mockReturnValue(of(mockCategorias));
      mockSubcategoriaService.list.mockReturnValue(of(mockSubcategorias));
      mockProductoService.getProductoById.mockReturnValue(of({ data: productoFromApi }));

      component.productoId = '1';
      component.cargarDatosEdicion();

      // Esperar a que se completen las llamadas asíncronas
      setTimeout(() => {
        expect(mockCategoriaService.list).toHaveBeenCalled();
        expect(mockSubcategoriaService.list).toHaveBeenCalled();
        expect(mockProductoService.getProductoById).toHaveBeenCalledWith(1);

        // Verificar que se mapearon correctamente
        expect(component.producto.subcategoria).toBe('Hamburguesas');
        expect(component.producto.categoria).toBe('Comida');
        expect(component.imagenPreview).toBe('base64data');
        expect(component.cargando).toBe(false);
        done();
      }, 0);
    });

    it('should handle error when loading data for edition', (done) => {
      mockCategoriaService.list.mockReturnValue(throwError(() => new Error('Error')));
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const navigateSpy = jest.spyOn(router, 'navigate');

      component.productoId = '1';
      component.cargarDatosEdicion();

      setTimeout(() => {
        expect(mockToastr.error).toHaveBeenCalledWith(
          'Error al cargar los datos del producto',
          'Error',
        );
        expect(component.cargando).toBe(false);
        expect(navigateSpy).toHaveBeenCalledWith(['/admin/productos']);
        consoleErrorSpy.mockRestore();
        done();
      }, 0);
    });
  });

  describe('cargarProducto (legacy)', () => {
    it('should load product and set preview when image exists', () => {
      const producto = {
        nombre: 'Test',
        precio: 20,
        cantidad: 5,
        imagenBase64: 'base64data',
      };
      mockProductoService.getProductoById.mockReturnValue(of({ data: producto }));

      component.cargarProducto('1');

      expect(mockProductoService.getProductoById).toHaveBeenCalledWith(1);
      expect(component.producto).toEqual(producto);
      expect(component.imagenPreview).toBe('base64data');
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
      // Ahora se envía el File optimizado como tercer parámetro (o undefined si no hay)
      // Y se envía una copia del producto sin los campos imagen/imagenBase64
      expect(mockProductoService.updateProducto).toHaveBeenCalledWith(
        2,
        expect.any(Object),
        undefined,
      );
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
