import { ProductoFiltroPipe } from './producto-filtro.pipe';
import { Producto } from '../models/producto.model';

describe('ProductoFiltroPipe', () => {
  let pipe: ProductoFiltroPipe;
  let productos: Producto[];

  beforeEach(() => {
    pipe = new ProductoFiltroPipe();
    productos = [
      {
        nombre: 'Hamburguesa',
        precio: 10,
        cantidad: 1,
        categoria: 'Comida',
        subcategoria: 'Rapida',
        calorias: 500,
      },
      {
        nombre: 'Ensalada',
        precio: 8,
        cantidad: 1,
        categoria: 'Comida',
        subcategoria: 'Saludable',
        calorias: 200,
      },
      {
        nombre: 'Jugo',
        precio: 5,
        cantidad: 1,
        categoria: 'Bebida',
        subcategoria: 'Natural',
        calorias: 150,
      },
      {
        nombre: 'Agua',
        precio: 1,
        cantidad: 1,
        categoria: 'Bebida',
        subcategoria: 'Natural',
      },
      {
        nombre: 'Mystery',
        precio: 2,
        cantidad: 1,
        calorias: 50,
      },
    ];
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return empty array when productos is null', () => {
    expect(pipe.transform(null as unknown as Producto[])).toEqual([]);
  });

  it('should return all products with calorias when no filters are applied', () => {
    expect(pipe.transform(productos)).toEqual([
      productos[0],
      productos[1],
      productos[2],
      productos[4],
    ]);
  });

  it('should filter by nombre', () => {
    expect(pipe.transform(productos, 'ensalada')).toEqual([productos[1]]);
  });

  it('should filter by categoria', () => {
    expect(pipe.transform(productos, '', 'bebida')).toEqual([productos[2]]);
  });

  it('should filter by subcategoria', () => {
    expect(pipe.transform(productos, '', '', 'natural')).toEqual([productos[2]]);
  });

  it('should filter by minCalorias', () => {
    expect(pipe.transform(productos, '', '', '', 100)).toEqual([
      productos[0],
      productos[1],
      productos[2],
    ]);
  });

  it('should filter by maxCalorias', () => {
    expect(pipe.transform(productos, '', '', '', undefined, 200)).toEqual([
      productos[1],
      productos[2],
      productos[4],
    ]);
  });

  it('should filter by calorias range', () => {
    expect(pipe.transform(productos, '', '', '', 100, 300)).toEqual([
      productos[1],
      productos[2],
    ]);
  });
});

