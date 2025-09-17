import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/models/api-response.model';
import { ReservaContacto } from '../../shared/models/reserva-contacto.model';
import { HandleErrorService } from './handle-error.service';

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
  }): Observable<ApiResponse<ReservaContacto[]>> {
    let httpParams = new HttpParams();
    if (params?.documento_contacto)
      httpParams = httpParams.set('documento_contacto', String(params.documento_contacto));
    if (params?.documento_cliente)
      httpParams = httpParams.set('documento_cliente', String(params.documento_cliente));

    return this.http
      .get<
        ApiResponse<ReservaContacto[]>
      >(`${this.baseUrl}/reserva_contacto`, { params: httpParams })
      .pipe(catchError(this.handleError.handleError));
  }

  getById(id: number): Observable<ApiResponse<ReservaContacto>> {
    const params = new HttpParams().set('id', String(id));
    return this.http
      .get<ApiResponse<ReservaContacto>>(`${this.baseUrl}/reserva_contacto/search`, { params })
      .pipe(catchError(this.handleError.handleError));
  }
}
