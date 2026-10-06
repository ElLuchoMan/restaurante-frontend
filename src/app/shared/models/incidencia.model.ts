/** Incidencia tal como la devuelve el back. `fechaIncidencia` llega como DD-MM-YYYY. */
export interface Incidencia {
  incidenciaId: number;
  documentoTrabajador: number;
  fechaIncidencia: string;
  monto: number;
  resta: boolean;
  motivo: string;
}

/** Cuerpo de POST /incidencias (todos obligatorios; `fechaIncidencia` como YYYY-MM-DD; monto >= 0). */
export interface IncidenciaCreate {
  documentoTrabajador: number;
  fechaIncidencia: string;
  monto: number;
  resta: boolean;
  motivo: string;
}

/** Cuerpo de PUT /incidencias?id= (merge): lo ausente se conserva; ningún campo admite null (400). */
export type IncidenciaUpdate = Partial<IncidenciaCreate>;
