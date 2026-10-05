import { ApiResponse } from '../models/api-response.model';
import { NominaTrabajadorDetalle, NominaTrabajadorItem } from '../models/nomina-trabajador.model';

// GET /nomina_trabajador y /search: models.NominaTrabajadorItem (FK como ids).
export const mockNominaTrabajadorResponse: ApiResponse<NominaTrabajadorItem[]> = {
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
    },
    {
      detalles: 'Pago sin incidencias',
      documentoTrabajador: 1000000542,
      montoIncidencias: 0,
      nominaId: 1,
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
      ...mockNominaTrabajadorResponse.data[0],
      nombre: 'Ana',
      apellido: 'Gómez',
    },
    {
      ...mockNominaTrabajadorResponse.data[1],
      nombre: 'Luis',
      apellido: 'Pérez',
    },
  ],
};

export const mockNominaTrabajadorCreateBody = {
  documentoTrabajador: 1015466494,
};

// POST /nomina_trabajador (201): misma forma que el listado (NominaTrabajadorItem).
export const mockNominaTrabajadorCreateResponse: ApiResponse<NominaTrabajadorItem> = {
  code: 201,
  message: 'Nómina-trabajador creada correctamente',
  data: {
    nominaTrabajadorId: 3,
    detalles: 'Nómina del mes de Enero de 2025 más incidencias si aplica',
    documentoTrabajador: 1015466494,
    montoIncidencias: 100000,
    nominaId: 1,
    sueldoBase: 2000000,
  },
};
