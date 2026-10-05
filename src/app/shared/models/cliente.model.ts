/** Cliente tal como lo devuelve el back. La contraseña nunca viaja en las respuestas. */
export interface Cliente {
  documentoCliente: number;
  nombre: string;
  apellido: string;
  correo: string;
  direccion: string;
  telefono: string;
  observaciones: string | null;
}

/**
 * Cuerpo de POST /clientes (público). Obligatorios: documento, nombre, apellido, correo válido,
 * telefono y password (máx. 72 bytes). 409 si el documento, correo o teléfono ya existen.
 */
export interface ClienteCreate {
  documentoCliente: number;
  nombre: string;
  apellido: string;
  correo: string;
  password: string;
  telefono: string;
  direccion?: string;
  observaciones?: string;
}

/**
 * Cuerpo de PUT /clientes?id= (merge): los campos ausentes se conservan. Solo `observaciones`
 * admite `null` (la limpia); null en cualquier otro campo responde 400. 409 si el correo o
 * teléfono ya pertenecen a otro cliente.
 */
export type ClienteUpdate = Partial<
  Pick<ClienteCreate, 'nombre' | 'apellido' | 'correo' | 'telefono' | 'direccion' | 'password'>
> & {
  observaciones?: string | null;
};

/** Único valor de `fields` que soporta GET /clientes. */
export type ClienteFields = 'nombre_completo_telefono';

/** Parámetros de GET /clientes: `limit` entre 1 y 100 (si se omite, devuelve todos); `offset` >= 0. */
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
