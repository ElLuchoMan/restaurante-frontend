import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/models/api-response.model';
import {
  ProductoPedido,
  ProductoPedidoCreate,
  ProductoPedidoError,
  ProductoPedidoItem,
} from '../../shared/models/producto-pedido.model';
import { HandleErrorService } from './handle-error.service';

/**
 * Cliente de `/producto_pedido` (requiere token).
 *
 * El back usa el status HTTP real. Un 409 por inventario insuficiente trae en `data` la lista
 * `{ productoId, requerido, disponible }`; `HandleErrorService` la descarta, así que aquí se
 * conserva en el error (`ProductoPedidoError.data`). El resto de errores (400 línea inválida,
 * 404 pedido/producto inexistente o, para un Cliente, de otro cliente, 409 producto ya presente
 * en el pedido) pasan por `HandleErrorService`. Un Cliente solo lee y modifica los productos de
 * su propio pedido.
 */
@Injectable({ providedIn: 'root' })
export class ProductoPedidoService {
  private baseUrl = `${environment.apiUrl}`;

  constructor(
    private http: HttpClient,
    private handleError: HandleErrorService,
  ) {}

  /**
   * POST /producto_pedido. Descuenta inventario; las líneas con `cantidad` 0 se ignoran y las
   * repetidas se suman. Responde 409 si el inventario no alcanza o si el producto ya está en el
   * pedido (usar `update`).
   */
  create(
    pedidoId: number,
    detalles: ProductoPedidoItem[],
  ): Observable<ApiResponse<ProductoPedido>> {
    const body: ProductoPedidoCreate = { pedidoId, detalles };
    return this.http
      .post<ApiResponse<ProductoPedido>>(`${this.baseUrl}/producto_pedido`, body)
      .pipe(catchError((err) => this.mapError(err)));
  }

  /**
   * GET /producto_pedido?pedido_id=. Un pedido sin productos responde 200 con `detalles: []`;
   * un pedido inexistente, 404.
   */
  getByPedido(pedidoId: number): Observable<ApiResponse<ProductoPedido>> {
    const params = new HttpParams().set('pedido_id', String(pedidoId));
    return this.http
      .get<ApiResponse<ProductoPedido>>(`${this.baseUrl}/producto_pedido`, { params })
      .pipe(catchError(this.handleError.handleError));
  }

  /**
   * PUT /producto_pedido?pedido_id=. Reemplaza las líneas del pedido (las que no se envían se
   * quitan) y ajusta el inventario; una línea con `cantidad: 0` quita el producto. La lista no
   * puede ir vacía.
   */
  update(
    pedidoId: number,
    detalles: ProductoPedidoItem[],
  ): Observable<ApiResponse<ProductoPedido>> {
    const params = new HttpParams().set('pedido_id', String(pedidoId));
    return this.http
      .put<ApiResponse<ProductoPedido>>(`${this.baseUrl}/producto_pedido`, detalles, { params })
      .pipe(catchError((err) => this.mapError(err)));
  }

  private mapError(err: HttpErrorResponse): Observable<never> {
    const data = err.error?.data;
    if (err.status === 409 && Array.isArray(data)) {
      const error: ProductoPedidoError = {
        code: err.status,
        message: err.error?.message || 'Inventario insuficiente',
        cause: err.error?.cause || 'No especificado',
        data,
      };
      return throwError(() => error);
    }
    return this.handleError.handleError(err);
  }
}
