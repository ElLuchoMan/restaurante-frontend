import { ApiResponse } from '../models/api-response.model';
import { Categoria } from '../models/categoria.model';

export const mockCategoriasResponse: ApiResponse<Categoria[]> = {
  code: 200,
  message: 'Categorías obtenidas',
  data: [
    { categoriaId: 1, nombre: 'Bebidas' },
    { categoriaId: 2, nombre: 'Comida rapida' },
  ],
};

export const mockCategoriaByIdResponse: ApiResponse<Categoria> = {
  code: 200,
  message: 'Categoría encontrada',
  data: { categoriaId: 1, nombre: 'Bebidas' },
};

export const mockCategoriaCreateBody: Categoria = { nombre: 'Postres' };

export const mockCategoriaCreateResponse: ApiResponse<Categoria> = {
  code: 201,
  message: 'Categoría creada',
  data: { categoriaId: 3, nombre: 'Postres' },
};

export const mockCategoriaUpdateBody: Partial<Categoria> = { nombre: 'Bebidas frías' };

export const mockCategoriaDeleteResponse: ApiResponse<unknown> = {
  code: 200,
  message: 'Categoría eliminada',
  data: {},
};
