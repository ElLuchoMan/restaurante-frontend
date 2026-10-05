/**
 * Cambio de horario tal como lo devuelve el back.
 * `fechaCambioHorario` llega como DD-MM-YYYY; horas en HH:MM:SS.
 */
export interface CambioHorario {
  cambioHorarioId: number;
  fechaCambioHorario: string;
  horaApertura?: string;
  horaCierre: string;
  abierto: boolean;
}

/**
 * Cuerpo de POST /cambios_horario. `fechaCambioHorario` va como YYYY-MM-DD.
 * `abierto` es obligatorio; horaApertura y horaCierre son obligatorias solo si abierto=true
 * (si abierto=false el back las ignora y fija 00:00:00 - 23:59:59). 409 si ya hay un cambio
 * para esa fecha.
 */
export interface CambioHorarioCreate {
  fechaCambioHorario: string;
  abierto: boolean;
  horaApertura?: string;
  horaCierre?: string;
}

/**
 * Cuerpo de PUT /cambios_horario?id= (merge): lo ausente se conserva; ningún campo admite null
 * (400). Si el resultado es abierto=false las horas se fuerzan a 00:00:00 - 23:59:59; al pasar de
 * cerrado a abierto la petición debe traer horaApertura y horaCierre.
 */
export type CambioHorarioUpdate = Partial<CambioHorarioCreate>;

// Alias para compatibilidad con código existente
export type CambiosHorario = CambioHorario;
