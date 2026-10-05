/** Cliente tal como lo devuelve el back (password siempre llega vacío: ""). */
export interface Cliente {
  documentoCliente: number;
  nombre: string;
  apellido: string;
  correo: string;
  direccion: string;
  telefono: string;
  observaciones: string | null;
  password: string;
}

/** Cuerpo de POST /clientes (correo y password obligatorios; el resto opcional). */
export interface ClienteCreate {
  documentoCliente: number;
  nombre: string;
  apellido: string;
  correo: string;
  password: string;
  telefono?: string;
  direccion?: string;
  observaciones?: string;
}

/**
 * Cuerpo de PUT /clientes?id=. El back NO hace merge: actualiza todas las columnas con lo
 * recibido (solo conserva correo y password si vienen vacíos), así que un body parcial
 * borraría nombre, apellido, teléfono, etc. Por eso se exige el cliente completo.
 */
export interface ClienteUpdate {
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string;
  direccion: string;
  observaciones: string | null;
  password?: string;
}

/** Único valor de `fields` que soporta GET /clientes. */
export type ClienteFields = 'nombre_completo_telefono';

export interface ClienteListParams {
  limit?: number;
  offset?: number;
  fields?: ClienteFields;
}

/** Elemento devuelto por GET /clientes?fields=nombre_completo_telefono. */
export interface ClienteResumen {
  documentoCliente: number;
  nombre_completo: string;
  telefono: string;
}
