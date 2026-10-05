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
   * Aplica un descuento (cupón u oferta, exactamente uno) a un pedido. El back responde HTTP 200
   * con `code: 404` si el pedido/cupón/oferta no existe y 409 si el pedido ya tiene descuento.
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

  /** `data` puede ser `null` cuando el pedido no tiene descuentos. */
  listarPorPedido(pedidoId: number): Observable<ApiResponse<PedidoDescuentoAplicado[] | null>> {
    const params = new HttpParams().set('pedido_id', String(pedidoId));
    return this.http
      .get<ApiResponse<PedidoDescuentoAplicado[] | null>>(this.baseUrl, { params })
      .pipe(catchError(this.handleError.handleError));
  }
}
