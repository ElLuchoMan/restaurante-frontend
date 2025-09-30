import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/models/api-response.model';
import {
  CrearCuponRequest,
  Cupon,
  CuponParams,
  CuponRedencion,
  RedimirCuponRequest,
  ValidarCuponRequest,
  ValidarCuponResponse,
} from '../../shared/models/cupon.model';
import { HandleErrorService } from './handle-error.service';

@Injectable({ providedIn: 'root' })
export class CuponService {
  private baseUrl = `${environment.apiUrl}/cupones`;

  constructor(
    private http: HttpClient,
    private handleError: HandleErrorService,
  ) {}

  crear(body: CrearCuponRequest): Observable<ApiResponse<Cupon>> {
    return this.http
      .post<ApiResponse<Cupon>>(`${this.baseUrl}`, body)
      .pipe(catchError(this.handleError.handleError));
  }

  listar(params?: CuponParams): Observable<ApiResponse<Cupon[]>> {
    let hp = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) hp = hp.set(k, String(v));
      });
    }
    return this.http
      .get<ApiResponse<Cupon[]>>(`${this.baseUrl}`, { params: hp })
      .pipe(catchError(this.handleError.handleError));
  }

  obtener(id: number): Observable<ApiResponse<Cupon>> {
    return this.http
      .get<ApiResponse<Cupon>>(`${this.baseUrl}/${id}`)
      .pipe(catchError(this.handleError.handleError));
  }

  actualizar(id: number, body: Partial<CrearCuponRequest>): Observable<ApiResponse<Cupon>> {
    return this.http
      .put<ApiResponse<Cupon>>(`${this.baseUrl}/${id}`, body)
      .pipe(catchError(this.handleError.handleError));
  }

  validar(body: ValidarCuponRequest): Observable<ApiResponse<ValidarCuponResponse>> {
    return this.http
      .post<ApiResponse<ValidarCuponResponse>>(`${this.baseUrl}/validar`, body)
      .pipe(catchError(this.handleError.handleError));
  }

  redimir(codigo: string, body: RedimirCuponRequest): Observable<ApiResponse<CuponRedencion>> {
    return this.http
      .post<
        ApiResponse<CuponRedencion>
      >(`${this.baseUrl}/${encodeURIComponent(codigo)}/redimir`, body)
      .pipe(catchError(this.handleError.handleError));
  }

  listarRedenciones(params?: {
    limit?: number;
    offset?: number;
  }): Observable<ApiResponse<CuponRedencion[]>> {
    let hp = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) hp = hp.set(k, String(v));
      });
    }
    return this.http
      .get<ApiResponse<CuponRedencion[]>>(`${this.baseUrl}/redenciones`, { params: hp })
      .pipe(catchError(this.handleError.handleError));
  }
}
