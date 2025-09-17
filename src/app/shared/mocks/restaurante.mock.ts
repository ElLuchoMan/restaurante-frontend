import { ApiResponse } from '../models/api-response.model';
import { CambioHorario } from '../models/cambio-horario.model';
import { Restaurante } from '../models/restaurante.model';

export const mockRestaurantesResponse: ApiResponse<Restaurante[]> = {
  code: 200,
  message: 'Restaurante obtenidos exitosamente',
  data: [
    {
      restauranteId: 1,
      nombreRestaurante: 'La cocina de María',
      horaApertura: '08:00:00',
      diasLaborales: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
    },
  ],
};

export const mockRestauranteCreateBody: Partial<Restaurante> = {
  nombreRestaurante: 'Sede Centro',
  horaApertura: '08:00:00',
  diasLaborales: ['Lunes'],
};

export const mockRestauranteDeleteResponse: ApiResponse<unknown> = {
  code: 200,
  message: 'Restaurante eliminado',
  data: {},
};

export const mockRestauranteResponse: ApiResponse<Restaurante> = {
  code: 200,
  message: 'Restaurante encontrado',
  data: {
    restauranteId: 1,
    nombreRestaurante: 'La cocina de María',
    horaApertura: '0000-01-01 08:00:00 +0000 UTC',
    diasLaborales: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
  },
};

export const mockCambioHorarioResponse: ApiResponse<CambioHorario> = {
  code: 200,
  message: 'Cambios de horario obtenidos correctamente',
  data: {
    cambioHorarioId: 1,
    fecha: '2025-01-20',
    horaApertura: '00:00',
    horaCierre: '23:59',
    abierto: false,
  },
};

export const mockCambioHorarioAbiertoResponse: ApiResponse<CambioHorario> = {
  code: 200,
  message: 'Cambios de horario obtenidos correctamente',
  data: {
    cambioHorarioId: 1,
    fecha: '2025-01-20',
    horaApertura: '00:00',
    horaCierre: '23:59',
    abierto: false,
  },
};

export const mockCambioHorarioBody: CambioHorario = {
  fecha: '2025-01-20',
  horaApertura: '00:00',
  horaCierre: '23:59',
  abierto: false,
};
