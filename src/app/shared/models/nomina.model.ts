import { estadoNomina } from '../constants';

/** Nómina tal como la devuelve el backend (models.Nomina.MarshalJSON). */
export interface Nomina {
  nominaId: number;
  fechaNomina: string; // DD-MM-YYYY
  monto: number;
  estadoNomina: estadoNomina;
}

/**
 * Body de POST /nominas. Ambos campos son opcionales: la fecha por defecto es hoy
 * (debe ser día >= 20) y el estado por defecto es NO_PAGO. El monto lo calcula el backend.
 */
export interface NominaCreate {
  fechaNomina?: string; // YYYY-MM-DD
  estadoNomina?: estadoNomina;
}
