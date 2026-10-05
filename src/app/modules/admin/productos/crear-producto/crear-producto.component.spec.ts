import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ToastrService } from 'ngx-toastr';
import { of, throwError } from 'rxjs';

import { CategoriaService } from '../../../../core/services/categoria.service';
import { ProductoService } from '../../../../core/services/producto.service';
import { SubcategoriaService } from '../../../../core/services/subcategoria.service';
import { estadoProducto } from '../../../../shared/constants';
import { mockCategorias } from '../../../../shared/mocks/categoria.mock';
import { mockSubcategorias } from '../../../../shared/mocks/subcategoria.mock';
import {
  createCategoriaServiceMock,
  createFnMock,
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
    it('should filter subcategories when category is selected', () => {
      // Asegurar que las propiedades están inicializadas antes del test
      component.categorias = mockCategorias;
      component.subcategorias = mockSubcategorias;
      component.subcategoriasFiltradas = mockSubcategorias;

      // 'Bebidas' tiene categoriaId 1 en los mocks
      component.producto.categoria = 'Bebidas';
      component.producto.subcategoria = '';
      component.onCategoriaChange();

      expect(component.subcategoriasFiltradas).toEqual(
        mockSubcategorias.filter((sub) => sub.categoriaId === 1),
      );
      expect(component.subcategoriasFiltradas.length).toBeGreaterThan(0);
      const allMatch = component.subcategoriasFiltradas.every(
        (sub) => sub.categoriaId === 1 || (sub.categoriaId as any).categoriaId === 1,
      );
      expect(allMatch).toBe(true);
    });

    it('should clear subcategory if not in filtered list', () => {
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
      mockProductoService.createProducto.mockReturnValue(
        throwError(() => ({ code: 409, message: 'Ya existe un producto con ese nombre' })),
      );
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      component.crearProducto();

      expect(mockToastr.error).toHaveBeenCalledWith(
        'Ya existe un producto con ese nombre',
        'Error',
      );
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
      mockProductoService.updateProducto.mockReturnValue(throwError(() => ({ code: 500 })));
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

  describe('cobertura adicional', () => {
    const productoValido = () => ({
      nombre: 'Test',
      calorias: 10,
      descripcion: 'desc',
      precio: 20,
      estadoProducto: estadoProducto.DISPONIBLE,
      cantidad: 5,
      categoria: 'Comida',
      subcategoria: 'Hamburguesas',
    });

    describe('onCategoriaChange', () => {
      it('no hace nada si categorias o subcategorias no están inicializadas', () => {
        component.categorias = undefined as any;
        component.subcategorias = mockSubcategorias;
        component.subcategoriasFiltradas = mockSubcategorias;
        component.producto.categoria = 'Comida';
        component.producto.subcategoria = 'X';
        component.onCategoriaChange();
        expect(component.subcategoriasFiltradas).toEqual(mockSubcategorias);
        expect(component.producto.subcategoria).toBe('X');

        component.categorias = mockCategorias;
        component.subcategorias = undefined as any;
        component.onCategoriaChange();
        expect(component.producto.subcategoria).toBe('X');
      });

      it('conserva la subcategoría si pertenece a la categoría', () => {
        component.categorias = mockCategorias;
        component.subcategorias = mockSubcategorias;
        component.producto.categoria = 'Comida';
        component.producto.subcategoria = 'Hamburguesas';
        component.onCategoriaChange();
        expect(component.subcategoriasFiltradas.map((s) => s.nombre)).toEqual(['Hamburguesas']);
        expect(component.producto.subcategoria).toBe('Hamburguesas');
      });

      it('soporta categoriaId como objeto en las subcategorías', () => {
        component.categorias = mockCategorias;
        component.subcategorias = [
          { subcategoriaId: 1, nombre: 'Gaseosas', categoriaId: { categoriaId: 1 } as any },
          { subcategoriaId: 9, nombre: 'Hamburguesas', categoriaId: { categoriaId: 2 } as any },
        ];
        component.producto.categoria = 'Bebidas';
        component.producto.subcategoria = 'Gaseosas';
        component.onCategoriaChange();
        expect(component.subcategoriasFiltradas.map((s) => s.nombre)).toEqual(['Gaseosas']);
        expect(component.producto.subcategoria).toBe('Gaseosas');
      });

      it('no filtra cuando la categoría no existe en la lista pero limpia la subcategoría', () => {
        component.categorias = mockCategorias;
        component.subcategorias = mockSubcategorias;
        component.subcategoriasFiltradas = [];
        component.producto.categoria = 'Inexistente';
        component.producto.subcategoria = 'Gaseosas';
        component.onCategoriaChange();
        expect(component.subcategoriasFiltradas).toEqual([]);
        expect(component.producto.subcategoria).toBe('');
      });
    });

    describe('drag & drop', () => {
      const dragEvent = (files?: any) =>
        ({
          preventDefault: createFnMock(),
          stopPropagation: createFnMock(),
          dataTransfer: files === undefined ? undefined : { files },
        }) as any;

      it('onDragOver marca isDragging', () => {
        const event = dragEvent();
        component.onDragOver(event);
        expect(event.preventDefault).toHaveBeenCalled();
        expect(event.stopPropagation).toHaveBeenCalled();
        expect(component.isDragging).toBe(true);
      });

      it('onDragLeave desmarca isDragging', () => {
        component.isDragging = true;
        const event = dragEvent();
        component.onDragLeave(event);
        expect(event.preventDefault).toHaveBeenCalled();
        expect(event.stopPropagation).toHaveBeenCalled();
        expect(component.isDragging).toBe(false);
      });

      it('onDrop procesa el primer archivo soltado', async () => {
        global.URL.createObjectURL = createURLCreateObjectURLMock();
        const file = new File(['x'], 'a.png', { type: 'image/png' });
        component.isDragging = true;
        const event = dragEvent([file]);

        component.onDrop(event);
        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(component.isDragging).toBe(false);
        expect(mockImageOptimizationService.isValidImageFile).toHaveBeenCalledWith(file);
        expect(mockImageOptimizationService.optimizeImage).toHaveBeenCalled();
        expect(component.imagenOptimizada).toBeTruthy();
      });

      it('onDrop ignora eventos sin archivos o sin dataTransfer', () => {
        component.onDrop(dragEvent([]));
        component.onDrop(dragEvent());
        expect(mockImageOptimizationService.isValidImageFile).not.toHaveBeenCalled();
        expect(component.isDragging).toBe(false);
      });
    });

    describe('seleccionarImagen / procesarArchivo', () => {
      it('no hace nada si no hay archivo seleccionado', () => {
        component.seleccionarImagen({ target: { files: [] } } as any);
        component.seleccionarImagen({ target: { files: null } } as any);
        expect(mockImageOptimizationService.isValidImageFile).not.toHaveBeenCalled();
      });

      it('usa mensaje genérico cuando el error de optimización no es una instancia de Error', async () => {
        const file = new File(['test'], 'test.png', { type: 'image/png' });
        mockImageOptimizationService.optimizeImage.mockRejectedValue('fallo');
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

        component.seleccionarImagen({ target: { files: [file] } } as any);
        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(mockToastr.error).toHaveBeenCalledWith('Error al procesar la imagen', 'Error');
        expect(component.optimizandoImagen).toBe(false);
        expect(component.progresoOptimizacion).toBe(0);
        consoleErrorSpy.mockRestore();
      });

      it('reporta el progreso durante la optimización y resetea al finalizar', async () => {
        const file = new File(['test'], 'test.png', { type: 'image/png' });
        global.URL.createObjectURL = createURLCreateObjectURLMock();
        let observed = -1;
        mockImageOptimizationService.optimizeImage.mockImplementation((_f: File, cb: any) => {
          cb(40);
          observed = component.progresoOptimizacion;
          return Promise.resolve({
            file: new File(['o'], 'o.webp', { type: 'image/webp' }),
            originalSize: 1000,
            optimizedSize: 500,
            compressionRatio: 50,
            format: 'webp',
            dimensions: { width: 1, height: 1 },
          });
        });

        component.seleccionarImagen({ target: { files: [file] } } as any);
        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(observed).toBe(40);
        expect(component.progresoOptimizacion).toBe(0);
      });
    });

    describe('eliminarImagen', () => {
      it('limpia la imagen y el input de archivo, y no falla sin input', () => {
        document.body.innerHTML = '<input type="file" />';
        component.imagenOptimizada = new File(['x'], 'x.webp');
        component.eliminarImagen();
        expect(component.imagenOptimizada).toBeNull();

        document.body.innerHTML = '';
        expect(() => component.eliminarImagen()).not.toThrow();
      });
    });

    describe('cargarDatosEdicion - ramas', () => {
      const cargar = (producto: any, subs: any[] = mockSubcategorias) => {
        mockCategoriaService.list.mockReturnValue(of(mockCategorias));
        mockSubcategoriaService.list.mockReturnValue(of(subs));
        mockProductoService.getProductoById.mockReturnValue(of(producto));
        component.productoId = '1';
        component.cargarDatosEdicion();
      };

      it('no cambia el producto si la respuesta no trae data', () => {
        const original = component.producto;
        cargar({ data: undefined });
        expect(component.producto).toBe(original);
        expect(component.cargando).toBe(false);
        expect(component.categorias).toEqual(mockCategorias);
      });

      it('no mapea nombres si el producto no tiene subcategoriaId ni imagen', () => {
        cargar({ data: { nombre: 'P', precio: 5, cantidad: 1 } });
        expect(component.producto.nombre).toBe('P');
        expect(component.imagenPreview).toBeNull();
        expect(component.producto.subcategoria).toBeUndefined();
      });

      it('no asigna nombres si no se encuentra la subcategoría', () => {
        cargar({ data: { nombre: 'P', precio: 5, cantidad: 1, subcategoriaId: 999 } });
        expect(component.producto.subcategoria).toBeUndefined();
        expect(component.producto.categoria).toBeUndefined();
      });

      it('asigna la subcategoría pero no la categoría si esta no existe', () => {
        cargar({ data: { nombre: 'P', precio: 5, cantidad: 1, subcategoriaId: 50 } }, [
          { subcategoriaId: 50, nombre: 'Huérfana', categoriaId: 999 },
        ]);
        expect(component.producto.subcategoria).toBe('Huérfana');
        expect(component.producto.categoria).toBeUndefined();
      });

      it('resuelve categoriaId cuando la subcategoría lo trae como objeto', () => {
        cargar({ data: { nombre: 'P', precio: 5, cantidad: 1, subcategoriaId: 9 } }, [
          { subcategoriaId: 9, nombre: 'Hamburguesas', categoriaId: { categoriaId: 2 } as any },
        ]);
        expect(component.producto.subcategoria).toBe('Hamburguesas');
        expect(component.producto.categoria).toBe('Comida');
        expect(component.subcategoriasFiltradas.map((s) => s.nombre)).toEqual(['Hamburguesas']);
      });
    });

    describe('cargarProducto (legacy) - ramas', () => {
      it('no modifica el producto cuando la respuesta no trae data', () => {
        const original = component.producto;
        mockProductoService.getProductoById.mockReturnValue(of(undefined));
        component.cargarProducto('3');
        expect(component.producto).toBe(original);
        expect(component.cargando).toBe(false);
      });

      it('no configura preview si el producto no tiene imagen', () => {
        mockProductoService.getProductoById.mockReturnValue(
          of({ data: { nombre: 'P', precio: 1, cantidad: 1 } }),
        );
        component.cargarProducto('3');
        expect(component.imagenPreview).toBeNull();
        expect(component.producto.nombre).toBe('P');
      });
    });

    describe('crearProducto - ramas', () => {
      beforeEach(() => {
        component.producto = productoValido();
        jest.spyOn(console, 'log').mockImplementation();
      });

      it('asigna subcategoriaId y envía el archivo optimizado', () => {
        const file = new File(['x'], 'x.webp', { type: 'image/webp' });
        component.imagenOptimizada = file;
        component.subcategoriasFiltradas = mockSubcategorias;
        mockProductoService.createProducto.mockReturnValue(of({ code: 400 }));

        component.crearProducto();

        expect(component.producto.subcategoriaId).toBe(9);
        expect(mockProductoService.createProducto).toHaveBeenCalledWith(component.producto, file);
        expect(mockToastr.success).not.toHaveBeenCalled();
        expect(component.guardando).toBe(true);
      });

      it('no asigna subcategoriaId si la subcategoría no está en la lista filtrada', () => {
        component.subcategoriasFiltradas = [];
        mockProductoService.createProducto.mockReturnValue(of({ code: 400 }));

        component.crearProducto();

        expect(component.producto.subcategoriaId).toBeUndefined();
      });
    });

    describe('actualizarProducto - ramas', () => {
      beforeEach(() => {
        component.productoId = '2';
        component.producto = {
          ...productoValido(),
          imagen: 'img.png' as any,
          imagenBase64: 'b64',
        };
        jest.spyOn(console, 'log').mockImplementation();
      });

      it('elimina imagen e imagenBase64 cuando no hay imagen nueva y asigna subcategoriaId', () => {
        component.subcategoriasFiltradas = mockSubcategorias;
        mockProductoService.updateProducto.mockReturnValue(of({ code: 500 }));

        component.actualizarProducto();

        const [id, enviado, archivo] = mockProductoService.updateProducto.mock.calls[0];
        expect(id).toBe(2);
        expect(enviado.imagen).toBeUndefined();
        expect(enviado.imagenBase64).toBeUndefined();
        expect(enviado.subcategoriaId).toBe(9);
        expect(archivo).toBeUndefined();
        expect(mockToastr.success).not.toHaveBeenCalled();
      });

      it('conserva los campos de imagen y envía el archivo cuando hay imagen nueva', () => {
        const file = new File(['x'], 'x.webp', { type: 'image/webp' });
        component.imagenOptimizada = file;
        component.subcategoriasFiltradas = [];
        mockProductoService.updateProducto.mockReturnValue(of({ code: 500 }));

        component.actualizarProducto();

        const [, enviado, archivo] = mockProductoService.updateProducto.mock.calls[0];
        expect(enviado.imagen).toBe('img.png');
        expect(enviado.imagenBase64).toBe('b64');
        expect(enviado.subcategoriaId).toBeUndefined();
        expect(archivo).toBe(file);
      });
    });
  });
});
