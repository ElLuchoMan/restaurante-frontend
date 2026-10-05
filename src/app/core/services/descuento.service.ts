import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/models/api-response.model';
import {
  AplicarDescuentoRequest,
  PedidoDescuentoAplicado,
} from '../../shared/models/descuento.model';
import { HandleErrorService } from './handle-error.service';

/** Cliente de /descuentos/pedidos (requiere token). El pedido va en el query param `pedido_id`. */
@Injectable({ providedIn: 'root' })
export class DescuentoService {
  private baseUrl = `${environment.apiUrl}/descuentos/pedidos`;

  constructor(
    private http: HttpClient,
    private handleError: HandleErrorService,
  ) {}

  /**
   * Aplica un descuento (cupón u oferta, exactamente uno) a un pedido. Errores HTTP: 400 entrada
   * inválida, 404 pedido/cupón/oferta inexistente, 409 descuento ya aplicado, 422 descuento
   * inválido.
   */
  aplicar(
    pedidoId: number,
    body: AplicarDescuentoRequest,
  ): Observable<ApiResponse<PedidoDescuentoAplicado>> {
    const params = new HttpParams().set('pedido_id', String(pedidoId));
    return this.http
      .post<ApiResponse<PedidoDescuentoAplicado>>(this.baseUrl, body, { params })
      .pipe(catchError(this.handleError.handleError));
  }

  /** 404 si el pedido no existe; `data` es `[]` cuando el pedido no tiene descuentos. */
  listarPorPedido(pedidoId: number): Observable<ApiResponse<PedidoDescuentoAplicado[]>> {
    const params = new HttpParams().set('pedido_id', String(pedidoId));
    return this.http
      .get<ApiResponse<PedidoDescuentoAplicado[]>>(this.baseUrl, { params })
      .pipe(catchError(this.handleError.handleError));
  }
}
