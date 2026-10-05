import { estadoReserva } from '../constants';
import { ReservaContacto } from './reserva-contacto.model';

/** Restaurante embebido en la reserva (models.RestauranteReservaResponse). */
export interface RestauranteRef {
  restauranteId: number;
  nombreRestaurante: string;
  horaApertura: string; // HH:MM:SS
}

/**
 * Reserva tal como la devuelve el backend (models.ReservaResponse).
 * - Todas las consultas (incluidas /parameter, /search, /documento y /cliente) y las
 *   respuestas de POST/PUT/DELETE traen `contactoId` y `restauranteId` ya poblados como objetos:
 *   el nombre, el teléfono y los documentos del contacto se leen de `contactoId`.
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

/**
 * Body de POST /reservas. El backend resuelve (o crea) el contacto a partir de
 * `documentoContacto` (invitado; exige `nombreCompleto`) o `documentoCliente`
 * (cliente registrado); si llegan ambos prevalece `documentoContacto`.
 * `contactoId` NO es aceptado.
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

/**
 * Body de PUT /reservas?id= (merge): solo se envían los campos a modificar. Únicamente
 * `indicaciones` y `updatedBy` admiten `null` (limpian el campo); `null` en cualquier otro
 * campo es 400. `contactoId` NO es aceptado: para cambiar el contacto se envía
 * `documentoContacto` o `documentoCliente`.
 */
export interface ReservaUpdate {
  restauranteId?: number;
  fechaReserva?: string; // YYYY-MM-DD
  horaReserva?: string; // HH:MM:SS
  personas?: number;
  estadoReserva?: estadoReserva;
  indicaciones?: string | null;
  updatedBy?: string | null;
  documentoCliente?: number;
  documentoContacto?: number;
  nombreCompleto?: string;
  telefono?: string;
}
