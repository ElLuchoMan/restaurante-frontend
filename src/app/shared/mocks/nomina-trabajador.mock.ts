import { ApiResponse } from '../models/api-response.model';
import { NominaTrabajador } from '../models/nomina-trabajador.model';

export const mockNominaTrabajadorResponse: ApiResponse<NominaTrabajador[]> = {
  code: 200,
  message: 'Relaciones nómina-trabajador obtenidas correctamente',
  data: [
    {
      detalles: 'Pago del mes con bonificación',
      documentoTrabajador: 1015466494,
      montoIncidencias: 100000,
      nominaId: 1,
      nominaTrabajadorId: 1,
      sueldoBase: 2000000,
      total: 2100000,
    },
    {
      detalles: 'Pago sin incidencias',
      documentoTrabajador: 1000000542,
      montoIncidencias: 0,
      nominaId: 1,
      nominaTrabajadorId: 2,
      sueldoBase: 1500000,
      total: 1500000,
    },
  ],
};
export const mockNominaTrabajadorMes: ApiResponse<NominaTrabajador[]> = {
  code: 200,
  message: 'Nóminas encontradas.',
  data: [
    {
      detalles: 'Pago del mes con bonificación',
      documentoTrabajador: 1015466494,
      montoIncidencias: 100000,
      nominaId: 1,
      nominaTrabajadorId: 1,
      sueldoBase: 2000000,
      total: 2100000,
    },
    {
      detalles: 'Pago sin incidencias',
      documentoTrabajador: 1000000542,
      montoIncidencias: 0,
      nominaId: 1,
      nominaTrabajadorId: 2,
      sueldoBase: 1500000,
      total: 1500000,
    },
  ],
};
