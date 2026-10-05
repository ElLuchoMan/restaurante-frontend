export interface ReservaContacto {
  contactoId: number;
  nombreCompleto?: string;
  telefono?: string;
  documentoCliente?: number | null;
  documentoContacto?: number | null;
}
