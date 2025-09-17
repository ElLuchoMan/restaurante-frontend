import { ApiResponse } from '../models/api-response.model';
import { CambioHorario } from '../models/cambio-horario.model';

export const mockCambiosHorarioList: ApiResponse<Record<string, unknown>[]> = {
  code: 200,
  message: 'Cambios de horario obtenidos',
  data: [
    { fecha: '2024-12-31', horaApertura: '08:00:00', horaCierre: '13:00:00', abierto: true },
    { fecha: '2024-12-25', horaApertura: '00:00:00', horaCierre: '23:59:59', abierto: false },
  ],
};

export const mockCambiosHorarioActual: ApiResponse<Record<string, unknown>> = {
  code: 200,
  message: 'Cambio actual',
  data: {},
};

export const mockCambiosHorarioCreateBody = {
  fecha: '2025-01-01',
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
