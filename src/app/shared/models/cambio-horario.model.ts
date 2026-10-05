export interface CambioHorario {
  cambioHorarioId?: number;
  fecha: string;
  horaApertura?: string;
  horaCierre?: string;
  abierto?: boolean;
  observaciones?: string;
}

// Alias para compatibilidad con código existente
export type CambiosHorario = CambioHorario;
