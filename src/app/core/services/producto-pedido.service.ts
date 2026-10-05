import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, mergeMap, Observable, of, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/models/api-response.model';
import {
  ProductoPedido,
  ProductoPedidoCreate,
  ProductoPedidoItem,
} from '../../shared/models/producto-pedido.model';
import { HandleErrorService } from './handle-error.service';

/**
 * Cliente de `/producto_pedido` (requiere token).
 *
 * Este controlador del back responde SIEMPRE con HTTP 200 y deja el resultado en `code`
 * (400 datos inválidos o inventario insuficiente, 404, 500, 201 creado). Por eso `create` y
 * `update` convierten `code >= 400` en un error con la misma forma que `HandleErrorService`
 * (`{ code, message, cause }`), para que un inventario insuficiente no pase como éxito.
 */
@Injectable({ providedIn: 'root' })
export class ProductoPedidoService {
  private baseUrl = `${environment.apiUrl}`;

  constructor(
    private http: HttpClient,
    private handleError: HandleErrorService,
  ) {}

  /**
   * POST /producto_pedido. Descuenta inventario; las líneas con `cantidad <= 0` se ignoran y
   * las repetidas se suman.
   */
  create(
    pedidoId: number,
    detalles: ProductoPedidoItem[],
  ): Observable<ApiResponse<ProductoPedido>> {
    const body: ProductoPedidoCreate = { pedidoId, detalles };
    return this.http
      .post<ApiResponse<ProductoPedido>>(`${this.baseUrl}/producto_pedido`, body)
      .pipe(
        catchError(this.handleError.handleError),
        mergeMap((res) => this.failOnBodyError(res)),
      );
  }

  /** GET /producto_pedido?pedido_id=. Sin productos responde `code: 404` y sin `data`. */
  getByPedido(pedidoId: number): Observable<ApiResponse<ProductoPedido | undefined>> {
    const params = new HttpParams().set('pedido_id', String(pedidoId));
    return this.http
      .get<ApiResponse<ProductoPedido | undefined>>(`${this.baseUrl}/producto_pedido`, { params })
      .pipe(catchError(this.handleError.handleError));
  }

  /**
   * PUT /producto_pedido?pedido_id=. Reemplaza las líneas del pedido y ajusta el inventario;
   * una línea con `cantidad: 0` quita el producto.
   */
  update(
    pedidoId: number,
    detalles: ProductoPedidoItem[],
  ): Observable<ApiResponse<ProductoPedido>> {
    const params = new HttpParams().set('pedido_id', String(pedidoId));
    return this.http
      .put<ApiResponse<ProductoPedido>>(`${this.baseUrl}/producto_pedido`, detalles, { params })
      .pipe(
        catchError(this.handleError.handleError),
        mergeMap((res) => this.failOnBodyError(res)),
      );
  }

  private failOnBodyError<T>(res: ApiResponse<T>): Observable<ApiResponse<T>> {
    if (res.code < 400) return of(res);
    return throwError(() => ({
      code: res.code,
      message: res.message,
      cause: res.cause || 'No especificado',
    }));
  }
}
