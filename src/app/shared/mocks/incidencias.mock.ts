import { ApiResponse } from '../models/api-response.model';
import { Incidencia } from '../models/incidencia.model';

export const mockIncidenciasList: ApiResponse<Incidencia[]> = {
  code: 200,
  message: 'Incidencias obtenidas',
  data: [
    {
      incidenciaId: 1,
      documentoTrabajador: 1015466494,
      fechaIncidencia: '2024-12-20',
      monto: 100000,
      motivo: 'Bonificación de fin de año',
      resta: false,
    },
    {
      incidenciaId: 2,
      documentoTrabajador: 1000000542,
      fechaIncidencia: '2025-01-15',
      monto: 100000,
      motivo: 'Deducción por falta',
      resta: true,
    },
  ],
};

export const mockIncidenciaCreateBody: Incidencia = {
  documentoTrabajador: 1015466494,
  fechaIncidencia: '2025-01-31',
  monto: 50000,
  motivo: 'Descuento por retraso',
  resta: true,
} as any;
