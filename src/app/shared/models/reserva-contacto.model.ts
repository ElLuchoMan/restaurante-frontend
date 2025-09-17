export interface ReservaContacto {
  contactoId: number;
  nombreCompleto?: string;
  telefono?: string;
  documentoCliente?: { documentoCliente: number };
}
