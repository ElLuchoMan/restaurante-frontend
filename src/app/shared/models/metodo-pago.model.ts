/** Método de pago tal como lo devuelve el back (`GET /metodos_pago`). */
export interface MetodosPago {
  metodoPagoId: number;
  tipo: string;
  detalle: string;
}

/** Cuerpo de POST /metodos_pago (`tipo` obligatorio; `detalle` opcional, el back lo guarda vacío si falta). */
export interface MetodoPagoCreate {
  tipo: string;
  detalle?: string;
}

/**
 * Cuerpo de PUT /metodos_pago?id=: actualización parcial (merge). `tipo` y `detalle` no son
 * anulables (`null` responde 400) y `tipo` no puede quedar vacío.
 */
export type MetodoPagoUpdate = Partial<Omit<MetodosPago, 'metodoPagoId'>>;
