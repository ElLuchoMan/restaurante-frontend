import { DiaSemana } from '../constants';
import { ApiResponse } from '../models/api-response.model';
import { RestauranteDia } from '../models/restaurante-dia.model';

export const mockRestauranteDiaList: ApiResponse<RestauranteDia[]> = {
  code: 200,
  message: 'Días obtenidos',
  data: [
    {
      restauranteDiaId: 1,
      restauranteId: 1,
      nombreRestaurante: 'El Fogon de Maria',
      dia: DiaSemana.DiaLunes,
      horaApertura: '08:00:00',
    },
    {
      restauranteDiaId: 2,
      restauranteId: 1,
      nombreRestaurante: 'El Fogon de Maria',
      dia: DiaSemana.DiaMartes,
      horaApertura: '08:00:00',
    },
  ],
};

export const mockRestauranteDiaById: ApiResponse<RestauranteDia> = {
  code: 200,
  message: 'Registro encontrado',
  data: {
    restauranteDiaId: 1,
    restauranteId: 1,
    nombreRestaurante: 'El Fogon de Maria',
    dia: DiaSemana.DiaLunes,
    horaApertura: '08:00:00',
  },
};
