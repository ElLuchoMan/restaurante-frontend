import { FkRef, TipoDescuento } from './descuento-types.model';

/** Oferta tal como la devuelve el back (`models.Oferta.MarshalJSON`). */
export interface Oferta {
  ofertaId: number;
  titulo: string;
  tipoDescuento: TipoDescuento;
  valorDescuento: number;
  /** Formato de respuesta `DD-MM-YYYY` (en la petición se envía `YYYY-MM-DD`). */
  fechaInicio: string;
  /** Formato de respuesta `DD-MM-YYYY` (en la petición se envía `YYYY-MM-DD`). */
  fechaFin: string;
  /** Días en español ('Lunes', 'Martes', 'Miércoles', ...); `null` si se creó sin días. */
  diasSemana?: string[] | null;
  /** `HH:MM:SS`; el back omite el campo si la oferta no tiene horario. */
  horaInicio?: string;
  /** `HH:MM:SS`; el back omite el campo si la oferta no tiene horario. */
  horaFin?: string;
  activo: boolean;
  /** FK serializada como objeto restaurante (ver `FkRef`). */
  restauranteId: number | FkRef<'restauranteId'>;
}

/** Body de POST/PUT /ofertas (el PUT exige el cuerpo completo, no parcial). */
export interface CrearOfertaRequest {
  titulo: string;
  tipoDescuento: TipoDescuento;
  valorDescuento: number;
  /** `YYYY-MM-DD` */
  fechaInicio: string;
  /** `YYYY-MM-DD` */
  fechaFin: string;
  diasSemana?: string[];
  /** `HH:MM` o `HH:MM:SS`; debe enviarse junto con `horaFin`. */
  horaInicio?: string;
  /** `HH:MM` o `HH:MM:SS`; debe enviarse junto con `horaInicio`. */
  horaFin?: string;
  restauranteId: number;
}

export interface OfertaActiva {
  ofertaId: number;
  titulo: string;
  tipoDescuento: TipoDescuento;
  valorDescuento: number;
  /** `null` cuando la oferta no tiene productos asociados. */
  productosIds: number[] | null;
}

export interface AsociarProductoRequest {
  productoId: number;
}

/** Query de GET /ofertas. */
export interface OfertaParams {
  limit?: number;
  offset?: number;
  activo?: boolean;
  restaurante_id?: number;
  titulo?: string;
}

/** Query de GET /ofertas/activas (`restaurante_id` es obligatorio en el back). */
export interface OfertaActivasParams {
  restaurante_id: number;
  /** `YYYY-MM-DD` (por defecto hoy) */
  fecha?: string;
  /** `HH:MM` o `HH:MM:SS` (por defecto ahora) */
  hora?: string;
  producto_id?: number;
}
