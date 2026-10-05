import { estadoNomina } from '../constants';

export interface Nomina {
  fechaNomina: string;
  nominaId?: number;
  monto?: number;
  estadoNomina: estadoNomina;
}
