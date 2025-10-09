import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { forkJoin } from 'rxjs';

import { CategoriaService } from '../../../../core/services/categoria.service';
import { ProductoService } from '../../../../core/services/producto.service';
import { SubcategoriaService } from '../../../../core/services/subcategoria.service';
import { estadoProducto } from '../../../../shared/constants';
import { Categoria } from '../../../../shared/models/categoria.model';
import { Producto } from '../../../../shared/models/producto.model';
import { Subcategoria } from '../../../../shared/models/subcategoria.model';
import { ImageOptimizationService } from '../../../../shared/services/image-optimization.service';

@Component({
  selector: 'app-crear-producto',
  standalone: true,
  templateUrl: './crear-producto.component.html',
  styleUrls: ['./crear-producto.component.scss'],
  imports: [CommonModule, FormsModule],
})
export class CrearProductoComponent implements OnInit {
  producto: Producto = {
    nombre: '',
    calorias: 0,
    descripcion: '',
    precio: 0,
    estadoProducto: estadoProducto.DISPONIBLE,
    cantidad: 0,
    categoria: '',
    subcategoria: '',
  };

  // Listas para selects
  categorias: Categoria[] = [];
  subcategorias: Subcategoria[] = [];
  subcategoriasFiltradas: Subcategoria[] = [];

  // Estados de UI
  cargando = false;
  guardando = false;
  estadoProducto = estadoProducto;
  productoId: string | null = null;
  esEdicion = false;
  isWebView = false;

  // Preview de imagen
  imagenPreview: string | null = null;
  isDragging = false;

  // Optimización de imagen
  optimizandoImagen = false;
  progresoOptimizacion = 0;
  imagenOptimizada: File | null = null; // Guardar el File optimizado para enviar

  constructor(
    private productoService: ProductoService,
    private categoriaService: CategoriaService,
    private subcategoriaService: SubcategoriaService,
    private toastr: ToastrService,
    private router: Router,
    private route: ActivatedRoute,
    private imageOptimizationService: ImageOptimizationService,
  ) {}

  ngOnInit(): void {
    this.detectarWebView();
    this.productoId = this.route.snapshot.paramMap.get('id');
    this.esEdicion = !!this.productoId;

    // Si es edición, cargar todo en paralelo antes de mapear el producto
    if (this.esEdicion) {
      this.cargarDatosEdicion();
    } else {
      // Si es creación, solo cargar las listas
      this.cargarCategorias();
      this.cargarSubcategorias();
    }
  }

  detectarWebView(): void {
    this.isWebView =
      typeof (window as any).Capacitor !== 'undefined' ||
      typeof (window as any).cordova !== 'undefined';
  }

  cargarCategorias(): void {
    this.categoriaService.list().subscribe({
      next: (data) => {
        this.categorias = data;
      },
      error: (err) => {
        console.error('Error al cargar categorías:', err);
        this.toastr.error('Error al cargar categorías', 'Error');
      },
    });
  }

  cargarSubcategorias(): void {
    this.subcategoriaService.list().subscribe({
      next: (data) => {
        this.subcategorias = data;
        this.subcategoriasFiltradas = data;
      },
      error: (err) => {
        console.error('Error al cargar subcategorías:', err);
        this.toastr.error('Error al cargar subcategorías', 'Error');
      },
    });
  }

  /**
   * Carga categorías, subcategorías y producto en paralelo para edición
   */
  cargarDatosEdicion(): void {
    this.cargando = true;

    forkJoin({
      categorias: this.categoriaService.list(),
      subcategorias: this.subcategoriaService.list(),
      producto: this.productoService.getProductoById(Number(this.productoId)),
    }).subscribe({
      next: (result) => {
        // Guardar listas
        this.categorias = result.categorias;
        this.subcategorias = result.subcategorias;
        this.subcategoriasFiltradas = result.subcategorias;

        // Procesar producto
        if (result.producto?.data) {
          this.producto = result.producto.data;

          // Configurar preview de imagen si existe
          if (this.producto.imagenBase64) {
            this.imagenPreview = this.producto.imagenBase64;
          }

          // Mapear subcategoriaId a nombres de categoría y subcategoría
          if (this.producto.subcategoriaId) {
            const subcategoria = this.subcategorias.find(
              (sub) => sub.subcategoriaId === this.producto.subcategoriaId,
            );

            if (subcategoria) {
              // Asignar nombre de subcategoría
              this.producto.subcategoria = subcategoria.nombre;

              // Buscar y asignar nombre de categoría
              const categoriaId =
                typeof subcategoria.categoriaId === 'object' &&
                'categoriaId' in subcategoria.categoriaId
                  ? (subcategoria.categoriaId as any).categoriaId
                  : subcategoria.categoriaId;

              const categoria = this.categorias.find((cat) => cat.categoriaId === categoriaId);

              if (categoria) {
                this.producto.categoria = categoria.nombre;
                // Filtrar subcategorías según la categoría seleccionada
                this.onCategoriaChange();
              }
            }
          }
        }

        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar datos para edición:', err);
        this.toastr.error('Error al cargar los datos del producto', 'Error');
        this.cargando = false;
        this.router.navigate(['/admin/productos']);
      },
    });
  }

  onCategoriaChange(): void {
    // Verificar que las propiedades necesarias estén inicializadas
    if (!this.categorias || !this.subcategorias) {
      return;
    }

    if (this.producto.categoria) {
      // Filtrar subcategorías por la categoría seleccionada
      const categoria = this.categorias.find((c) => c.nombre === this.producto.categoria);
      if (categoria?.categoriaId) {
        this.subcategoriasFiltradas = this.subcategorias.filter((sub) => {
          const subCatId =
            typeof sub.categoriaId === 'object' && 'categoriaId' in sub.categoriaId
              ? (sub.categoriaId as any).categoriaId
              : sub.categoriaId;
          return subCatId === categoria.categoriaId;
        });
      }
      // Limpiar subcategoría si ya no está en la lista filtrada
      if (
        this.subcategoriasFiltradas &&
        !this.subcategoriasFiltradas.find((sub) => sub.nombre === this.producto.subcategoria)
      ) {
        this.producto.subcategoria = '';
      }
    } else {
      this.subcategoriasFiltradas = this.subcategorias;
      this.producto.subcategoria = '';
    }
  }
  seleccionarImagen(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      this.procesarArchivo(file);
    }
  }

  eliminarImagen(): void {
    this.producto.imagenBase64 = undefined;
    this.imagenPreview = null;
    this.imagenOptimizada = null;
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (input) input.value = '';
  }

  // Drag & Drop handlers
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      this.procesarArchivo(file);
    }
  }

  private async procesarArchivo(file: File): Promise<void> {
    // Validar tipo de imagen
    if (!this.imageOptimizationService.isValidImageFile(file)) {
      this.toastr.warning(
        'Solo se permiten archivos de imagen (JPG, PNG, GIF, WEBP, AVIF, HEIC)',
        'Advertencia',
      );
      return;
    }

    // Validar tamaño máximo antes de optimizar (max 20MB para el archivo original)
    const maxSizeOriginal = 20 * 1024 * 1024;
    if (file.size > maxSizeOriginal) {
      this.toastr.warning('La imagen original no debe superar los 20MB', 'Advertencia');
      return;
    }

    try {
      this.optimizandoImagen = true;
      this.progresoOptimizacion = 0;

      // Optimizar imagen (convertir a WebP, redimensionar a 800x800, comprimir a 100-150KB)
      const result = await this.imageOptimizationService.optimizeImage(file, (progress) => {
        this.progresoOptimizacion = progress;
      });

      // Guardar el archivo optimizado para enviar al backend
      this.imagenOptimizada = result.file;

      // Crear preview
      this.imagenPreview = URL.createObjectURL(result.file);

      // Mostrar información de optimización
      const originalSizeFormatted = this.imageOptimizationService.formatFileSize(
        result.originalSize,
      );
      const optimizedSizeFormatted = this.imageOptimizationService.formatFileSize(
        result.optimizedSize,
      );
      const compressionPercent = result.compressionRatio.toFixed(1);

      this.toastr.success(
        `Imagen optimizada: ${originalSizeFormatted} → ${optimizedSizeFormatted} (${compressionPercent}% de reducción)`,
        'Éxito',
        { timeOut: 5000 },
      );
    } catch (error) {
      console.error('Error al procesar imagen:', error);
      this.toastr.error(
        error instanceof Error ? error.message : 'Error al procesar la imagen',
        'Error',
      );
    } finally {
      this.optimizandoImagen = false;
      this.progresoOptimizacion = 0;
    }
  }

  validarFormulario(): boolean {
    if (!this.producto.nombre?.trim()) {
      this.toastr.warning('El nombre del producto es obligatorio', 'Validación');
      return false;
    }

    if (!this.producto.precio || this.producto.precio <= 0) {
      this.toastr.warning('El precio debe ser mayor a 0', 'Validación');
      return false;
    }

    if (!this.producto.categoria) {
      this.toastr.warning('Debe seleccionar una categoría', 'Validación');
      return false;
    }

    if (!this.producto.subcategoria) {
      this.toastr.warning('Debe seleccionar una subcategoría', 'Validación');
      return false;
    }

    return true;
  }

  crearProducto(): void {
    if (!this.validarFormulario()) return;

    this.guardando = true;

    // Convertir nombre de subcategoría a ID
    const subcategoria = this.subcategoriasFiltradas.find(
      (sub) => sub.nombre === this.producto.subcategoria,
    );

    if (subcategoria?.subcategoriaId) {
      this.producto.subcategoriaId = subcategoria.subcategoriaId;
    }

    console.log('Producto a enviar:', {
      ...this.producto,
      subcategoriaId: this.producto.subcategoriaId,
    });

    // Enviar el archivo optimizado si existe, sino enviar el producto con imagenBase64
    this.productoService
      .createProducto(this.producto, this.imagenOptimizada || undefined)
      .subscribe({
        next: (response) => {
          if (response.code === 201) {
            this.toastr.success('Producto creado con éxito', 'Éxito');
            setTimeout(() => this.router.navigate(['/admin/productos']), 1500);
          }
        },
        error: (err) => {
          console.error('Error al crear producto:', err);
          this.toastr.error('Error al crear el producto', 'Error');
          this.guardando = false;
        },
      });
  }

  /**
   * Carga un producto por ID (método legacy, usar cargarDatosEdicion para edición)
   * @deprecated Usar cargarDatosEdicion() que carga todo en paralelo
   */
  cargarProducto(id: string): void {
    this.cargando = true;
    this.productoService.getProductoById(Number(id)).subscribe({
      next: (response) => {
        if (response?.data) {
          this.producto = response.data;
          // Configurar preview de imagen si existe
          if (this.producto.imagenBase64) {
            this.imagenPreview = this.producto.imagenBase64;
          }
        }
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar producto:', err);
        this.toastr.error('Error al cargar el producto', 'Error');
        this.cargando = false;
        this.router.navigate(['/admin/productos']);
      },
    });
  }

  actualizarProducto(): void {
    if (!this.productoId) return;
    if (!this.validarFormulario()) return;

    this.guardando = true;

    // Convertir nombre de subcategoría a ID
    const subcategoria = this.subcategoriasFiltradas.find(
      (sub) => sub.nombre === this.producto.subcategoria,
    );

    if (subcategoria?.subcategoriaId) {
      this.producto.subcategoriaId = subcategoria.subcategoriaId;
    }

    // Preparar producto para enviar
    const productoActualizar = { ...this.producto };

    // Si NO hay nueva imagen seleccionada, eliminar el campo imagen para no reenviar la existente
    if (!this.imagenOptimizada) {
      delete productoActualizar.imagen;
      delete productoActualizar.imagenBase64;
    }

    console.log('Producto a actualizar:', {
      ...productoActualizar,
      subcategoriaId: productoActualizar.subcategoriaId,
      imagenNueva: !!this.imagenOptimizada,
    });

    // Enviar el archivo optimizado si existe (si se cambió la imagen), sino enviar el producto sin imagen
    this.productoService
      .updateProducto(
        Number(this.productoId),
        productoActualizar,
        this.imagenOptimizada || undefined,
      )
      .subscribe({
        next: (response) => {
          if (response.code === 200) {
            this.toastr.success('Producto actualizado con éxito', 'Éxito');
            setTimeout(() => this.router.navigate(['/admin/productos']), 1500);
          }
        },
        error: (err) => {
          console.error('Error al actualizar producto:', err);
          this.toastr.error('Error al actualizar el producto', 'Error');
          this.guardando = false;
        },
      });
  }

  cancelar(): void {
    this.router.navigate(['/admin/productos']);
  }
}
