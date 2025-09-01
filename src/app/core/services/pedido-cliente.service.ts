import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/models/api-response.model';
import { PedidoCliente } from '../../shared/models/pedido-cliente.model';
import { HandleErrorService } from './handle-error.service';

@Injectable({ providedIn: 'root' })
export class PedidoClienteService {
  private baseUrl = `${environment.apiUrl}/pedido_clientes`;

  constructor(private http: HttpClient, private handleError: HandleErrorService) {}

  /** Relaciona un pedido con un cliente */
  create(rel: PedidoCliente): Observable<ApiResponse<any>> {
    return this.http
      .post<ApiResponse<any>>(this.baseUrl, rel)
      .pipe(catchError(this.handleError.handleError));
  }
  /** Obtiene los pedidos de un cliente */
  getPedidoCliente(pedidoId: number, clienteId: number): Observable<ApiResponse<PedidoCliente>> {
    return this.http
      .get<ApiResponse<PedidoCliente>>(`${this.baseUrl}/${pedidoId}/${clienteId}`)
      .pipe(catchError(this.handleError.handleError));
  }
}
