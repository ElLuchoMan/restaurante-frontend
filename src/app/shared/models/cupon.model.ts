import { CuponScope, TipoDescuento } from './descuento-types.model';

export interface Cupon {
  cuponId: number;
  codigo: string;
  scope: CuponScope;
  tipoDescuento: TipoDescuento;
  valorDescuento: number;
  fechaInicio: string;
  fechaFin: string;
  montoMinimo?: number | null;
  maxUsos?: number | null;
  limitePorCliente?: number | null;
  activo: boolean;
  productoId?: number | null;
  categoriaId?: number | null;
  clienteId?: number | null;
}

export interface CrearCuponRequest {
  codigo: string;
  scope: CuponScope;
  tipoDescuento: TipoDescuento;
  valorDescuento: number;
  fechaInicio: string;
  fechaFin: string;
  montoMinimo?: number;
  maxUsos?: number;
  limitePorCliente?: number;
  productoId?: number;
  categoriaId?: number;
  clienteId?: number;
}

export interface ValidarCuponItemRequest {
  productoId: number;
  cantidad: number;
  precio: number;
}

export interface ValidarCuponRequest {
  codigo: string;
  clienteId: number;
  items: ValidarCuponItemRequest[];
}

export interface ValidarCuponResponse {
  aplicable: boolean;
  montoDescuento: number;
  motivo?: string | null;
}

export interface RedimirCuponRequest {
  clienteId: number;
  pedidoId?: number;
}

export interface CuponRedencion {
  redencionId: number;
  cuponId: number;
  codigo: string;
  clienteId: number;
  pedidoId?: number;
  montoDescuento: number;
  fechaRedencion: string;
}

export interface CuponParams {
  limit?: number;
  offset?: number;
  activo?: boolean;
  scope?: CuponScope;
  tipo_descuento?: TipoDescuento;
}
