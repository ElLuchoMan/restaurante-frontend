import { DiaSemana } from '../constants';

/**
 * Fila de `GET /restaurante_dia` y `/restaurante_dia/search`: el back une el día con su
 * restaurante. `restauranteDiaId` es el id de la fila (el que usa `/search?id=`).
 * `horaApertura` llega como HH:MM:SS.
 */
export interface RestauranteDia {
  restauranteDiaId: number;
  restauranteId: number;
  nombreRestaurante: string;
  horaApertura: string;
  dia: DiaSemana;
}
