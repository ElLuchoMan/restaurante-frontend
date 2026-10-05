import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { EstadoPedido } from '../../shared/constants';
import { ApiResponse } from '../../shared/models/api-response.model';
import {
  Pedido,
  PedidoCreate,
  PedidoDetalle,
  PedidoListParams,
} from '../../shared/models/pedido.model';
import { HandleErrorService } from './handle-error.service';

/**
 * Cliente de `/pedidos`. Todos los endpoints requieren token.
 * En los listados vacíos el back responde HTTP 200 con `code: 404` y sin `data`.
 */
@Injectable({ providedIn: 'root' })
export class PedidoService {
  private baseUrl = `${environment.apiUrl}/pedidos`;

  constructor(
    private http: HttpClient,
    private handleError: HandleErrorService,
  ) {}

  /** POST /pedidos. Responde el pedido creado (estado INICIADO, fecha y hora del servidor). */
  createPedido(pedido: PedidoCreate): Observable<ApiResponse<Pedido>> {
    return this.http
      .post<ApiResponse<Pedido>>(this.baseUrl, pedido)
      .pipe(catchError(this.handleError.handleError));
  }

  /**
   * POST /pedidos/asignar-pago. Con `cambiarEstado` el back marca el pedido TERMINADO y el pago
   * PAGADO. `data` es un pedido parcial (solo ids y estado son fiables).
   */
  assignPago(
    pedidoId: number,
    pagoId: number,
    cambiarEstado: boolean = false,
  ): Observable<ApiResponse<Pedido>> {
    const params = new HttpParams()
      .set('pedido_id', pedidoId.toString())
      .set('pago_id', pagoId.toString())
      .set('cambiar_estado', cambiarEstado.toString());
    return this.http
      .post<ApiResponse<Pedido>>(`${this.baseUrl}/asignar-pago`, null, { params })
      .pipe(catchError(this.handleError.handleError));
  }

  /** POST /pedidos/asignar-domicilio. Marca además `delivery`. `data` es un pedido parcial. */
  assignDomicilio(pedidoId: number, domicilioId: number): Observable<ApiResponse<Pedido>> {
    const params = new HttpParams()
      .set('pedido_id', pedidoId.toString())
      .set('domicilio_id', domicilioId.toString());
    return this.http
      .post<ApiResponse<Pedido>>(`${this.baseUrl}/asignar-domicilio`, null, { params })
      .pipe(catchError(this.handleError.handleError));
  }

  /** GET /pedidos?cliente=. */
  getMisPedidos(clienteId: number): Observable<ApiResponse<Pedido[] | undefined>> {
    const params = new HttpParams().set('cliente', clienteId.toString());
    return this.http
      .get<ApiResponse<Pedido[] | undefined>>(this.baseUrl, { params })
      .pipe(catchError(this.handleError.handleError));
  }

  /**
   * GET /pedidos/detalles?pedido_id=. Si falla (pedido inexistente, id inválido) el back responde
   * HTTP 200 con `code` 400/500 y sin `data`.
   */
  getPedidoDetalles(pedidoId: number): Observable<ApiResponse<PedidoDetalle | undefined>> {
    const params = new HttpParams().set('pedido_id', String(pedidoId));
    return this.http
      .get<ApiResponse<PedidoDetalle | undefined>>(`${this.baseUrl}/detalles`, { params })
      .pipe(catchError(this.handleError.handleError));
  }

  /** GET /pedidos con filtros opcionales (se omiten los `undefined`/`null`). */
  getPedidos(params?: PedidoListParams): Observable<ApiResponse<Pedido[] | undefined>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) httpParams = httpParams.set(k, String(v));
      });
    }
    return this.http
      .get<ApiResponse<Pedido[] | undefined>>(`${this.baseUrl}`, { params: httpParams })
      .pipe(catchError(this.handleError.handleError));
  }

  /** PUT /pedidos/actualizar-estado. Responde 400 si el estado no es uno de `EstadoPedido`. */
  updateEstado(pedidoId: number, estado: EstadoPedido): Observable<ApiResponse<Pedido>> {
    const params = new HttpParams().set('pedido_id', String(pedidoId)).set('estado', estado);
    return this.http
      .put<ApiResponse<Pedido>>(`${this.baseUrl}/actualizar-estado`, null, { params })
      .pipe(catchError(this.handleError.handleError));
  }
}
