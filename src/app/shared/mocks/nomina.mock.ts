import { estadoNomina } from '../constants';
import { ApiResponse } from '../models/api-response.model';
import { Nomina } from '../models/nomina.model';

export const mockNominaResponse: ApiResponse<Nomina[]> = {
  code: 200,
  message: 'Nóminas encontradas.',
  data: [
    {
      fechaNomina: '2024-12-30',
      monto: 5500000,
      estadoNomina: estadoNomina.PAGO,
      nominaId: 1,
    },
    {
      fechaNomina: '2025-01-22',
      monto: 3000000,
      estadoNomina: estadoNomina.NO_PAGO,
      nominaId: 4,
    },
  ],
};
export const mockNominaFecha: ApiResponse<Nomina[]> = {
  code: 200,
  message: 'Nóminas obtenidas exitosamente',
  data: [
    {
      fechaNomina: '2025-01-22',
      monto: 3000000,
      estadoNomina: estadoNomina.NO_PAGO,
      nominaId: 4,
    },
  ],
};
export const mockNominaBody: Nomina = {
  fechaNomina: '2024-12-30',
  estadoNomina: estadoNomina.NO_PAGO,
};

export const mockNominaPagaResponse: ApiResponse<Nomina> = {
  code: 200,
  message: 'Estado de la nómina actualizado a "PAGO" correctamente',
  data: {
    fechaNomina: '2025-01-22',
    monto: 3000000,
    estadoNomina: estadoNomina.PAGO,
    nominaId: 4,
  },
};
