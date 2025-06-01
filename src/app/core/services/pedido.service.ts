import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../shared/models/api-response.model';
import { Pedido } from '../../shared/models/pedido.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PedidoService {
  private baseUrl = `${environment.apiUrl}/pedidos`;

  constructor(private http: HttpClient) { }

  createPedido(pedido: Partial<Pedido>): Observable<ApiResponse<Pedido>> {
    return this.http.post<ApiResponse<Pedido>>(this.baseUrl, pedido);
  }

  assignPago(pedidoId: number, pagoId: number): Observable<ApiResponse<any>> {
    const params = new HttpParams()
      .set('pedido_id', pedidoId.toString())
      .set('pago_id', pagoId.toString());
    return this.http.post<ApiResponse<any>>(
      `${this.baseUrl}/asignar-pago`,
      null,
      { params }
    );
  }

  assignDomicilio(pedidoId: number, domicilioId: number): Observable<ApiResponse<any>> {
    const params = new HttpParams()
      .set('pedido_id', pedidoId.toString())
      .set('domicilio_id', domicilioId.toString());
    return this.http.post<ApiResponse<any>>(
      `${this.baseUrl}/asignar-domicilio`,
      null,
      { params }
    );
  }
  getMisPedidos(clienteId: number): Observable<ApiResponse<Pedido[]>> {
    const params = new HttpParams().set('cliente', clienteId.toString());
    return this.http.get<ApiResponse<Pedido[]>>(this.baseUrl, { params });
  }

}
