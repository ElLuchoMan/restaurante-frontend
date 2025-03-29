import { estadoProducto } from './../../../shared/constants';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../../core/services/producto.service';
import { Producto } from '../../../shared/models/producto.model';

@Component({
  selector: 'app-crear-producto',
  templateUrl: './crear-producto.component.html',
  styleUrls: ['./crear-producto.component.scss'],
  imports: [CommonModule, FormsModule]
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
    subcategoria: ''
  };
  imagenSeleccionada: File | null = null;
  mensaje: string = '';
  estadoProducto = estadoProducto;

  constructor(private productoService: ProductoService, private router: Router) { }

  seleccionarImagen(event: any): void {
    this.imagenSeleccionada = event.target.files[0];
  }

  crearProducto(): void {
    if (!this.producto.nombre || this.producto.precio <= 0) {
      this.mensaje = "El nombre y el precio son obligatorios";
      return;
    }

    const formData = new FormData();

    // Convertimos los nombres de las propiedades a mayúsculas para el backend
    formData.append('NOMBRE', this.producto.nombre);
    formData.append('CALORIAS', this.producto.calorias?.toString() || '');
    formData.append('DESCRIPCION', this.producto.descripcion || '');
    formData.append('PRECIO', this.producto.precio.toString());
    formData.append('ESTADO_PRODUCTO', this.producto.estadoProducto || 'DISPONIBLE');
    formData.append('CANTIDAD', this.producto.cantidad.toString());
    formData.append('CATEGORIA', this.producto.categoria || '');
    formData.append('SUBCATEGORIA', this.producto.subcategoria || '');

    if (this.imagenSeleccionada) {
      formData.append('IMAGEN', this.imagenSeleccionada);
    }

    this.productoService.createProducto(formData).subscribe(response => {
      if (response.code === 201) {
        this.mensaje = 'Producto creado con éxito';
        setTimeout(() => this.router.navigate(['/admin/productos']), 2000);
      }
    });
  }
}
