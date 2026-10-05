import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/models/api-response.model';
import { Nomina, NominaCreate } from '../../shared/models/nomina.model';
import { HandleErrorService } from './handle-error.service';

@Injectable({ providedIn: 'root' })
export class NominaService {
  private baseUrl = `${environment.apiUrl}/nominas`;
  constructor(
    private http: HttpClient,
    private handleError: HandleErrorService,
  ) {}

  /**
   * GET /nominas. Filtros opcionales: `fecha` (YYYY-MM-DD), `mes` (1-12) y `anio`.
   * Sin coincidencias el backend responde 200 con `code: 404` y sin `data`: se devuelve [].
   */
  list(params?: { fecha?: string; mes?: number; anio?: number }): Observable<Nomina[]> {
    let hp: HttpParams | undefined;
    if (params) {
      let p = new HttpParams();
      if (params.fecha) p = p.set('fecha', params.fecha);
      if (params.mes !== undefined) p = p.set('mes', String(params.mes));
      if (params.anio !== undefined) p = p.set('anio', String(params.anio));
      hp = p;
    }
    return this.http.get<ApiResponse<Nomina[] | undefined>>(this.baseUrl, { params: hp }).pipe(
      map((res) => res.data ?? []),
      catchError(this.handleError.handleError),
    );
  }

  /**
   * PUT /nominas?id=: marca la nómina como PAGO (400 si ya lo estaba).
   * Si no existe responde 200 con `code: 404` y sin `data`: se devuelve null.
   */
  updateEstado(id: number): Observable<Nomina | null> {
    const params = new HttpParams().set('id', String(id));
    return this.http.put<ApiResponse<Nomina | undefined>>(this.baseUrl, {}, { params }).pipe(
      map((res) => res.data ?? null),
      catchError(this.handleError.handleError),
    );
  }

  /**
   * POST /nominas. 201 con la nómina creada; si ya existía una en el mes responde 200 con
   * la existente (marcada REGENERADA en control_nomina). La fecha debe ser día >= 20.
   */
  create(body: NominaCreate): Observable<ApiResponse<Nomina>> {
    return this.http
      .post<ApiResponse<Nomina>>(this.baseUrl, body)
      .pipe(catchError(this.handleError.handleError));
  }

  /** DELETE /nominas?id=: borrado lógico (estado NO_PAGO); la respuesta no incluye `data`. */
  delete(id: number): Observable<ApiResponse<undefined>> {
    const params = new HttpParams().set('id', String(id));
    return this.http
      .delete<ApiResponse<undefined>>(this.baseUrl, { params })
      .pipe(catchError(this.handleError.handleError));
  }
}
