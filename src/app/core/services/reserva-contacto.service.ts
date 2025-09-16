import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/models/api-response.model';
import { HandleErrorService } from './handle-error.service';

export interface ReservaContactoDTO {
  contactoId: number;
  nombreCompleto?: string;
  telefono?: string;
  documentoCliente?: { documentoCliente: number };
}

@Injectable({ providedIn: 'root' })
export class ReservaContactoService {
  private baseUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private handleError: HandleErrorService,
  ) {}

  getContactos(params?: {
    documento_contacto?: number;
    documento_cliente?: number;
  }): Observable<ApiResponse<ReservaContactoDTO[]>> {
    let httpParams = new HttpParams();
    if (params?.documento_contacto)
      httpParams = httpParams.set('documento_contacto', String(params.documento_contacto));
    if (params?.documento_cliente)
      httpParams = httpParams.set('documento_cliente', String(params.documento_cliente));

    return this.http
      .get<
        ApiResponse<ReservaContactoDTO[]>
      >(`${this.baseUrl}/reserva_contacto`, { params: httpParams })
      .pipe(catchError(this.handleError.handleError));
  }

  getById(id: number): Observable<ApiResponse<ReservaContactoDTO>> {
    const params = new HttpParams().set('id', String(id));
    return this.http
      .get<ApiResponse<ReservaContactoDTO>>(`${this.baseUrl}/reserva_contacto/search`, { params })
      .pipe(catchError(this.handleError.handleError));
  }
}
