import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductoService } from '../../../core/services/producto.service';
import { Producto } from '../../../shared/models/producto.model';
import { FormsModule } from '@angular/forms';
import { ProductoFiltroPipe } from "../../../shared/pipes/producto-filtro.pipe";

@Component({
  selector: 'app-ver-productos',
  templateUrl: './ver-productos.component.html',
  styleUrls: ['./ver-productos.component.scss'],
  imports: [CommonModule, FormsModule, ProductoFiltroPipe]
})
export class VerProductosComponent implements OnInit {
  productos: Producto[] = [];
  mensaje: string = '';
  categorias: string[] = [];
  subcategorias: string[] = [];
  categoriaSeleccionada = '';
  subcategoriaSeleccionada = '';
  filtroNombre = '';
  filtroCategoria = '';
  filtroSubcategoria = '';
  minCalorias?: number;
  maxCalorias?: number;


  constructor(private productoService: ProductoService) { }

  ngOnInit(): void {
    this.obtenerProductos();
  }

  obtenerProductos(): void {
    this.productoService.getProductos({ onlyActive: true, includeImage: true }).subscribe(response => {
      if (response.data) {
        this.productos = response.data;
      } else {
        this.mensaje = response.message;
      }
    });
    this.productoService.getProductos({ onlyActive: true, includeImage: true }).subscribe(response => {
      if (response.data) {
        this.productos = response.data;

        // Extraer categorías únicas
        const categoriasSet = new Set<string>();
        const subcategoriasSet = new Set<string>();

        this.productos.forEach(p => {
          if (p.categoria) categoriasSet.add(p.categoria);
          if (p.subcategoria) subcategoriasSet.add(p.subcategoria);
        });

        this.categorias = Array.from(categoriasSet);
        this.subcategorias = Array.from(subcategoriasSet);
      } else {
        this.mensaje = response.message;
      }
    });
  }
  actualizarSubcategorias(): void {
    const set = new Set<string>();
    this.productos
      .filter(p => p.categoria === this.categoriaSeleccionada)
      .forEach(p => {
        if (p.subcategoria) set.add(p.subcategoria);
      });
    this.subcategorias = Array.from(set);
    this.subcategoriaSeleccionada = '';
  }
  limpiarFiltros(): void {
    this.filtroNombre = '';
    this.categoriaSeleccionada = '';
    this.subcategoriaSeleccionada = '';
    this.minCalorias = undefined;
    this.maxCalorias = undefined;
    this.actualizarSubcategorias();
  }

  //Paginación
  paginaActual = 1;
  productosPorPagina = 8;

  get productosFiltrados(): Producto[] {
    return this.productos.filter(p => {
      const nombreMatch = p.nombre.toLowerCase().includes(this.filtroNombre.toLowerCase());
      const categoriaMatch = !this.categoriaSeleccionada || p.categoria === this.categoriaSeleccionada;
      const subcategoriaMatch = !this.subcategoriaSeleccionada || p.subcategoria === this.subcategoriaSeleccionada;
      const caloriasMatch =
        (this.minCalorias == null || (p.calorias !== undefined && p.calorias >= this.minCalorias)) &&
        (this.maxCalorias == null || (p.calorias !== undefined && p.calorias <= this.maxCalorias));

      return nombreMatch && categoriaMatch && subcategoriaMatch && caloriasMatch;
    });
  }

  get productosPaginados(): Producto[] {
    const inicio = (this.paginaActual - 1) * this.productosPorPagina;
    return this.productosFiltrados.slice(inicio, inicio + this.productosPorPagina);
  }

  get totalPaginas(): number {
    return Math.ceil(this.productosFiltrados.length / this.productosPorPagina);
  }

}
