import { DiaSemana } from '../constants';

/** Horario tal como lo devuelve el back (el id interno no se expone). Horas en HH:MM:SS. */
export interface HorarioTrabajador {
  documentoTrabajador: number | null;
  dia: DiaSemana;
  horaInicio: string;
  horaFin: string;
}

/** Cuerpo de POST /horario_trabajador (acepta HH:MM:SS o HH:MM; horaFin > horaInicio). */
export interface HorarioTrabajadorCreate {
  documentoTrabajador: number;
  dia: DiaSemana;
  horaInicio: string;
  horaFin: string;
}

/** Cuerpo de PUT /horario_trabajador?documento=&dia=. */
export interface HorarioTrabajadorUpdate {
  horaInicio?: string;
  horaFin?: string;
}
