import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/models/api-response.model';
import { CambioHorario } from '../../shared/models/cambio-horario.model';
import { Restaurante } from '../../shared/models/restaurante.model';
import { HandleErrorService } from './handle-error.service';

@Injectable({
  providedIn: 'root',
})
export class RestauranteService {
  private baseUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private handleError: HandleErrorService,
  ) {}

  getRestauranteInfo(): Observable<ApiResponse<Restaurante>> {
    return this.http
      .get<ApiResponse<Restaurante>>(`${this.baseUrl}/restaurantes/search?id=1`)
      .pipe(catchError(this.handleError.handleError));
  }

  getCambiosHorario(): Observable<ApiResponse<CambioHorario>> {
    return this.http
      .get<ApiResponse<CambioHorario>>(`${this.baseUrl}/cambios_horario/actual`)
      .pipe(catchError(this.handleError.handleError));
  }

  // CRUD opcional según Swagger/Postman
  listRestaurantes(): Observable<ApiResponse<Restaurante[]>> {
    return this.http
      .get<ApiResponse<Restaurante[]>>(`${this.baseUrl}/restaurantes`)
      .pipe(catchError(this.handleError.handleError));
  }

  createRestaurante(body: Partial<Restaurante>): Observable<ApiResponse<Restaurante>> {
    return this.http
      .post<ApiResponse<Restaurante>>(`${this.baseUrl}/restaurantes`, body)
      .pipe(catchError(this.handleError.handleError));
  }

  updateRestaurante(id: number, body: Partial<Restaurante>): Observable<ApiResponse<Restaurante>> {
    const params = new HttpParams().set('id', String(id));
    return this.http
      .put<ApiResponse<Restaurante>>(`${this.baseUrl}/restaurantes`, body, { params })
      .pipe(catchError(this.handleError.handleError));
  }

  deleteRestaurante(id: number): Observable<ApiResponse<unknown>> {
    const params = new HttpParams().set('id', String(id));
    return this.http
      .delete<ApiResponse<unknown>>(`${this.baseUrl}/restaurantes`, { params })
      .pipe(catchError(this.handleError.handleError));
  }
}
