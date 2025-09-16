export interface HorarioTrabajador {
  documentoTrabajador: number;
  dia: string;
  horaInicio?: string;
  horaFin?: string;
}

export type HorarioTrabajadorUpdate = Partial<Pick<HorarioTrabajador, 'horaInicio' | 'horaFin'>>;
