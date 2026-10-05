/** Incidencia tal como la devuelve el back. `fechaIncidencia` llega como DD-MM-YYYY. */
export interface Incidencia {
  incidenciaId: number;
  documentoTrabajador: number;
  fechaIncidencia: string;
  monto: number;
  resta: boolean;
  motivo: string;
}

/** Cuerpo de POST /incidencias (todos obligatorios; `fechaIncidencia` como YYYY-MM-DD). */
export interface IncidenciaCreate {
  documentoTrabajador: number;
  fechaIncidencia: string;
  monto: number;
  resta: boolean;
  motivo: string;
}

/** Cuerpo de PUT /incidencias?id= (todo opcional). */
export type IncidenciaUpdate = Partial<IncidenciaCreate>;
