import { ApiResponse } from '../models/api-response.model';
import { RestauranteDia } from '../models/restaurante-dia.model';

export const mockRestauranteDiaList: ApiResponse<RestauranteDia[]> = {
  code: 200,
  message: 'Días del restaurante',
  data: [
    {
      restauranteId: 1,
      nombreRestaurante: 'El Fogon de Maria',
      dia: 'Lunes',
      horaApertura: '08:00:00',
    },
    {
      restauranteId: 1,
      nombreRestaurante: 'El Fogon de Maria',
      dia: 'Martes',
      horaApertura: '08:00:00',
    },
  ],
};

export const mockRestauranteDiaById: ApiResponse<RestauranteDia> = {
  code: 200,
  message: 'Registro encontrado',
  data: {
    restauranteId: 1,
    nombreRestaurante: 'El Fogon de Maria',
    dia: 'Lunes',
    horaApertura: '08:00:00',
  },
};
