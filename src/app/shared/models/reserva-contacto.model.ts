/**
 * Cliente embebido en un contacto (models.Cliente del backend, sin credenciales).
 * El backend serializa la relación `documentoCliente` como objeto, no como número;
 * cuando la relación no se carga solo viene el documento (el resto de campos vacíos).
 */
export interface ClienteRef {
  documentoCliente: number;
  nombre?: string;
  apellido?: string;
  correo?: string;
  direccion?: string;
  telefono?: string;
  observaciones?: string | null;
}

/**
 * Contacto de reserva (models.ReservaContacto del backend).
 * Exactamente uno de `documentoContacto` (invitado) o `documentoCliente` (cliente registrado)
 * viene informado; el otro se omite.
 */
export interface ReservaContacto {
  contactoId: number;
  nombreCompleto: string;
  telefono?: string;
  documentoContacto?: number;
  documentoCliente?: ClienteRef;
}
