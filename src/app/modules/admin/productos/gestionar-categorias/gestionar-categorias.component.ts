import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

import { CategoriaService } from '../../../../core/services/categoria.service';
import { ModalService } from '../../../../core/services/modal.service';
import { SubcategoriaService } from '../../../../core/services/subcategoria.service';
import { Categoria } from '../../../../shared/models/categoria.model';
import { Subcategoria } from '../../../../shared/models/subcategoria.model';

@Component({
  selector: 'app-gestionar-categorias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestionar-categorias.component.html',
  styleUrl: './gestionar-categorias.component.scss',
})
export class GestionarCategoriasComponent implements OnInit {
  categorias: Categoria[] = [];
  subcategorias: Subcategoria[] = [];
  cargando = false;
  error = '';

  // Formularios
  mostrarFormCategoria = false;
  mostrarFormSubcategoria = false;
  editandoCategoria = false;
  editandoSubcategoria = false;

  // Datos de formulario
  categoriaForm: Categoria = { nombre: '' };
  subcategoriaForm: Subcategoria = { nombre: '', categoriaId: undefined };

  // Filtro de subcategorías
  categoriaSeleccionadaFiltro: number | null = null;

  constructor(
    private categoriaService: CategoriaService,
    private subcategoriaService: SubcategoriaService,
    private toastr: ToastrService,
    private modalService: ModalService,
  ) {}

  ngOnInit(): void {
    this.cargarCategorias();
    this.cargarSubcategorias();
  }

  cargarCategorias(): void {
    this.cargando = true;
    this.categoriaService.list().subscribe({
      next: (data) => {
        this.categorias = data;
        this.cargando = false;
      },
      error: (err) => {
        this.error = 'Error al cargar categorías';
        console.error(err);
        this.cargando = false;
      },
    });
  }

  cargarSubcategorias(categoriaId?: number): void {
    this.cargando = true;
    this.subcategoriaService.list(categoriaId).subscribe({
      next: (data) => {
        this.subcategorias = data;
        this.cargando = false;
      },
      error: (err) => {
        this.error = 'Error al cargar subcategorías';
        console.error(err);
        this.cargando = false;
      },
    });
  }

  // ===== CATEGORÍAS =====
  abrirFormCategoria(categoria?: Categoria): void {
    if (categoria && categoria.categoriaId) {
      this.editandoCategoria = true;
      this.categoriaForm = { ...categoria };
    } else {
      this.editandoCategoria = false;
      this.categoriaForm = { nombre: '' };
    }
    this.mostrarFormCategoria = true;
  }

  cerrarFormCategoria(): void {
    this.mostrarFormCategoria = false;
    this.categoriaForm = { nombre: '' };
    this.editandoCategoria = false;
  }

  guardarCategoria(): void {
    if (!this.categoriaForm.nombre.trim()) {
      this.toastr.warning('El nombre de la categoría es obligatorio', 'Validación');
      return;
    }

    this.cargando = true;

    if (this.editandoCategoria && this.categoriaForm.categoriaId) {
      // Editar
      this.categoriaService
        .update(this.categoriaForm.categoriaId, { nombre: this.categoriaForm.nombre })
        .subscribe({
          next: () => {
            this.cargarCategorias();
            this.cerrarFormCategoria();
            this.toastr.success('Categoría actualizada correctamente', 'Éxito');
          },
          error: (err) => {
            console.error(err);
            this.toastr.error('Error al actualizar la categoría', 'Error');
            this.cargando = false;
          },
        });
    } else {
      // Crear
      this.categoriaService.create({ nombre: this.categoriaForm.nombre }).subscribe({
        next: () => {
          this.cargarCategorias();
          this.cerrarFormCategoria();
          this.toastr.success('Categoría creada correctamente', 'Éxito');
        },
        error: (err) => {
          console.error(err);
          this.toastr.error('Error al crear la categoría', 'Error');
          this.cargando = false;
        },
      });
    }
  }

  eliminarCategoria(categoria: Categoria): void {
    if (!categoria.categoriaId) return;

    // Diferir la apertura del modal al siguiente ciclo para mejorar la fluidez
    setTimeout(() => {
      this.modalService.openModal({
        title: 'Confirmar eliminación',
        message: `¿Está seguro de eliminar la categoría "${categoria.nombre}"?`,
        buttons: [
          {
            label: 'Cancelar',
            class: 'btn btn-secondary',
            action: () => this.modalService.closeModal(),
          },
          {
            label: 'Eliminar',
            class: 'btn btn-danger primary',
            action: () => {
              this.modalService.closeModal();
              this.confirmarEliminacionCategoria(categoria.categoriaId!);
            },
          },
        ],
      });
    }, 0);
  }

  private confirmarEliminacionCategoria(categoriaId: number): void {
    this.cargando = true;
    this.categoriaService.delete(categoriaId).subscribe({
      next: () => {
        this.cargarCategorias();
        this.cargarSubcategorias(); // Recargar subcategorías también
        this.toastr.success('Categoría eliminada correctamente', 'Éxito');
      },
      error: (err) => {
        console.error(err);
        this.toastr.error(
          'Error al eliminar la categoría. Puede tener subcategorías o productos asociados.',
          'Error',
        );
        this.cargando = false;
      },
    });
  }

  // ===== SUBCATEGORÍAS =====
  abrirFormSubcategoria(subcategoria?: Subcategoria): void {
    if (subcategoria && subcategoria.subcategoriaId) {
      this.editandoSubcategoria = true;
      this.subcategoriaForm = { ...subcategoria };
    } else {
      this.editandoSubcategoria = false;
      this.subcategoriaForm = { nombre: '', categoriaId: undefined };
    }
    this.mostrarFormSubcategoria = true;
  }

  cerrarFormSubcategoria(): void {
    this.mostrarFormSubcategoria = false;
    this.subcategoriaForm = { nombre: '', categoriaId: undefined };
    this.editandoSubcategoria = false;
  }

  guardarSubcategoria(): void {
    if (!this.subcategoriaForm.nombre.trim()) {
      this.toastr.warning('El nombre de la subcategoría es obligatorio', 'Validación');
      return;
    }

    if (!this.subcategoriaForm.categoriaId) {
      this.toastr.warning('Debe seleccionar una categoría', 'Validación');
      return;
    }

    this.cargando = true;

    if (this.editandoSubcategoria && this.subcategoriaForm.subcategoriaId) {
      // Editar
      this.subcategoriaService
        .update(this.subcategoriaForm.subcategoriaId, {
          nombre: this.subcategoriaForm.nombre,
          categoriaId: this.subcategoriaForm.categoriaId,
        })
        .subscribe({
          next: () => {
            this.cargarSubcategorias(this.categoriaSeleccionadaFiltro || undefined);
            this.cerrarFormSubcategoria();
            this.toastr.success('Subcategoría actualizada correctamente', 'Éxito');
          },
          error: (err) => {
            console.error(err);
            this.toastr.error('Error al actualizar la subcategoría', 'Error');
            this.cargando = false;
          },
        });
    } else {
      // Crear
      this.subcategoriaService
        .create({
          nombre: this.subcategoriaForm.nombre,
          categoriaId: this.subcategoriaForm.categoriaId,
        })
        .subscribe({
          next: () => {
            this.cargarSubcategorias(this.categoriaSeleccionadaFiltro || undefined);
            this.cerrarFormSubcategoria();
            this.toastr.success('Subcategoría creada correctamente', 'Éxito');
          },
          error: (err) => {
            console.error(err);
            this.toastr.error('Error al crear la subcategoría', 'Error');
            this.cargando = false;
          },
        });
    }
  }

  eliminarSubcategoria(subcategoria: Subcategoria): void {
    if (!subcategoria.subcategoriaId) return;

    // Diferir la apertura del modal al siguiente ciclo para mejorar la fluidez
    setTimeout(() => {
      this.modalService.openModal({
        title: 'Confirmar eliminación',
        message: `¿Está seguro de eliminar la subcategoría "${subcategoria.nombre}"?`,
        buttons: [
          {
            label: 'Cancelar',
            class: 'btn btn-secondary',
            action: () => this.modalService.closeModal(),
          },
          {
            label: 'Eliminar',
            class: 'btn btn-danger primary',
            action: () => {
              this.modalService.closeModal();
              this.confirmarEliminacionSubcategoria(subcategoria.subcategoriaId!);
            },
          },
        ],
      });
    }, 0);
  }

  private confirmarEliminacionSubcategoria(subcategoriaId: number): void {
    this.cargando = true;
    this.subcategoriaService.delete(subcategoriaId).subscribe({
      next: () => {
        this.cargarSubcategorias(this.categoriaSeleccionadaFiltro || undefined);
        this.toastr.success('Subcategoría eliminada correctamente', 'Éxito');
      },
      error: (err) => {
        console.error(err);
        this.toastr.error(
          'Error al eliminar la subcategoría. Puede tener productos asociados.',
          'Error',
        );
        this.cargando = false;
      },
    });
  }

  filtrarSubcategorias(): void {
    if (this.categoriaSeleccionadaFiltro) {
      this.cargarSubcategorias(this.categoriaSeleccionadaFiltro);
    } else {
      this.cargarSubcategorias();
    }
  }

  limpiarFiltro(): void {
    this.categoriaSeleccionadaFiltro = null;
    this.cargarSubcategorias();
  }

  obtenerNombreCategoria(categoriaId?: number): string {
    if (!categoriaId) return 'Sin categoría';
    const categoria = this.categorias.find((c) => c.categoriaId === categoriaId);
    return categoria ? categoria.nombre : 'Desconocida';
  }
}
