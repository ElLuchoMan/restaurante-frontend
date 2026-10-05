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
import { notFoundAsEmpty } from './not-found.operator';

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
   * GET /clientes/search?id= (requiere token). Si no existe el back responde 404 HTTP; aquí se
   * expone como `{ code: 404, data: undefined }` para que el llamador trate "no encontrado".
   */
  getClienteId(documento: number): Observable<ApiResponse<Cliente | undefined>> {
    return this.http
      .get<ApiResponse<Cliente>>(`${this.baseUrl}/clientes/search?id=${documento}`)
      .pipe(
        notFoundAsEmpty<Cliente>('Cliente no encontrado'),
        catchError(this.handleError.handleError),
      );
  }

  /** POST /clientes (público). Errores: 400 validación, 409 documento/correo/teléfono repetido. */
  registroCliente(cliente: ClienteCreate): Observable<ApiResponse<Cliente>> {
    return this.http
      .post<ApiResponse<Cliente>>(`${this.baseUrl}/clientes`, cliente)
      .pipe(catchError(this.handleError.handleError));
  }

  /**
   * GET /clientes (requiere token). `limit` debe estar entre 1 y 100 (400 si no); con
   * `fields=nombre_completo_telefono` devuelve la proyección reducida.
   */
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

  /** PUT /clientes?id= con merge. Errores: 400, 404 (no existe), 409 (correo/teléfono repetido). */
  actualizarCliente(documento: number, cliente: ClienteUpdate): Observable<ApiResponse<Cliente>> {
    const url = `${this.baseUrl}/clientes?id=${documento}`;
    return this.http
      .put<ApiResponse<Cliente>>(url, cliente)
      .pipe(catchError(this.handleError.handleError));
  }

  /** DELETE /clientes?id=. Errores: 404 (no existe), 409 (tiene registros asociados). */
  eliminarCliente(documento: number): Observable<ApiResponse<unknown>> {
    const url = `${this.baseUrl}/clientes?id=${documento}`;
    return this.http
      .delete<ApiResponse<unknown>>(url)
      .pipe(catchError(this.handleError.handleError));
  }
}
