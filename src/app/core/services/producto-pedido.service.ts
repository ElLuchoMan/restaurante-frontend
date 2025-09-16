import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/models/api-response.model';
import { HandleErrorService } from './handle-error.service';

interface ProductoPedidoItemInput {
  productoId: number;
  cantidad: number;
}

@Injectable({ providedIn: 'root' })
export class ProductoPedidoService {
  private baseUrl = `${environment.apiUrl}`;

  constructor(
    private http: HttpClient,
    private handleError: HandleErrorService,
  ) {}

  create(pedidoId: number, detalles: ProductoPedidoItemInput[]) {
    const body = { pedidoId, detalles };
    return this.http
      .post<ApiResponse<any>>(`${this.baseUrl}/producto_pedido`, body)
      .pipe(catchError(this.handleError.handleError));
  }

  getByPedido(pedidoId: number) {
    const params = new HttpParams().set('pedido_id', String(pedidoId));
    return this.http
      .get<ApiResponse<any>>(`${this.baseUrl}/producto_pedido`, { params })
      .pipe(catchError(this.handleError.handleError));
  }

  update(pedidoId: number, detalles: ProductoPedidoItemInput[]) {
    const params = new HttpParams().set('pedido_id', String(pedidoId));
    return this.http
      .put<ApiResponse<any>>(`${this.baseUrl}/producto_pedido`, detalles, { params })
      .pipe(catchError(this.handleError.handleError));
  }
}
