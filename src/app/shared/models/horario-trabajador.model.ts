import { DiaSemana } from '../constants';

export interface HorarioTrabajador {
  horarioTrabajadorId?: number;
  documentoTrabajador: number;
  dia: DiaSemana;
  horaInicio?: string; // HH:MM:SS
  horaFin?: string; // HH:MM:SS
}

export type HorarioTrabajadorUpdate = Partial<Pick<HorarioTrabajador, 'horaInicio' | 'horaFin'>>;
