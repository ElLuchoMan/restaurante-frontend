import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { CategoriaService } from '../../../../core/services/categoria.service';
import { ProductoService } from '../../../../core/services/producto.service';
import { SubcategoriaService } from '../../../../core/services/subcategoria.service';
import { estadoProducto } from '../../../../shared/constants';
import { Categoria } from '../../../../shared/models/categoria.model';
import { Producto } from '../../../../shared/models/producto.model';
import { Subcategoria } from '../../../../shared/models/subcategoria.model';

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

  constructor(
    private productoService: ProductoService,
    private categoriaService: CategoriaService,
    private subcategoriaService: SubcategoriaService,
    private toastr: ToastrService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.detectarWebView();
    this.productoId = this.route.snapshot.paramMap.get('id');
    this.esEdicion = !!this.productoId;

    this.cargarCategorias();
    this.cargarSubcategorias();

    if (this.esEdicion) {
      this.cargarProducto(this.productoId!);
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

  onCategoriaChange(): void {
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
      if (!this.subcategoriasFiltradas.find((sub) => sub.nombre === this.producto.subcategoria)) {
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
      // Validar tamaño (max 5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        this.toastr.warning('La imagen no debe superar los 5MB', 'Advertencia');
        input.value = '';
        return;
      }

      // Validar tipo
      if (!file.type.startsWith('image/')) {
        this.toastr.warning('Solo se permiten archivos de imagen', 'Advertencia');
        input.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        this.producto.imagenBase64 = reader.result as string;
        this.imagenPreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  eliminarImagen(): void {
    this.producto.imagenBase64 = undefined;
    this.imagenPreview = null;
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (input) input.value = '';
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
    this.productoService.createProducto(this.producto).subscribe({
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
          // Filtrar subcategorías según la categoría cargada
          this.onCategoriaChange();
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
    this.productoService.updateProducto(Number(this.productoId), this.producto).subscribe({
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
