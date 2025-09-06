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
    const file = input.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.producto.imagenBase64 = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  crearProducto(): void {
    if (!this.producto.nombre || this.producto.precio <= 0) {
      this.mensaje = 'El nombre y el precio son obligatorios';
      return;
    }

    this.productoService.createProducto(this.producto).subscribe((response) => {
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

    this.productoService
      .updateProducto(Number(this.productoId), this.producto)
      .subscribe((response) => {
        if (response.code === 200) {
          this.mensaje = 'Producto actualizado con éxito';
          setTimeout(() => this.router.navigate(['/admin/productos']), 2000);
        }
      });
  }

  // Ya no se requiere conversión a FormData; el backend acepta JSON con imagenBase64
}
