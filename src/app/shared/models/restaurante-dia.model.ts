import { DiaSemana } from '../constants';

/**
 * Fila de `GET /restaurante_dia` y `/restaurante_dia/search`: el back une el día con su
 * restaurante y no expone el id del registro. `horaApertura` llega como HH:MM:SS.
 */
export interface RestauranteDia {
  restauranteId: number;
  nombreRestaurante: string;
  horaApertura: string;
  dia: DiaSemana;
}
