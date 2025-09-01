import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductoService } from '../../../../core/services/producto.service';
import { estadoProducto } from '../../../../shared/constants';
import { Producto } from '../../../../shared/models/producto.model';

@Component({
  selector: 'app-crear-producto',
  standalone: true,
  templateUrl: './crear-producto.component.html',
  styleUrls: ['./crear-producto.component.scss'],
  imports: [CommonModule, FormsModule],
})
export class CrearProductoComponent {
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
  imagenSeleccionada: File | null = null;
  mensaje: string = '';
  estadoProducto = estadoProducto;
  productoId: string | null = null;
  esEdicion = false;

  constructor(
    private productoService: ProductoService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.productoId = this.route.snapshot.paramMap.get('id');
    this.esEdicion = !!this.productoId;

    if (this.esEdicion) {
      this.cargarProducto(this.productoId!);
    }
  }
  seleccionarImagen(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.imagenSeleccionada = input.files?.[0] || null;
  }

  crearProducto(): void {
    if (!this.producto.nombre || this.producto.precio <= 0) {
      this.mensaje = 'El nombre y el precio son obligatorios';
      return;
    }

    const formData = this.crearFormData(this.producto);

    this.productoService.createProducto(formData).subscribe((response) => {
      if (response.code === 201) {
        this.mensaje = 'Producto creado con éxito';
        setTimeout(() => this.router.navigate(['/admin/productos']), 2000);
      }
    });
  }
  cargarProducto(id: string): void {
    this.productoService.getProductoById(Number(id)).subscribe((response) => {
      if (response?.data) {
        this.producto = response.data;
      }
    });
  }
  actualizarProducto(): void {
    if (!this.productoId) return;

    const formData = this.crearFormData(this.producto);

    this.productoService.updateProducto(Number(this.productoId), formData).subscribe((response) => {
      if (response.code === 200) {
        this.mensaje = 'Producto actualizado con éxito';
        setTimeout(() => this.router.navigate(['/admin/productos']), 2000);
      }
    });
  }

  private crearFormData(producto: Producto): FormData {
    const formData = new FormData();

    // Convertimos los nombres de las propiedades a mayúsculas para el backend
    formData.append('NOMBRE', producto.nombre);
    formData.append('CALORIAS', producto.calorias?.toString() || '');
    formData.append('DESCRIPCION', producto.descripcion || '');
    formData.append('PRECIO', producto.precio.toString());
    formData.append('ESTADO_PRODUCTO', producto.estadoProducto || 'DISPONIBLE');
    formData.append('CANTIDAD', producto.cantidad.toString());
    formData.append('CATEGORIA', producto.categoria || '');
    formData.append('SUBCATEGORIA', producto.subcategoria || '');

    if (this.imagenSeleccionada) {
      formData.append('IMAGEN', this.imagenSeleccionada);
    }

    return formData;
  }
}
