export interface Cliente {
  documentoCliente: number;
  nombre: string;
  apellido: string;
  direccion: string;
  telefono: string;
  observaciones: string;
  password: string;
  correo: string;
}

export interface ClienteListParams {
  limit?: number;
  offset?: number;
  fields?: string; // proyección CSV, ej: "documentoCliente,nombre"
}

export type ClienteSlim = Pick<Cliente, 'documentoCliente' | 'nombre'>;
