import { estadoReserva } from '../constants';
import { ReservaContacto } from './reserva-contacto.model';

/** Restaurante embebido en la reserva (models.Restaurante del backend). */
export interface RestauranteRef {
  restauranteId: number;
  nombreRestaurante?: string;
  horaApertura?: string; // HH:MM:SS
}

/**
 * Reserva tal como la devuelve el backend (models.Reserva.MarshalJSON).
 * - `contactoId` y `restauranteId` llegan como objetos embebidos, no como números.
 * - Las fechas de la respuesta usan formato DD-MM-YYYY (`createdAt`/`updatedAt`: DD-MM-YYYY HH:mm:ss);
 *   en los requests `fechaReserva` se envía como YYYY-MM-DD.
 */
export interface ReservaBase {
  reservaId: number;
  contactoId: ReservaContacto;
  restauranteId: RestauranteRef;
  estadoReserva?: estadoReserva;
  fechaReserva: string; // DD-MM-YYYY
  horaReserva: string; // HH:MM:SS
  personas: number;
  indicaciones?: string;
  createdAt: string;
  createdBy?: string;
  updatedAt: string;
  updatedBy?: string;
}

// ReservaPopulada (enriquecida en el cliente para la UI; el backend NO envía estos campos
// en la raíz de la reserva, se completan desde `contactoId`/`/reserva_contacto`)
export interface ReservaPopulada extends ReservaBase {
  nombreCompleto?: string;
  telefono?: string;
  documentoCliente?: number | null;
}

/**
 * Body de POST /reservas. El backend resuelve (o crea) el contacto a partir de
 * `documentoContacto` (invitado; exige `nombreCompleto`) o `documentoCliente`
 * (cliente registrado). `contactoId` NO es aceptado en la creación.
 */
export interface ReservaCreate {
  restauranteId: number;
  fechaReserva: string; // YYYY-MM-DD
  horaReserva: string; // HH:MM:SS
  personas: number; // > 0
  estadoReserva?: estadoReserva; // por defecto PENDIENTE
  indicaciones?: string;
  createdBy?: string;
  documentoCliente?: number | null;
  documentoContacto?: number | null;
  nombreCompleto?: string;
  telefono?: string;
}

/** Body de PUT /reservas?id=: solo los campos a modificar (`contactoId` se ignora en el backend). */
export interface ReservaUpdate {
  restauranteId?: number;
  fechaReserva?: string; // YYYY-MM-DD
  horaReserva?: string; // HH:MM:SS
  personas?: number;
  estadoReserva?: estadoReserva;
  indicaciones?: string;
  updatedBy?: string;
  documentoCliente?: number | null;
  documentoContacto?: number | null;
  nombreCompleto?: string;
  telefono?: string;
}
