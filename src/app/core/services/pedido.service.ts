import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { EstadoPedido } from '../../shared/constants';
import { ApiResponse } from '../../shared/models/api-response.model';
import {
  CheckoutError,
  CheckoutRequest,
  CheckoutResultado,
} from '../../shared/models/checkout.model';
import {
  Pedido,
  PedidoCreate,
  PedidoDetalle,
  PedidoListParams,
} from '../../shared/models/pedido.model';
import { HandleErrorService } from './handle-error.service';

/**
 * Cliente de `/pedidos`. Todos los endpoints requieren token. El back usa el status HTTP real
 * (400 parámetros inválidos, 403 sin permiso, 404 inexistente, 409 conflicto) y los listados
 * vacíos responden 200 con `data: []`.
 *
 * Permisos: un Cliente solo lee y crea lo suyo (un pedido ajeno responde 404, igual que si no
 * existiera); cambiar el estado de un pedido es solo de personal (403 a un Cliente).
 */
@Injectable({ providedIn: 'root' })
export class PedidoService {
  private baseUrl = `${environment.apiUrl}/pedidos`;

  constructor(
    private http: HttpClient,
    private handleError: HandleErrorService,
  ) {}

  /**
   * POST /pedidos/checkout. Crea en UNA transacción el domicilio (si viene), el pedido, sus
   * productos (descontando inventario) y el pago; si algo falla el back deshace todo, así que
   * reintentar es seguro. Responde 201 con el pedido completo y el `monto` que fijó el servidor.
   *
   * Errores: 400 cuerpo inválido; 403 un Cliente envió otro `documentoCliente` o un estado de pago
   * distinto de PENDIENTE; 404 restaurante, método de pago, cliente o producto inexistente; 409
   * inventario insuficiente (el error lleva el detalle por producto en `data`: `CheckoutError`) o
   * conflicto con datos existentes.
   */
  checkout(body: CheckoutRequest): Observable<ApiResponse<CheckoutResultado>> {
    return this.http
      .post<ApiResponse<CheckoutResultado>>(`${this.baseUrl}/checkout`, body)
      .pipe(catchError((err) => this.mapCheckoutError(err)));
  }

  /** Conserva el detalle de inventario del 409 (HandleErrorService lo descartaría). */
  private mapCheckoutError(err: HttpErrorResponse): Observable<never> {
    const data = err.error?.data;
    if (err.status === 409 && Array.isArray(data)) {
      const error: CheckoutError = {
        code: err.status,
        message: err.error?.message || 'Inventario insuficiente',
        cause: err.error?.cause || 'No especificado',
        data,
      };
      return throwError(() => error);
    }
    return this.handleError.handleError(err);
  }

  /**
   * POST /pedidos. Responde 201 con el pedido creado (estado INICIADO, fecha y hora del
   * servidor); 404 si `pk_id_domicilio`, `restauranteId` o `documentoCliente` no existen. Un
   * Cliente siempre crea a su nombre (el documento sale del token): enviar otro
   * `documentoCliente` responde 403.
   */
  createPedido(pedido: PedidoCreate): Observable<ApiResponse<Pedido>> {
    return this.http
      .post<ApiResponse<Pedido>>(this.baseUrl, pedido)
      .pipe(catchError(this.handleError.handleError));
  }

  /**
   * POST /pedidos/asignar-pago. Con `cambiarEstado` el back marca el pedido TERMINADO y el pago
   * PAGADO (se envía siempre explícito: el valor por defecto del back es `true`). `data` es el
   * pedido completo actualizado. Un Cliente solo puede usarlo con `cambiarEstado=false` (403 si
   * no) sobre su propio pedido (404 si es ajeno) y es idempotente: únicamente confirma (y el back
   * recalcula el monto de) un pago ya ligado a ESE pedido (como el que crea `checkout`); un pago
   * huérfano o de otro pedido responde 404, nunca se vincula.
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

  /**
   * GET /pedidos?cliente=. Sin pedidos responde 200 con `data: []`. Un Cliente solo puede pedir
   * su propio documento (otro responde 403).
   */
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
   * PUT /pedidos/actualizar-estado. Solo personal (403 a un Cliente). Responde el pedido
   * completo; 400 si el estado no es uno de `EstadoPedido`.
   */
  updateEstado(pedidoId: number, estado: EstadoPedido): Observable<ApiResponse<Pedido>> {
    const params = new HttpParams().set('pedido_id', String(pedidoId)).set('estado', estado);
    return this.http
      .put<ApiResponse<Pedido>>(`${this.baseUrl}/actualizar-estado`, null, { params })
      .pipe(catchError(this.handleError.handleError));
  }
}
