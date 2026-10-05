import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/models/api-response.model';
import {
  Cliente,
  ClienteCreate,
  ClienteListParams,
  ClienteResumen,
  ClienteUpdate,
} from '../../shared/models/cliente.model';
import { HandleErrorService } from './handle-error.service';

@Injectable({
  providedIn: 'root',
})
export class ClienteService {
  private baseUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private handleError: HandleErrorService,
  ) {}

  /**
   * GET /clientes/search?id=. Si no existe, el back responde HTTP 200 con code 404 y sin `data`.
   */
  getClienteId(documento: number): Observable<ApiResponse<Cliente | undefined>> {
    return this.http
      .get<ApiResponse<Cliente | undefined>>(`${this.baseUrl}/clientes/search?id=${documento}`)
      .pipe(catchError(this.handleError.handleError));
  }

  registroCliente(cliente: ClienteCreate): Observable<ApiResponse<Cliente>> {
    return this.http
      .post<ApiResponse<Cliente>>(`${this.baseUrl}/clientes`, cliente)
      .pipe(catchError(this.handleError.handleError));
  }

  /** GET /clientes con `fields=nombre_completo_telefono` devuelve la proyección reducida. */
  getClientes(
    options: ClienteListParams & { fields: 'nombre_completo_telefono' },
  ): Observable<ApiResponse<ClienteResumen[]>>;
  getClientes(options?: Omit<ClienteListParams, 'fields'>): Observable<ApiResponse<Cliente[]>>;
  getClientes(
    options?: ClienteListParams,
  ): Observable<ApiResponse<Cliente[]> | ApiResponse<ClienteResumen[]>> {
    const params = new URLSearchParams();
    if (options?.limit !== undefined) params.set('limit', String(options.limit));
    if (options?.offset !== undefined) params.set('offset', String(options.offset));
    if (options?.fields) params.set('fields', options.fields);

    const url = `${this.baseUrl}/clientes${params.toString() ? `?${params.toString()}` : ''}`;
    return this.http
      .get<ApiResponse<Cliente[]> | ApiResponse<ClienteResumen[]>>(url)
      .pipe(catchError(this.handleError.handleError));
  }

  actualizarCliente(
    documento: number,
    cliente: ClienteUpdate,
  ): Observable<ApiResponse<Cliente | undefined>> {
    const url = `${this.baseUrl}/clientes?id=${documento}`;
    return this.http
      .put<ApiResponse<Cliente | undefined>>(url, cliente)
      .pipe(catchError(this.handleError.handleError));
  }

  eliminarCliente(documento: number): Observable<ApiResponse<unknown>> {
    const url = `${this.baseUrl}/clientes?id=${documento}`;
    return this.http
      .delete<ApiResponse<unknown>>(url)
      .pipe(catchError(this.handleError.handleError));
  }
}
