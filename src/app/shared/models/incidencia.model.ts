export interface Incidencia {
  incidenciaId?: number;
  documentoTrabajador: number;
  fechaIncidencia: string;
  monto: number;
  motivo: string;
  resta: boolean;
}

export type IncidenciaCreate = Omit<Incidencia, 'incidenciaId'>;
export type IncidenciaUpdate = Partial<IncidenciaCreate>;
