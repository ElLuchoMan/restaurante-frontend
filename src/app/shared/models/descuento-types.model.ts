export type TipoDescuento = 'PORCENTAJE' | 'MONTO';
export type CuponScope = 'GLOBAL' | 'PRODUCTO' | 'CATEGORIA' | 'CLIENTE';

/**
 * Clave foránea tal como la serializa el back (campos `rel(fk)` de beego): el modelo
 * relacionado completo (sólo con el id fiable) en vez de un número plano. Se admite también
 * el número por si el back lo aplana en el futuro.
 */
export type FkRef<K extends string> = Record<K, number> & Record<string, unknown>;

/** Envoltorio `models.PaginatedResponse` del back (va dentro de `ApiResponse.data`). */
export interface PaginatedData<T> {
  /** El back serializa `null` cuando el slice viene vacío. */
  data: T[] | null;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
