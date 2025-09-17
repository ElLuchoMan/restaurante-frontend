import { estadoReserva } from '../constants';

// ReservaBase (contrato Swagger models.Reserva)
export interface ReservaBase {
  reservaId?: number;
  contactoId: number;
  restauranteId: number;
  estadoReserva: estadoReserva;
  fechaReserva: string; // YYYY-MM-DD
  horaReserva: string; // HH:MM:SS
  personas: number;
  indicaciones?: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
}

// ReservaPopulada (enriquecida para UI)
export interface ReservaPopulada extends ReservaBase {
  nombreCompleto?: string;
  telefono?: string;
  documentoCliente?: number | null;
}

// Requests deben referenciar ReservaBase según Swagger
export type ReservaCreate = Omit<
  ReservaBase,
  'reservaId' | 'createdAt' | 'updatedAt' | 'updatedBy'
>;

export type ReservaUpdate = Partial<ReservaBase> & { updatedBy?: string };
