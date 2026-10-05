import { ApiResponse } from '../models/api-response.model';
import { CambioHorario, CambioHorarioCreate } from '../models/cambio-horario.model';

export const mockCambiosHorarioList: ApiResponse<CambioHorario[]> = {
  code: 200,
  message: 'Cambios de horario obtenidos correctamente',
  data: [
    {
      cambioHorarioId: 1,
      fechaCambioHorario: '31-12-2024',
      horaApertura: '08:00:00',
      horaCierre: '13:00:00',
      abierto: true,
    },
    {
      cambioHorarioId: 2,
      fechaCambioHorario: '25-12-2024',
      horaApertura: '00:00:00',
      horaCierre: '23:59:59',
      abierto: false,
    },
  ],
};

export const mockCambiosHorarioActual: ApiResponse<CambioHorario> = {
  code: 200,
  message: 'Cambio de horario encontrado para la fecha actual',
  data: mockCambiosHorarioList.data[0],
};

export const mockCambiosHorarioCreateBody: CambioHorarioCreate = {
  fechaCambioHorario: '2025-01-01',
  horaApertura: '09:00:00',
  horaCierre: '18:00:00',
  abierto: true,
};

// Adicionales (trasladados desde restaurante.mock.ts para cumplir "un archivo por servicio")
export const mockCambioHorarioResponse: ApiResponse<CambioHorario> = {
  code: 200,
  message: 'Cambios de horario obtenidos correctamente',
  data: {
    cambioHorarioId: 1,
    fechaCambioHorario: '20-01-2025',
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
    fechaCambioHorario: '20-01-2025',
    horaApertura: '00:00',
    horaCierre: '23:59',
    abierto: false,
  },
};

export const mockCambioHorarioBody: CambioHorarioCreate = {
  fechaCambioHorario: '2025-01-20',
  horaApertura: '00:00',
  horaCierre: '23:59',
  abierto: false,
};
