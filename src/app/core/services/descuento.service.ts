import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/models/api-response.model';
import {
  AplicarDescuentoRequest,
  PedidoDescuentoAplicado,
} from '../../shared/models/descuento.model';
import { HandleErrorService } from './handle-error.service';

@Injectable({ providedIn: 'root' })
export class DescuentoService {
  private baseUrl = `${environment.apiUrl}`;

  constructor(
    private http: HttpClient,
    private handleError: HandleErrorService,
  ) {}

  aplicar(
    pedidoId: number,
    body: Omit<AplicarDescuentoRequest, 'pedidoId'>,
  ): Observable<ApiResponse<PedidoDescuentoAplicado>> {
    return this.http
      .post<
        ApiResponse<PedidoDescuentoAplicado>
      >(`${this.baseUrl}/pedidos/${pedidoId}/descuentos`, body)
      .pipe(catchError(this.handleError.handleError));
  }

  listarPorPedido(pedidoId: number): Observable<ApiResponse<PedidoDescuentoAplicado[]>> {
    return this.http
      .get<ApiResponse<PedidoDescuentoAplicado[]>>(`${this.baseUrl}/pedidos/${pedidoId}/descuentos`)
      .pipe(catchError(this.handleError.handleError));
  }
}
