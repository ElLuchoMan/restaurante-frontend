export interface Reserva {
  createdAt: string;
  createdBy: string;
  documentoCliente?: number | null;
  estadoReserva: string;
  fechaReserva: string;
  horaReserva: string;
  indicaciones: string;
  nombreCompleto: string;
  personas: number;
  reservaId?: number;
  telefono: string;
  updatedAt: string;
  updatedBy: string;
}
