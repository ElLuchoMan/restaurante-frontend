// restaurante.mock.ts
import { ApiResponse } from '../models/api-response.model';
import { Restaurante } from '../models/restaurante.model';

export const mockRestaurantes: ApiResponse<Restaurante[]> = {
    code: 200,
    message: 'Restaurantes obtenidos exitosamente',
    data: [
        {
            restauranteId: 1,
            nombreRestaurante: 'La cocina de María',
            horaApertura: '08:00:00',
            diasLaborales: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
        }
    ]
};
