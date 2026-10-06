import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';

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

  /** GET /reserva_contacto (solo personal, requiere token). Filtros opcionales; sin coincidencias responde 200 con `data: []`. */
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
      .get<ApiResponse<ReservaContacto[]>>(`${this.baseUrl}/reserva_contacto`, {
        params: httpParams,
      })
      .pipe(catchError(this.handleError.handleError));
  }

  /**
   * GET /reserva_contacto/search?id= (solo personal, requiere token). Si el contacto no existe el backend responde 404 y se
   * devuelve `null`; un id inválido (400) y el resto de errores se propagan.
   */
  getById(id: number): Observable<ReservaContacto | null> {
    const params = new HttpParams().set('id', String(id));
    return this.http
      .get<ApiResponse<ReservaContacto>>(`${this.baseUrl}/reserva_contacto/search`, { params })
      .pipe(
        map((res) => res.data),
        catchError((error) =>
          error?.status === 404 ? of(null) : this.handleError.handleError(error),
        ),
      );
  }
}
