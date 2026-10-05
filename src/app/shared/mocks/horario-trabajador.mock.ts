import { DiaSemana } from '../constants';
import { ApiResponse } from '../models/api-response.model';
import { HorarioTrabajador } from '../models/horario-trabajador.model';

export const mockHorarioTrabajadorList: ApiResponse<HorarioTrabajador[]> = {
  code: 200,
  message: 'Horarios obtenidos',
  data: [
    {
      horarioTrabajadorId: 1,
      documentoTrabajador: 1015466494,
      dia: DiaSemana.DiaLunes,
      horaInicio: '08:00:00',
      horaFin: '20:00:00',
    },
    {
      horarioTrabajadorId: 2,
      documentoTrabajador: 1015466494,
      dia: DiaSemana.DiaMartes,
      horaInicio: '08:00:00',
      horaFin: '20:00:00',
    },
  ],
};

export const mockHorarioTrabajadorUpdateBody: Partial<HorarioTrabajador> = {
  horaInicio: '09:00:00',
  horaFin: '18:00:00',
};

export const mockHorarioTrabajadorCreateBody: HorarioTrabajador = {
  documentoTrabajador: 1015466494,
  dia: DiaSemana.DiaLunes,
  horaInicio: '08:00:00',
  horaFin: '17:00:00',
};
