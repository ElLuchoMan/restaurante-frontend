import { ApiResponse } from '../models/api-response.model';
import { Subcategoria } from '../models/subcategoria.model';

export const mockSubcategorias: Subcategoria[] = [
  { subcategoriaId: 1, nombre: 'Gaseosas', categoriaId: 1 },
  { subcategoriaId: 9, nombre: 'Hamburguesas', categoriaId: 2 },
];

export const mockSubcategoriasResponse: ApiResponse<Subcategoria[]> = {
  code: 200,
  message: 'Subcategorías obtenidas',
  data: mockSubcategorias,
};

export const mockSubcategoriaByIdResponse: ApiResponse<Subcategoria> = {
  code: 200,
  message: 'Subcategoría encontrada',
  data: { subcategoriaId: 1, nombre: 'Gaseosas', categoriaId: 1 },
};

export const mockSubcategoriaCreateBody: Subcategoria = { nombre: 'Jugos', categoriaId: 1 } as any;

export const mockSubcategoriaCreateResponse: ApiResponse<Subcategoria> = {
  code: 201,
  message: 'Subcategoría creada',
  data: { subcategoriaId: 3, nombre: 'Jugos', categoriaId: 1 },
};

export const mockSubcategoriaUpdateBody: Partial<Subcategoria> = { nombre: 'Gaseosas light' };

export const mockSubcategoriaDeleteResponse: ApiResponse<unknown> = {
  code: 200,
  message: 'Subcategoría eliminada',
  data: {},
};
