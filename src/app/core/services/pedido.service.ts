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
 * Cliente de `/pedidos`. Todos los endpoints requieren token. El back usa el status HTTP real
 * (400 parámetros inválidos, 404 inexistente) y los listados vacíos responden 200 con `data: []`.
 */
@Injectable({ providedIn: 'root' })
export class PedidoService {
  private baseUrl = `${environment.apiUrl}/pedidos`;

  constructor(
    private http: HttpClient,
    private handleError: HandleErrorService,
  ) {}

  /**
   * POST /pedidos. Responde 201 con el pedido creado (estado INICIADO, fecha y hora del
   * servidor); 404 si `pk_id_domicilio`, `restauranteId` o `documentoCliente` no existen.
   */
  createPedido(pedido: PedidoCreate): Observable<ApiResponse<Pedido>> {
    return this.http
      .post<ApiResponse<Pedido>>(this.baseUrl, pedido)
      .pipe(catchError(this.handleError.handleError));
  }

  /**
   * POST /pedidos/asignar-pago. Con `cambiarEstado` el back marca el pedido TERMINADO y el pago
   * PAGADO (se envía siempre explícito: el valor por defecto del back es `true`). `data` es el
   * pedido completo actualizado.
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

  /** POST /pedidos/asignar-domicilio. Marca además `delivery`. `data` es el pedido completo. */
  assignDomicilio(pedidoId: number, domicilioId: number): Observable<ApiResponse<Pedido>> {
    const params = new HttpParams()
      .set('pedido_id', pedidoId.toString())
      .set('domicilio_id', domicilioId.toString());
    return this.http
      .post<ApiResponse<Pedido>>(`${this.baseUrl}/asignar-domicilio`, null, { params })
      .pipe(catchError(this.handleError.handleError));
  }

  /** GET /pedidos?cliente=. Sin pedidos responde 200 con `data: []`. */
  getMisPedidos(clienteId: number): Observable<ApiResponse<Pedido[]>> {
    const params = new HttpParams().set('cliente', clienteId.toString());
    return this.http
      .get<ApiResponse<Pedido[]>>(this.baseUrl, { params })
      .pipe(catchError(this.handleError.handleError));
  }

  /**
   * GET /pedidos/detalles?pedido_id=. 400 si `pedido_id` no es válido y 404 si el pedido no
   * existe (errores HTTP reales).
   */
  getPedidoDetalles(pedidoId: number): Observable<ApiResponse<PedidoDetalle>> {
    const params = new HttpParams().set('pedido_id', String(pedidoId));
    return this.http
      .get<ApiResponse<PedidoDetalle>>(`${this.baseUrl}/detalles`, { params })
      .pipe(catchError(this.handleError.handleError));
  }

  /**
   * GET /pedidos con filtros opcionales (se omiten los `undefined`/`null`). Un filtro inválido
   * responde 400; sin resultados, 200 con `data: []`.
   */
  getPedidos(params?: PedidoListParams): Observable<ApiResponse<Pedido[]>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) httpParams = httpParams.set(k, String(v));
      });
    }
    return this.http
      .get<ApiResponse<Pedido[]>>(`${this.baseUrl}`, { params: httpParams })
      .pipe(catchError(this.handleError.handleError));
  }

  /**
   * PUT /pedidos/actualizar-estado. Responde el pedido completo; 400 si el estado no es uno de
   * `EstadoPedido`.
   */
  updateEstado(pedidoId: number, estado: EstadoPedido): Observable<ApiResponse<Pedido>> {
    const params = new HttpParams().set('pedido_id', String(pedidoId)).set('estado', estado);
    return this.http
      .put<ApiResponse<Pedido>>(`${this.baseUrl}/actualizar-estado`, null, { params })
      .pipe(catchError(this.handleError.handleError));
  }
}
