import { ApiResponse } from '../models/api-response.model';
import { HorarioTrabajador } from '../models/horario-trabajador.model';

export const mockHorarioTrabajadorList: ApiResponse<HorarioTrabajador[]> = {
  code: 200,
  message: 'Horarios obtenidos',
  data: [
    { documentoTrabajador: 1015466494, dia: 'Lunes', horaInicio: '08:00:00', horaFin: '20:00:00' },
    { documentoTrabajador: 1015466494, dia: 'Martes', horaInicio: '08:00:00', horaFin: '20:00:00' },
  ],
};

export const mockHorarioTrabajadorUpdateBody: Partial<HorarioTrabajador> = {
  horaInicio: '09:00:00',
  horaFin: '18:00:00',
};
