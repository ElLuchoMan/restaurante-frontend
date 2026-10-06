import { DiaSemana } from '../constants';
import { ApiResponse } from '../models/api-response.model';
import {
  HorarioTrabajador,
  HorarioTrabajadorCreate,
  HorarioTrabajadorUpdate,
} from '../models/horario-trabajador.model';

export const mockHorarioTrabajadorList: ApiResponse<HorarioTrabajador[]> = {
  code: 200,
  message: 'Horarios obtenidos correctamente',
  data: [
    {
      documentoTrabajador: 1015466494,
      dia: DiaSemana.DiaLunes,
      horaInicio: '08:00:00',
      horaFin: '20:00:00',
    },
    {
      documentoTrabajador: 1015466494,
      dia: DiaSemana.DiaMartes,
      horaInicio: '08:00:00',
      horaFin: '20:00:00',
    },
  ],
};

export const mockHorarioTrabajadorUpdateBody: HorarioTrabajadorUpdate = {
  horaInicio: '09:00:00',
  horaFin: '18:00:00',
};

export const mockHorarioTrabajadorCreateBody: HorarioTrabajadorCreate = {
  documentoTrabajador: 1015466494,
  dia: DiaSemana.DiaLunes,
  horaInicio: '08:00:00',
  horaFin: '17:00:00',
};
