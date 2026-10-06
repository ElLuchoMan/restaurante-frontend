import { DiaSemana } from '../constants';

/** Horario tal como lo devuelve el back (el id interno no se expone). Horas en HH:MM:SS. */
export interface HorarioTrabajador {
  documentoTrabajador: number;
  dia: DiaSemana;
  horaInicio: string;
  horaFin: string;
}

/**
 * Cuerpo de POST /horario_trabajador (acepta HH:MM:SS o HH:MM; horaFin debe ser mayor que
 * horaInicio, 400 si no). 409 si el trabajador ya tiene horario ese día.
 */
export interface HorarioTrabajadorCreate {
  documentoTrabajador: number;
  dia: DiaSemana;
  horaInicio: string;
  horaFin: string;
}

/**
 * Cuerpo de PUT /horario_trabajador?documento=&dia= (merge): lo ausente se conserva; ningún
 * campo admite null (400). El resultado debe cumplir horaFin > horaInicio.
 */
export interface HorarioTrabajadorUpdate {
  horaInicio?: string;
  horaFin?: string;
}
