import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/models/api-response.model';
import {
  Pedido,
  PedidoDetalle,
  PedidoCreate,
} from '../../shared/models/pedido.model';
import { HandleErrorService } from './handle-error.service';

@Injectable({ providedIn: 'root' })
export class PedidoService {
  private baseUrl = `${environment.apiUrl}/pedidos`;

  constructor(private http: HttpClient, private handleError: HandleErrorService) {}

  createPedido(pedido: PedidoCreate): Observable<ApiResponse<Pedido>> {
    return this.http
      .post<ApiResponse<Pedido>>(this.baseUrl, pedido)
      .pipe(catchError(this.handleError.handleError));
  }

  assignPago(pedidoId: number, pagoId: number): Observable<ApiResponse<any>> {
    const params = new HttpParams()
      .set('pedido_id', pedidoId.toString())
      .set('pago_id', pagoId.toString());
    return this.http
      .post<ApiResponse<any>>(`${this.baseUrl}/asignar-pago`, null, { params })
      .pipe(catchError(this.handleError.handleError));
  }

  assignDomicilio(pedidoId: number, domicilioId: number): Observable<ApiResponse<any>> {
    const params = new HttpParams()
      .set('pedido_id', pedidoId.toString())
      .set('domicilio_id', domicilioId.toString());
    return this.http
      .post<ApiResponse<any>>(`${this.baseUrl}/asignar-domicilio`, null, { params })
      .pipe(catchError(this.handleError.handleError));
  }

  getMisPedidos(clienteId: number): Observable<ApiResponse<Pedido[]>> {
    const params = new HttpParams().set('cliente', clienteId.toString());
    return this.http
      .get<ApiResponse<Pedido[]>>(this.baseUrl, { params })
      .pipe(catchError(this.handleError.handleError));
  }

  getPedidoDetalles(pedidoId: number): Observable<ApiResponse<PedidoDetalle>> {
    const params = new HttpParams().set('pedido_id', String(pedidoId));
    return this.http
      .get<ApiResponse<PedidoDetalle>>(`${this.baseUrl}/detalles`, { params })
      .pipe(catchError(this.handleError.handleError));
  }
}
