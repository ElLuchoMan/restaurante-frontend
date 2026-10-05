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
 * Cuerpo de PUT /metodos_pago?id=. El back NO hace merge: reemplaza todas las columnas con lo
 * recibido, así que un body parcial dejaría `tipo` o `detalle` vacíos. Por eso se exigen ambos.
 */
export type MetodoPagoUpdate = Omit<MetodosPago, 'metodoPagoId'>;
