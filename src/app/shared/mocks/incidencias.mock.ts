import { ApiResponse } from '../models/api-response.model';
import { Incidencia, IncidenciaCreate, IncidenciaUpdate } from '../models/incidencia.model';

export const mockIncidenciasList: ApiResponse<Incidencia[]> = {
  code: 200,
  message: 'Incidencias obtenidas',
  data: [
    {
      incidenciaId: 1,
      documentoTrabajador: 1015466494,
      fechaIncidencia: '20-12-2024',
      monto: 100000,
      motivo: 'Bonificación de fin de año',
      resta: false,
    },
    {
      incidenciaId: 2,
      documentoTrabajador: 1000000542,
      fechaIncidencia: '15-01-2025',
      monto: 100000,
      motivo: 'Deducción por falta',
      resta: true,
    },
  ],
};

export const mockIncidenciasSearchResponse: ApiResponse<Incidencia[]> = {
  code: 200,
  message: 'Incidencias filtradas',
  data: [
    {
      incidenciaId: 3,
      documentoTrabajador: 1015466494,
      fechaIncidencia: '10-12-2024',
      monto: 80000,
      motivo: 'Bono productividad',
      resta: false,
    },
  ],
};

export const mockIncidenciaCreateBody: IncidenciaCreate = {
  documentoTrabajador: 1015466494,
  fechaIncidencia: '2025-01-31',
  monto: 50000,
  motivo: 'Descuento por retraso',
  resta: true,
};

export const mockIncidenciaCreateResponse: ApiResponse<Incidencia> = {
  code: 201,
  message: 'Incidencia creada',
  data: {
    incidenciaId: 4,
    ...mockIncidenciaCreateBody,
    fechaIncidencia: '31-01-2025', // el back responde DD-MM-YYYY
  },
};

export const mockIncidenciaUpdateBody: IncidenciaUpdate = {
  monto: 75000,
};

export const mockIncidenciaUpdateResponse: ApiResponse<Incidencia> = {
  code: 200,
  message: 'Incidencia actualizada',
  data: {
    incidenciaId: 1,
    documentoTrabajador: 1015466494,
    fechaIncidencia: '20-12-2024',
    monto: 75000,
    motivo: 'Bonificación de fin de año',
    resta: false,
  },
};

export const mockIncidenciaDeleteResponse: ApiResponse<unknown> = {
  code: 200,
  message: 'Incidencia eliminada',
  data: {},
};
