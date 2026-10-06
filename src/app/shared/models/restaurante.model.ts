import { CambioHorario } from './cambio-horario.model';

/**
 * Restaurante tal como lo devuelve el back (`GET /restaurantes`, `/restaurantes/search`).
 * `horaApertura` llega como HH:MM:SS. `cambioHorarioId` se omite si no hay cambio asociado y,
 * si viene, es un objeto en el que solo el id es fiable.
 */
export interface Restaurante {
  restauranteId: number;
  nombreRestaurante: string;
  horaApertura: string;
  cambioHorarioId?: Pick<CambioHorario, 'cambioHorarioId'>;
}
