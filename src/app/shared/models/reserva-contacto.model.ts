/**
 * Cliente registrado dentro de un contacto (models.ClienteRefResponse): el backend solo
 * envía su documento, nunca datos del cliente ni contraseña.
 */
export interface ClienteRef {
  documentoCliente: number;
}

/**
 * Contacto de reserva (models.ReservaContactoResponse).
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
