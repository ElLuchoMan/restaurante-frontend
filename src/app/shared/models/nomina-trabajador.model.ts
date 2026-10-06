/**
 * Relación nómina-trabajador (models.NominaTrabajadorItem). Es la forma única de
 * GET /nomina_trabajador, GET /nomina_trabajador/search y POST /nomina_trabajador.
 * Las FK llegan como ids numéricos (no como objetos embebidos); `montoIncidencias`
 * y `detalles` nulos en base de datos llegan como 0 y "".
 */
export interface NominaTrabajadorItem {
  nominaTrabajadorId: number;
  sueldoBase: number;
  montoIncidencias: number;
  detalles: string;
  documentoTrabajador: number;
  nominaId: number;
}

/** Fila de GET /nomina_trabajador/mes (models.NominaTrabajadorDetalle): el item más nombre y apellido. */
export interface NominaTrabajadorDetalle extends NominaTrabajadorItem {
  nombre: string;
  apellido: string;
}
