import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/models/api-response.model';
import {
  AsociarProductoRequest,
  CrearOfertaRequest,
  Oferta,
  OfertaActiva,
  OfertaParams,
} from '../../shared/models/oferta.model';
import { HandleErrorService } from './handle-error.service';

@Injectable({ providedIn: 'root' })
export class OfertaService {
  private baseUrl = `${environment.apiUrl}/ofertas`;

  constructor(
    private http: HttpClient,
    private handleError: HandleErrorService,
  ) {}

  crear(body: CrearOfertaRequest): Observable<ApiResponse<Oferta>> {
    return this.http
      .post<ApiResponse<Oferta>>(`${this.baseUrl}`, body)
      .pipe(catchError(this.handleError.handleError));
  }

  listar(params?: OfertaParams): Observable<ApiResponse<Oferta[]>> {
    let hp = new HttpParams();
    if (params)
      Object.entries(params).forEach(([k, v]) => v != null && (hp = hp.set(k, String(v))));
    return this.http
      .get<ApiResponse<Oferta[]>>(`${this.baseUrl}`, { params: hp })
      .pipe(catchError(this.handleError.handleError));
  }

  obtener(id: number): Observable<ApiResponse<Oferta>> {
    return this.http
      .get<ApiResponse<Oferta>>(`${this.baseUrl}/${id}`)
      .pipe(catchError(this.handleError.handleError));
  }

  actualizar(id: number, body: Partial<CrearOfertaRequest>): Observable<ApiResponse<Oferta>> {
    return this.http
      .put<ApiResponse<Oferta>>(`${this.baseUrl}/${id}`, body)
      .pipe(catchError(this.handleError.handleError));
  }

  obtenerActivas(params?: {
    restaurante_id?: number;
    fecha?: string;
    hora?: string;
    producto_id?: number;
    limit?: number;
    offset?: number;
  }): Observable<ApiResponse<OfertaActiva[]>> {
    let hp = new HttpParams();
    if (params)
      Object.entries(params).forEach(([k, v]) => v != null && (hp = hp.set(k, String(v))));
    // Este endpoint es público según la guía
    return this.http
      .get<ApiResponse<OfertaActiva[]>>(`${this.baseUrl}/activas`, { params: hp })
      .pipe(catchError(this.handleError.handleError));
  }

  asociarProducto(
    ofertaId: number,
    body: AsociarProductoRequest,
  ): Observable<ApiResponse<unknown>> {
    return this.http
      .post<ApiResponse<unknown>>(`${this.baseUrl}/${ofertaId}/productos`, body)
      .pipe(catchError(this.handleError.handleError));
  }

  desasociarProducto(ofertaId: number, productoId: number): Observable<ApiResponse<unknown>> {
    return this.http
      .delete<ApiResponse<unknown>>(`${this.baseUrl}/${ofertaId}/productos/${productoId}`)
      .pipe(catchError(this.handleError.handleError));
  }
}
