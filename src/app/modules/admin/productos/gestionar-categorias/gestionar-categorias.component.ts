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

  // Búsqueda y límites
  busquedaCategoria = '';
  busquedaSubcategoria = '';
  limiteCategorias = 10;
  limiteSubcategorias = 10;
  mostrarTodasCategorias = false;
  mostrarTodasSubcategorias = false;

  // Filtro de subcategorías
  categoriaSeleccionadaFiltro: number | null = null;

  // WebView detection
  isWebView = false;

  constructor(
    private categoriaService: CategoriaService,
    private subcategoriaService: SubcategoriaService,
    private toastr: ToastrService,
    private modalService: ModalService,
  ) {}

  ngOnInit(): void {
    this.detectarWebView();
    this.cargarCategorias();
    this.cargarSubcategorias();
  }

  detectarWebView(): void {
    // Detectar si estamos en Capacitor/Cordova
    this.isWebView =
      typeof (window as any).Capacitor !== 'undefined' ||
      typeof (window as any).cordova !== 'undefined';
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
    const esEdicion = !!(categoria && categoria.categoriaId);
    const nombreActual = categoria?.nombre || '';

    setTimeout(() => {
      this.modalService.openModal({
        title: esEdicion ? 'Editar Categoría' : 'Nueva Categoría',
        input: {
          label: 'Nombre de la categoría',
          value: nombreActual,
        },
        buttons: [
          {
            label: 'Cancelar',
            class: 'btn btn-secondary',
            action: () => this.modalService.closeModal(),
          },
          {
            label: esEdicion ? 'Actualizar' : 'Crear',
            class: 'btn btn-primary primary',
            action: () => {
              const inputElement = document.querySelector(
                '.form-input-enhanced',
              ) as HTMLInputElement;
              const nombreNuevo = inputElement?.value.trim() || '';

              if (!nombreNuevo) {
                this.toastr.warning('El nombre de la categoría es obligatorio', 'Validación');
                return;
              }

              this.modalService.closeModal();
              this.guardarCategoria(nombreNuevo, categoria?.categoriaId);
            },
          },
        ],
      });
    }, 0);
  }

  private guardarCategoria(nombre: string, categoriaId?: number): void {
    this.cargando = true;

    if (categoriaId) {
      // Editar
      this.categoriaService.update(categoriaId, { nombre }).subscribe({
        next: () => {
          this.cargarCategorias();
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
      this.categoriaService.create({ nombre }).subscribe({
        next: () => {
          this.cargarCategorias();
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
    const esEdicion = !!(subcategoria && subcategoria.subcategoriaId);
    const nombreActual = subcategoria?.nombre || '';

    // Extraer el ID real de la categoría (puede venir como objeto o como número)
    let categoriaIdActual: number | null = null;
    if (subcategoria?.categoriaId) {
      categoriaIdActual =
        typeof subcategoria.categoriaId === 'object' && 'categoriaId' in subcategoria.categoriaId
          ? (subcategoria.categoriaId as any).categoriaId
          : (subcategoria.categoriaId as number);
    }

    setTimeout(() => {
      this.modalService.openModal({
        title: esEdicion ? 'Editar Subcategoría' : 'Nueva Subcategoría',
        input: {
          label: 'Nombre de la subcategoría',
          value: nombreActual,
        },
        select: {
          label: 'Categoría',
          options: this.categorias.map((cat) => ({
            label: cat.nombre,
            value: cat.categoriaId!,
          })),
          selected: categoriaIdActual,
        },
        buttons: [
          {
            label: 'Cancelar',
            class: 'btn btn-secondary',
            action: () => this.modalService.closeModal(),
          },
          {
            label: esEdicion ? 'Actualizar' : 'Crear',
            class: 'btn btn-primary primary',
            action: () => {
              const inputElement = document.querySelector(
                '.form-input-enhanced',
              ) as HTMLInputElement;
              const selectElement = document.querySelector(
                '.form-select-enhanced',
              ) as HTMLSelectElement;
              const nombreNuevo = inputElement?.value.trim() || '';
              const categoriaIdNueva = selectElement?.value ? Number(selectElement.value) : null;

              if (!nombreNuevo) {
                this.toastr.warning('El nombre de la subcategoría es obligatorio', 'Validación');
                return;
              }

              if (!categoriaIdNueva) {
                this.toastr.warning('Debe seleccionar una categoría', 'Validación');
                return;
              }

              this.modalService.closeModal();
              this.guardarSubcategoria(nombreNuevo, categoriaIdNueva, subcategoria?.subcategoriaId);
            },
          },
        ],
      });
    }, 0);
  }

  private guardarSubcategoria(nombre: string, categoriaId: number, subcategoriaId?: number): void {
    this.cargando = true;

    if (subcategoriaId) {
      // Editar
      this.subcategoriaService.update(subcategoriaId, { nombre, categoriaId }).subscribe({
        next: () => {
          this.cargarSubcategorias(this.categoriaSeleccionadaFiltro || undefined);
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
      this.subcategoriaService.create({ nombre, categoriaId }).subscribe({
        next: () => {
          this.cargarSubcategorias(this.categoriaSeleccionadaFiltro || undefined);
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

  obtenerNombreCategoria(categoriaId?: number | any): string {
    if (!categoriaId) return 'Sin categoría';

    // El backend puede devolver el categoriaId como objeto en lugar de número
    // Extraer el ID real si es un objeto
    const idReal =
      typeof categoriaId === 'object' && categoriaId.categoriaId
        ? categoriaId.categoriaId
        : categoriaId;

    const categoria = this.categorias.find((c) => c.categoriaId === idReal);
    return categoria ? categoria.nombre : 'Desconocida';
  }

  // ===== BÚSQUEDA Y FILTRADO =====
  get categoriasFiltradas(): Categoria[] {
    let filtradas = this.categorias;

    // Aplicar búsqueda
    if (this.busquedaCategoria.trim()) {
      const termino = this.busquedaCategoria.toLowerCase().trim();
      filtradas = filtradas.filter((cat) => cat.nombre.toLowerCase().includes(termino));
    }

    return filtradas;
  }

  get categoriasVisibles(): Categoria[] {
    const filtradas = this.categoriasFiltradas;
    if (this.mostrarTodasCategorias || filtradas.length <= this.limiteCategorias) {
      return filtradas;
    }
    return filtradas.slice(0, this.limiteCategorias);
  }

  get hayMasCategorias(): boolean {
    return this.categoriasFiltradas.length > this.limiteCategorias && !this.mostrarTodasCategorias;
  }

  verTodasCategorias(): void {
    this.mostrarTodasCategorias = true;
  }

  get subcategoriasFiltradas(): Subcategoria[] {
    let filtradas = this.subcategorias;

    // Aplicar búsqueda
    if (this.busquedaSubcategoria.trim()) {
      const termino = this.busquedaSubcategoria.toLowerCase().trim();
      filtradas = filtradas.filter((sub) => sub.nombre.toLowerCase().includes(termino));
    }

    return filtradas;
  }

  get subcategoriasVisibles(): Subcategoria[] {
    const filtradas = this.subcategoriasFiltradas;
    if (this.mostrarTodasSubcategorias || filtradas.length <= this.limiteSubcategorias) {
      return filtradas;
    }
    return filtradas.slice(0, this.limiteSubcategorias);
  }

  get hayMasSubcategorias(): boolean {
    return (
      this.subcategoriasFiltradas.length > this.limiteSubcategorias &&
      !this.mostrarTodasSubcategorias
    );
  }

  verTodasSubcategorias(): void {
    this.mostrarTodasSubcategorias = true;
  }

  limpiarBusquedaCategoria(): void {
    this.busquedaCategoria = '';
    this.mostrarTodasCategorias = false;
  }

  limpiarBusquedaSubcategoria(): void {
    this.busquedaSubcategoria = '';
    this.mostrarTodasSubcategorias = false;
  }
}
