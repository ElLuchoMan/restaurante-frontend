import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError,Observable } from 'rxjs';

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
}
