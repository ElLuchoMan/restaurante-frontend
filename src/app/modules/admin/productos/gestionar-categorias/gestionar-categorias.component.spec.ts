import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { of, throwError } from 'rxjs';

import { CategoriaService } from '../../../../core/services/categoria.service';
import { ModalService } from '../../../../core/services/modal.service';
import { SubcategoriaService } from '../../../../core/services/subcategoria.service';
import {
  mockCategoriaCreateResponse,
  mockCategoriasResponse,
} from '../../../../shared/mocks/categoria.mock';
import {
  mockSubcategoriaCreateResponse,
  mockSubcategoriasResponse,
} from '../../../../shared/mocks/subcategoria.mock';
import {
  createCategoriaServiceMock,
  createModalServiceMock,
  createSubcategoriaServiceMock,
  createToastrMock,
} from '../../../../shared/mocks/test-doubles';
import { GestionarCategoriasComponent } from './gestionar-categorias.component';

describe('GestionarCategoriasComponent', () => {
  let component: GestionarCategoriasComponent;
  let fixture: ComponentFixture<GestionarCategoriasComponent>;
  let mockCategoriaService: jest.Mocked<CategoriaService>;
  let mockSubcategoriaService: jest.Mocked<SubcategoriaService>;
  let mockToastr: jest.Mocked<ToastrService>;
  let mockModalService: jest.Mocked<ModalService>;

  beforeEach(async () => {
    mockCategoriaService = createCategoriaServiceMock();
    mockSubcategoriaService = createSubcategoriaServiceMock();
    mockToastr = createToastrMock();
    mockModalService = createModalServiceMock();

    await TestBed.configureTestingModule({
      imports: [GestionarCategoriasComponent, FormsModule],
      providers: [
        { provide: CategoriaService, useValue: mockCategoriaService },
        { provide: SubcategoriaService, useValue: mockSubcategoriaService },
        { provide: ToastrService, useValue: mockToastr },
        { provide: ModalService, useValue: mockModalService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GestionarCategoriasComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load categorias and subcategorias on init', () => {
      mockCategoriaService.list.mockReturnValue(of(mockCategoriasResponse.data));
      mockSubcategoriaService.list.mockReturnValue(of(mockSubcategoriasResponse.data));

      fixture.detectChanges(); // triggers ngOnInit

      expect(mockCategoriaService.list).toHaveBeenCalled();
      expect(mockSubcategoriaService.list).toHaveBeenCalled();
      expect(component.categorias).toEqual(mockCategoriasResponse.data);
      expect(component.subcategorias).toEqual(mockSubcategoriasResponse.data);
    });
  });

  describe('cargarCategorias', () => {
    it('should load categorias successfully', () => {
      mockCategoriaService.list.mockReturnValue(of(mockCategoriasResponse.data));

      component.cargarCategorias();

      expect(component.cargando).toBe(false);
      expect(component.categorias).toEqual(mockCategoriasResponse.data);
    });

    it('should handle error when loading categorias', () => {
      mockCategoriaService.list.mockReturnValue(throwError(() => new Error('Error')));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      component.cargarCategorias();

      expect(component.error).toBe('Error al cargar categorías');
      expect(component.cargando).toBe(false);
      consoleSpy.mockRestore();
    });
  });

  describe('cargarSubcategorias', () => {
    it('should load subcategorias successfully', () => {
      mockSubcategoriaService.list.mockReturnValue(of(mockSubcategoriasResponse.data));

      component.cargarSubcategorias();

      expect(component.cargando).toBe(false);
      expect(component.subcategorias).toEqual(mockSubcategoriasResponse.data);
    });

    it('should load subcategorias with filter', () => {
      mockSubcategoriaService.list.mockReturnValue(of(mockSubcategoriasResponse.data));

      component.cargarSubcategorias(1);

      expect(mockSubcategoriaService.list).toHaveBeenCalledWith(1);
    });

    it('should handle error when loading subcategorias', () => {
      mockSubcategoriaService.list.mockReturnValue(throwError(() => new Error('Error')));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      component.cargarSubcategorias();

      expect(component.error).toBe('Error al cargar subcategorías');
      expect(component.cargando).toBe(false);
      consoleSpy.mockRestore();
    });
  });

  describe('abrirFormCategoria', () => {
    it('should open form for new categoria', () => {
      component.abrirFormCategoria();

      expect(component.mostrarFormCategoria).toBe(true);
      expect(component.editandoCategoria).toBe(false);
      expect(component.categoriaForm.nombre).toBe('');
    });

    it('should open form for editing categoria', () => {
      const categoria = { categoriaId: 1, nombre: 'Bebidas' };

      component.abrirFormCategoria(categoria);

      expect(component.mostrarFormCategoria).toBe(true);
      expect(component.editandoCategoria).toBe(true);
      expect(component.categoriaForm).toEqual(categoria);
    });
  });

  describe('cerrarFormCategoria', () => {
    it('should close form and reset values', () => {
      component.mostrarFormCategoria = true;
      component.categoriaForm = { categoriaId: 1, nombre: 'Test' };
      component.editandoCategoria = true;

      component.cerrarFormCategoria();

      expect(component.mostrarFormCategoria).toBe(false);
      expect(component.categoriaForm.nombre).toBe('');
      expect(component.editandoCategoria).toBe(false);
    });
  });

  describe('guardarCategoria', () => {
    beforeEach(() => {
      mockCategoriaService.list.mockReturnValue(of(mockCategoriasResponse.data));
    });

    it('should not save if nombre is empty', () => {
      component.categoriaForm.nombre = '';

      component.guardarCategoria();

      expect(mockToastr.warning).toHaveBeenCalledWith(
        'El nombre de la categoría es obligatorio',
        'Validación',
      );
      expect(mockCategoriaService.create).not.toHaveBeenCalled();
    });

    it('should create new categoria', () => {
      mockCategoriaService.create.mockReturnValue(of(mockCategoriaCreateResponse.data));
      component.categoriaForm.nombre = 'Nueva Categoría';

      component.guardarCategoria();

      expect(mockCategoriaService.create).toHaveBeenCalledWith({ nombre: 'Nueva Categoría' });
      expect(mockToastr.success).toHaveBeenCalledWith('Categoría creada correctamente', 'Éxito');
    });

    it('should update existing categoria', () => {
      mockCategoriaService.update.mockReturnValue(of({ categoriaId: 1, nombre: 'Updated' }));
      component.editandoCategoria = true;
      component.categoriaForm = { categoriaId: 1, nombre: 'Updated' };

      component.guardarCategoria();

      expect(mockCategoriaService.update).toHaveBeenCalledWith(1, { nombre: 'Updated' });
      expect(mockToastr.success).toHaveBeenCalledWith(
        'Categoría actualizada correctamente',
        'Éxito',
      );
    });

    it('should handle error when creating categoria', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockCategoriaService.create.mockReturnValue(throwError(() => new Error('Error')));
      component.categoriaForm.nombre = 'Test';

      component.guardarCategoria();

      expect(mockToastr.error).toHaveBeenCalledWith('Error al crear la categoría', 'Error');
      consoleSpy.mockRestore();
    });

    it('should handle error when updating categoria', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockCategoriaService.update.mockReturnValue(throwError(() => new Error('Error')));
      component.editandoCategoria = true;
      component.categoriaForm = { categoriaId: 1, nombre: 'Test' };

      component.guardarCategoria();

      expect(mockToastr.error).toHaveBeenCalledWith('Error al actualizar la categoría', 'Error');
      consoleSpy.mockRestore();
    });
  });

  describe('eliminarCategoria', () => {
    beforeEach(() => {
      mockCategoriaService.list.mockReturnValue(of(mockCategoriasResponse.data));
      mockSubcategoriaService.list.mockReturnValue(of(mockSubcategoriasResponse.data));
    });

    it('should not open modal if no categoriaId', fakeAsync(() => {
      component.eliminarCategoria({ nombre: 'Test' });
      tick();

      expect(mockModalService.openModal).not.toHaveBeenCalled();
    }));

    it('should open confirmation modal with correct data', fakeAsync(() => {
      component.eliminarCategoria({ categoriaId: 1, nombre: 'Test' });
      tick();

      expect(mockModalService.openModal).toHaveBeenCalledWith({
        title: 'Confirmar eliminación',
        message: '¿Está seguro de eliminar la categoría "Test"?',
        buttons: [
          {
            label: 'Cancelar',
            class: 'btn btn-secondary',
            action: expect.any(Function),
          },
          {
            label: 'Eliminar',
            class: 'btn btn-danger primary',
            action: expect.any(Function),
          },
        ],
      });
    }));

    it('should close modal when user cancels', fakeAsync(() => {
      component.eliminarCategoria({ categoriaId: 1, nombre: 'Test' });
      tick();

      // Obtener el botón de cancelar y ejecutar su action
      const modalCall = mockModalService.openModal.mock.calls[0][0];
      const cancelButton = modalCall.buttons![0];
      cancelButton.action();

      expect(mockModalService.closeModal).toHaveBeenCalled();
      expect(mockCategoriaService.delete).not.toHaveBeenCalled();
    }));

    it('should delete categoria when user confirms', fakeAsync(() => {
      mockCategoriaService.delete.mockReturnValue(of({} as any));
      component.eliminarCategoria({ categoriaId: 1, nombre: 'Test' });
      tick();

      // Obtener el botón de eliminar y ejecutar su action
      const modalCall = mockModalService.openModal.mock.calls[0][0];
      const deleteButton = modalCall.buttons![1];
      deleteButton.action();

      expect(mockModalService.closeModal).toHaveBeenCalled();
      expect(mockCategoriaService.delete).toHaveBeenCalledWith(1);
      expect(mockToastr.success).toHaveBeenCalledWith('Categoría eliminada correctamente', 'Éxito');
    }));

    it('should handle error when deleting categoria', fakeAsync(() => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockCategoriaService.delete.mockReturnValue(throwError(() => new Error('Error')));

      component.eliminarCategoria({ categoriaId: 1, nombre: 'Test' });
      tick();

      // Ejecutar la acción de eliminar
      const modalCall = mockModalService.openModal.mock.calls[0][0];
      const deleteButton = modalCall.buttons![1];
      deleteButton.action();

      expect(mockToastr.error).toHaveBeenCalledWith(
        'Error al eliminar la categoría. Puede tener subcategorías o productos asociados.',
        'Error',
      );
      consoleSpy.mockRestore();
    }));
  });

  describe('abrirFormSubcategoria', () => {
    it('should open form for new subcategoria', () => {
      component.abrirFormSubcategoria();

      expect(component.mostrarFormSubcategoria).toBe(true);
      expect(component.editandoSubcategoria).toBe(false);
      expect(component.subcategoriaForm.nombre).toBe('');
    });

    it('should open form for editing subcategoria', () => {
      const subcategoria = { subcategoriaId: 1, nombre: 'Test', categoriaId: 1 };

      component.abrirFormSubcategoria(subcategoria);

      expect(component.mostrarFormSubcategoria).toBe(true);
      expect(component.editandoSubcategoria).toBe(true);
      expect(component.subcategoriaForm).toEqual(subcategoria);
    });
  });

  describe('cerrarFormSubcategoria', () => {
    it('should close form and reset values', () => {
      component.mostrarFormSubcategoria = true;
      component.subcategoriaForm = { subcategoriaId: 1, nombre: 'Test', categoriaId: 1 };
      component.editandoSubcategoria = true;

      component.cerrarFormSubcategoria();

      expect(component.mostrarFormSubcategoria).toBe(false);
      expect(component.subcategoriaForm.nombre).toBe('');
      expect(component.editandoSubcategoria).toBe(false);
    });
  });

  describe('guardarSubcategoria', () => {
    beforeEach(() => {
      mockSubcategoriaService.list.mockReturnValue(of(mockSubcategoriasResponse.data));
    });

    it('should not save if nombre is empty', () => {
      component.subcategoriaForm.nombre = '';

      component.guardarSubcategoria();

      expect(mockToastr.warning).toHaveBeenCalledWith(
        'El nombre de la subcategoría es obligatorio',
        'Validación',
      );
    });

    it('should not save if categoriaId is not set', () => {
      component.subcategoriaForm.nombre = 'Test';
      component.subcategoriaForm.categoriaId = undefined;

      component.guardarSubcategoria();

      expect(mockToastr.warning).toHaveBeenCalledWith(
        'Debe seleccionar una categoría',
        'Validación',
      );
    });

    it('should create new subcategoria', () => {
      mockSubcategoriaService.create.mockReturnValue(of(mockSubcategoriaCreateResponse.data));
      component.subcategoriaForm = { nombre: 'Nueva Subcategoría', categoriaId: 1 };

      component.guardarSubcategoria();

      expect(mockSubcategoriaService.create).toHaveBeenCalledWith({
        nombre: 'Nueva Subcategoría',
        categoriaId: 1,
      });
      expect(mockToastr.success).toHaveBeenCalledWith('Subcategoría creada correctamente', 'Éxito');
    });

    it('should update existing subcategoria', () => {
      mockSubcategoriaService.update.mockReturnValue(
        of({ subcategoriaId: 1, nombre: 'Updated', categoriaId: 1 }),
      );
      component.editandoSubcategoria = true;
      component.subcategoriaForm = { subcategoriaId: 1, nombre: 'Updated', categoriaId: 1 };

      component.guardarSubcategoria();

      expect(mockSubcategoriaService.update).toHaveBeenCalledWith(1, {
        nombre: 'Updated',
        categoriaId: 1,
      });
      expect(mockToastr.success).toHaveBeenCalledWith(
        'Subcategoría actualizada correctamente',
        'Éxito',
      );
    });

    it('should handle error when creating subcategoria', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockSubcategoriaService.create.mockReturnValue(throwError(() => new Error('Error')));
      component.subcategoriaForm = { nombre: 'Test', categoriaId: 1 };

      component.guardarSubcategoria();

      expect(mockToastr.error).toHaveBeenCalledWith('Error al crear la subcategoría', 'Error');
      consoleSpy.mockRestore();
    });

    it('should handle error when updating subcategoria', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockSubcategoriaService.update.mockReturnValue(throwError(() => new Error('Error')));
      component.editandoSubcategoria = true;
      component.subcategoriaForm = { subcategoriaId: 1, nombre: 'Test', categoriaId: 1 };

      component.guardarSubcategoria();

      expect(mockToastr.error).toHaveBeenCalledWith('Error al actualizar la subcategoría', 'Error');
      consoleSpy.mockRestore();
    });
  });

  describe('eliminarSubcategoria', () => {
    beforeEach(() => {
      mockSubcategoriaService.list.mockReturnValue(of(mockSubcategoriasResponse.data));
    });

    it('should not open modal if no subcategoriaId', fakeAsync(() => {
      component.eliminarSubcategoria({ nombre: 'Test', categoriaId: 1 });
      tick();

      expect(mockModalService.openModal).not.toHaveBeenCalled();
    }));

    it('should open confirmation modal with correct data', fakeAsync(() => {
      component.eliminarSubcategoria({ subcategoriaId: 1, nombre: 'Test', categoriaId: 1 });
      tick();

      expect(mockModalService.openModal).toHaveBeenCalledWith({
        title: 'Confirmar eliminación',
        message: '¿Está seguro de eliminar la subcategoría "Test"?',
        buttons: [
          {
            label: 'Cancelar',
            class: 'btn btn-secondary',
            action: expect.any(Function),
          },
          {
            label: 'Eliminar',
            class: 'btn btn-danger primary',
            action: expect.any(Function),
          },
        ],
      });
    }));

    it('should close modal when user cancels', fakeAsync(() => {
      component.eliminarSubcategoria({ subcategoriaId: 1, nombre: 'Test', categoriaId: 1 });
      tick();

      // Obtener el botón de cancelar y ejecutar su action
      const modalCall = mockModalService.openModal.mock.calls[0][0];
      const cancelButton = modalCall.buttons![0];
      cancelButton.action();

      expect(mockModalService.closeModal).toHaveBeenCalled();
      expect(mockSubcategoriaService.delete).not.toHaveBeenCalled();
    }));

    it('should delete subcategoria when user confirms', fakeAsync(() => {
      mockSubcategoriaService.delete.mockReturnValue(of({} as any));
      component.eliminarSubcategoria({ subcategoriaId: 1, nombre: 'Test', categoriaId: 1 });
      tick();

      // Obtener el botón de eliminar y ejecutar su action
      const modalCall = mockModalService.openModal.mock.calls[0][0];
      const deleteButton = modalCall.buttons![1];
      deleteButton.action();

      expect(mockModalService.closeModal).toHaveBeenCalled();
      expect(mockSubcategoriaService.delete).toHaveBeenCalledWith(1);
      expect(mockToastr.success).toHaveBeenCalledWith(
        'Subcategoría eliminada correctamente',
        'Éxito',
      );
    }));

    it('should handle error when deleting subcategoria', fakeAsync(() => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockSubcategoriaService.delete.mockReturnValue(throwError(() => new Error('Error')));

      component.eliminarSubcategoria({ subcategoriaId: 1, nombre: 'Test', categoriaId: 1 });
      tick();

      // Ejecutar la acción de eliminar
      const modalCall = mockModalService.openModal.mock.calls[0][0];
      const deleteButton = modalCall.buttons![1];
      deleteButton.action();

      expect(mockToastr.error).toHaveBeenCalledWith(
        'Error al eliminar la subcategoría. Puede tener productos asociados.',
        'Error',
      );
      consoleSpy.mockRestore();
    }));
  });

  describe('filtrarSubcategorias', () => {
    it('should filter subcategorias by categoria', () => {
      mockSubcategoriaService.list.mockReturnValue(of(mockSubcategoriasResponse.data));
      component.categoriaSeleccionadaFiltro = 1;

      component.filtrarSubcategorias();

      expect(mockSubcategoriaService.list).toHaveBeenCalledWith(1);
    });

    it('should load all subcategorias if no filter', () => {
      mockSubcategoriaService.list.mockReturnValue(of(mockSubcategoriasResponse.data));
      component.categoriaSeleccionadaFiltro = null;

      component.filtrarSubcategorias();

      expect(mockSubcategoriaService.list).toHaveBeenCalledWith(undefined);
    });
  });

  describe('limpiarFiltro', () => {
    it('should clear filter and reload subcategorias', () => {
      mockSubcategoriaService.list.mockReturnValue(of(mockSubcategoriasResponse.data));
      component.categoriaSeleccionadaFiltro = 1;

      component.limpiarFiltro();

      expect(component.categoriaSeleccionadaFiltro).toBeNull();
      expect(mockSubcategoriaService.list).toHaveBeenCalledWith(undefined);
    });
  });

  describe('obtenerNombreCategoria', () => {
    beforeEach(() => {
      component.categorias = mockCategoriasResponse.data;
    });

    it('should return category name if found', () => {
      const nombre = component.obtenerNombreCategoria(1);
      expect(nombre).toBe('Bebidas');
    });

    it('should return "Desconocida" if not found', () => {
      const nombre = component.obtenerNombreCategoria(999);
      expect(nombre).toBe('Desconocida');
    });

    it('should return "Sin categoría" if no id provided', () => {
      const nombre = component.obtenerNombreCategoria(undefined);
      expect(nombre).toBe('Sin categoría');
    });
  });
});
