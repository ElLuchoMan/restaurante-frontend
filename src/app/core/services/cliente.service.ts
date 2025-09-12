import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/models/api-response.model';
import { Cliente } from '../../shared/models/cliente.model';
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

  getClienteId(documento: number): Observable<ApiResponse<Cliente>> {
    return this.http
      .get<ApiResponse<Cliente>>(`${this.baseUrl}/clientes/search?id=${documento}`)
      .pipe(catchError(this.handleError.handleError));
  }

  registroCliente(cliente: Cliente): Observable<ApiResponse<Cliente>> {
    return this.http
      .post<ApiResponse<Cliente>>(`${this.baseUrl}/clientes`, cliente)
      .pipe(catchError(this.handleError.handleError));
  }

  getClientes(
    options?: { limit?: number; offset?: number; fields?: string },
  ): Observable<ApiResponse<Cliente[]>> {
    const params = new URLSearchParams();
    if (options?.limit !== undefined) params.set('limit', String(options.limit));
    if (options?.offset !== undefined) params.set('offset', String(options.offset));
    if (options?.fields) params.set('fields', options.fields);

    const url = `${this.baseUrl}/clientes${params.toString() ? `?${params.toString()}` : ''}`;
    return this.http
      .get<ApiResponse<Cliente[]>>(url)
      .pipe(catchError(this.handleError.handleError));
  }

  actualizarCliente(
    documento: number,
    partial: Partial<Cliente>,
  ): Observable<ApiResponse<Cliente>> {
    const url = `${this.baseUrl}/clientes?id=${documento}`;
    return this.http
      .put<ApiResponse<Cliente>>(url, partial)
      .pipe(catchError(this.handleError.handleError));
  }

  eliminarCliente(documento: number): Observable<ApiResponse<unknown>> {
    const url = `${this.baseUrl}/clientes?id=${documento}`;
    return this.http
      .delete<ApiResponse<unknown>>(url)
      .pipe(catchError(this.handleError.handleError));
  }
}
