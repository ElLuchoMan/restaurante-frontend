import { ApiResponse } from '../models/api-response.model';
import { Restaurante } from '../models/restaurante.model';

export const mockRestaurantesResponse: ApiResponse<Restaurante[]> = {
  code: 200,
  message: 'Restaurantes obtenidos exitosamente',
  data: [
    {
      restauranteId: 1,
      nombreRestaurante: 'El fogón de María',
      horaApertura: '08:00:00',
    },
  ],
};

export const mockRestauranteResponse: ApiResponse<Restaurante> = {
  code: 200,
  message: 'Restaurante encontrado',
  data: {
    restauranteId: 1,
    nombreRestaurante: 'El fogón de María',
    horaApertura: '08:00:00',
  },
};

// Mocks de cambios de horario movidos a cambios-horario.mock.ts
