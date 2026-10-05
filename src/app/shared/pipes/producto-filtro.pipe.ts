import { Pipe, PipeTransform } from '@angular/core';

import { Producto } from '../../shared/models/producto.model';

@Pipe({
  name: 'productoFiltro',
  standalone: true,
})
export class ProductoFiltroPipe implements PipeTransform {
  transform(
    productos: Producto[],
    nombre: string = '',
    categoria: string = '',
    subcategoria: string = '',
    minCalorias?: number,
    maxCalorias?: number,
  ): Producto[] {
    if (!productos) return [];

    return productos.filter((producto) => {
      const nombreMatch = producto.nombre.toLowerCase().includes(nombre.toLowerCase());
      const categoriaMatch =
        !categoria || producto.categoria?.toLowerCase().includes(categoria.toLowerCase());
      const subcategoriaMatch =
        !subcategoria || producto.subcategoria?.toLowerCase().includes(subcategoria.toLowerCase());
      const caloriasMatch =
        producto.calorias !== undefined &&
        // El back envía `calorias: null` cuando no hay dato; Number(null) = 0
        (minCalorias == null || Number(producto.calorias) >= minCalorias) &&
        (maxCalorias == null || Number(producto.calorias) <= maxCalorias);

      return nombreMatch && categoriaMatch && subcategoriaMatch && caloriasMatch;
    });
  }
}
