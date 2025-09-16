import { estadoReserva } from '../constants';

export interface Reserva {
  createdAt: string;
  createdBy: string;
  documentoCliente?: number | null;
  contactoId?:
    | number
    | {
        contactoId: number;
        nombreCompleto?: string;
        telefono?: string;
        documentoCliente?: { documentoCliente: number };
      };
  restauranteId?:
    | number
    | { restauranteId: number; nombreRestaurante?: string; horaApertura?: string };
  estadoReserva: estadoReserva;
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

export type ReservaCreate = Omit<
  Reserva,
  'reservaId' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'
> & {
  contactoId?: number;
  restauranteId?: number;
};

export type ReservaUpdate = Partial<Reserva> & {
  contactoId?: number;
  restauranteId?: number;
  updatedBy?: string;
};
