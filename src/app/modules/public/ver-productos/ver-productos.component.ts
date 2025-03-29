import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductoService } from '../../../core/services/producto.service';
import { Producto } from '../../../shared/models/producto.model';

@Component({
  selector: 'app-ver-productos',
  templateUrl: './ver-productos.component.html',
  styleUrls: ['./ver-productos.component.scss'],
  imports: [CommonModule]
})
export class VerProductosComponent implements OnInit {
  productos: Producto[] = [];
  mensaje: string = '';

  constructor(private productoService: ProductoService) { }

  ngOnInit(): void {
    this.obtenerProductos();
  }

  obtenerProductos(): void {
    this.productoService.getProductos({ onlyActive: true, includeImage: true }).subscribe(response => {
      if (response.code === 200) {
        this.productos = response.data;
      } else {
        this.mensaje = response.message;
      }
    });
  }
}
