export type TipoDescuento = 'PORCENTAJE' | 'MONTO';
export type CuponScope = 'GLOBAL' | 'PRODUCTO' | 'CATEGORIA' | 'CLIENTE';

/**
 * Clave foránea tal como la serializa el back (campos `rel(fk)` de beego): el modelo
 * relacionado embebido y cargado (nunca incluye contraseñas) en vez de un número plano. Se admite
 * también el número por compatibilidad (formularios y mocks).
 */
export type FkRef<K extends string> = Record<K, number> & Record<string, unknown>;

/** Envoltorio `models.PaginatedResponse` del back (va dentro de `ApiResponse.data`). */
export interface PaginatedData<T> {
  /** Siempre un array: `[]` cuando no hay filas. */
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
