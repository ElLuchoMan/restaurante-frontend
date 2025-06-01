import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../shared/models/api-response.model';
import { environment } from '../../../environments/environment';
import { PedidoCliente } from '../../shared/models/pedido-cliente.model';


@Injectable({ providedIn: 'root' })
export class PedidoClienteService {
  private baseUrl = `${environment.apiUrl}/pedido_clientes`;

  constructor(private http: HttpClient) { }

  /** Relaciona un pedido con un cliente */
  create(rel: PedidoCliente): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.baseUrl, rel);
  }
}
