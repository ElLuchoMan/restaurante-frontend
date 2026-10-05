/** Trabajador embebido (la relación se serializa como objeto; solo el documento está garantizado). */
export interface TrabajadorRef {
  documentoTrabajador: number;
  nombre?: string;
  apellido?: string;
}

/** Nómina embebida (la relación se serializa como objeto; solo el id está garantizado). */
export interface NominaRef {
  nominaId: number;
}

/** Relación nómina-trabajador (models.NominaTrabajador) en GET /nomina_trabajador y /search. */
export interface NominaTrabajador {
  nominaTrabajadorId: number;
  sueldoBase: number;
  montoIncidencias?: number;
  detalles?: string;
  documentoTrabajador: TrabajadorRef;
  nominaId: NominaRef;
}

/** Respuesta de POST /nomina_trabajador al crear (models.NominaTrabajadorResponse). */
export interface NominaTrabajadorCreada {
  sueldoBase: number;
  montoIncidencias: number;
  detalles?: string;
  documentoTrabajador: number;
}

/** Fila de GET /nomina_trabajador/mes (models.NominaTrabajadorDetalle). */
export interface NominaTrabajadorDetalle {
  sueldoBase: number;
  montoIncidencias: number;
  detalles: string;
  documentoTrabajador: number;
  nominaId: number;
  nombre: string;
  apellido: string;
}
