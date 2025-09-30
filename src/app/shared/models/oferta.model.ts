import { TipoDescuento } from './descuento-types.model';

export interface Oferta {
  ofertaId: number;
  titulo: string;
  tipoDescuento: TipoDescuento;
  valorDescuento: number;
  fechaInicio: string;
  fechaFin: string;
  diasSemana?: string[];
  horaInicio?: string | null;
  horaFin?: string | null;
  activo: boolean;
  restauranteId: number;
}

export interface CrearOfertaRequest {
  titulo: string;
  tipoDescuento: TipoDescuento;
  valorDescuento: number;
  fechaInicio: string;
  fechaFin: string;
  diasSemana?: string[];
  horaInicio?: string;
  horaFin?: string;
  restauranteId: number;
}

export interface OfertaActiva {
  ofertaId: number;
  titulo: string;
  tipoDescuento: TipoDescuento;
  valorDescuento: number;
  productosIds: number[];
}

export interface AsociarProductoRequest {
  productoId: number;
}

export interface OfertaParams {
  limit?: number;
  offset?: number;
  activo?: boolean;
  restaurante_id?: number;
  fecha?: string;
  hora?: string;
  producto_id?: number;
}
