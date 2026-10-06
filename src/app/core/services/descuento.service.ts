import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/models/api-response.model';
import {
  AplicarDescuentoRequest,
  AplicarDescuentoResponse,
  PedidoDescuentoAplicado,
} from '../../shared/models/descuento.model';
import { HandleErrorService } from './handle-error.service';

/**
 * Cliente de /descuentos/pedidos (requiere token de cualquier rol). El pedido va en el query param
 * `pedido_id`. El cliente SALE DEL TOKEN: un Cliente solo opera sobre sus pedidos (403 si el pedido
 * es de otro o si envía un `clienteId` distinto al suyo); un trabajador/administrador actúa en
 * nombre de un cliente indicando `clienteId`.
 */
@Injectable({ providedIn: 'root' })
export class DescuentoService {
  private baseUrl = `${environment.apiUrl}/descuentos/pedidos`;

  constructor(
    private http: HttpClient,
    private handleError: HandleErrorService,
  ) {}

  /**
   * Aplica un descuento (cupón u oferta, exactamente uno) a un pedido en una sola transacción: el
   * servidor valida, CALCULA el monto (el body no lo lleva), redime el cupón y resta el descuento
   * del pago del pedido; la respuesta trae el total recalculado. Errores HTTP: 400 entrada
   * inválida (o `clienteId` ausente para un trabajador), 401 sin sesión, 403 `clienteId` distinto
   * del token o pedido de otro cliente, 404 pedido/cupón/oferta inexistente, 409 pedido con
   * descuento, pagado o cerrado / cupón agotado o ya redimido, 422 solicitud inválida o
   * cupón/oferta no aplicable.
   */
  aplicar(
    pedidoId: number,
    body: AplicarDescuentoRequest,
  ): Observable<ApiResponse<AplicarDescuentoResponse>> {
    const params = new HttpParams().set('pedido_id', String(pedidoId));
    return this.http
      .post<ApiResponse<AplicarDescuentoResponse>>(this.baseUrl, body, { params })
      .pipe(catchError(this.handleError.handleError));
  }

  /**
   * 404 si el pedido no existe, 403 si es de otro cliente (un Cliente solo ve los suyos); `data` es
   * `[]` cuando el pedido no tiene descuentos.
   */
  listarPorPedido(pedidoId: number): Observable<ApiResponse<PedidoDescuentoAplicado[]>> {
    const params = new HttpParams().set('pedido_id', String(pedidoId));
    return this.http
      .get<ApiResponse<PedidoDescuentoAplicado[]>>(this.baseUrl, { params })
      .pipe(catchError(this.handleError.handleError));
  }
}
