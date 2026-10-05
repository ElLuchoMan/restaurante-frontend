import { ApiResponse } from '../models/api-response.model';
import {
  NominaTrabajador,
  NominaTrabajadorCreada,
  NominaTrabajadorDetalle,
} from '../models/nomina-trabajador.model';

// GET /nomina_trabajador y /search: las relaciones llegan como objetos embebidos.
export const mockNominaTrabajadorResponse: ApiResponse<NominaTrabajador[]> = {
  code: 200,
  message: 'Relaciones nómina-trabajador obtenidas correctamente',
  data: [
    {
      detalles: 'Pago del mes con bonificación',
      documentoTrabajador: { documentoTrabajador: 1015466494 },
      montoIncidencias: 100000,
      nominaId: { nominaId: 1 },
      nominaTrabajadorId: 1,
      sueldoBase: 2000000,
    },
    {
      detalles: 'Pago sin incidencias',
      documentoTrabajador: { documentoTrabajador: 1000000542 },
      montoIncidencias: 0,
      nominaId: { nominaId: 1 },
      nominaTrabajadorId: 2,
      sueldoBase: 1500000,
    },
  ],
};

// GET /nomina_trabajador/mes (models.NominaTrabajadorDetalle)
export const mockNominaTrabajadorMes: ApiResponse<NominaTrabajadorDetalle[]> = {
  code: 200,
  message: 'Nóminas encontradas.',
  data: [
    {
      detalles: 'Pago del mes con bonificación',
      documentoTrabajador: 1015466494,
      montoIncidencias: 100000,
      nominaId: 1,
      sueldoBase: 2000000,
      nombre: 'Ana',
      apellido: 'Gómez',
    },
    {
      detalles: 'Pago sin incidencias',
      documentoTrabajador: 1000000542,
      montoIncidencias: 0,
      nominaId: 1,
      sueldoBase: 1500000,
      nombre: 'Luis',
      apellido: 'Pérez',
    },
  ],
};

export const mockNominaTrabajadorCreateBody = {
  documentoTrabajador: 1015466494,
};

// POST /nomina_trabajador (201): models.NominaTrabajadorResponse
export const mockNominaTrabajadorCreateResponse: ApiResponse<NominaTrabajadorCreada> = {
  code: 201,
  message: 'Nómina-trabajador creada correctamente',
  data: {
    detalles: 'Nómina del mes de Enero de 2025 más incidencias si aplica',
    documentoTrabajador: 1015466494,
    montoIncidencias: 100000,
    sueldoBase: 2000000,
  },
};
