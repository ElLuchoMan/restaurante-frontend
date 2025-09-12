import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/models/api-response.model';
import { Trabajador } from '../../shared/models/trabajador.model';
import { HandleErrorService } from './handle-error.service';

@Injectable({
  providedIn: 'root',
})
export class TrabajadorService {
  private baseUrl = environment.apiUrl;
  constructor(
    private http: HttpClient,
    private handleError: HandleErrorService,
  ) {}

  registroTrabajador(trabajador: Trabajador): Observable<ApiResponse<Trabajador>> {
    return this.http
      .post<ApiResponse<Trabajador>>(`${this.baseUrl}/trabajadores`, trabajador)
      .pipe(catchError(this.handleError.handleError));
  }
  searchTrabajador(documento_trabajador: number): Observable<ApiResponse<Trabajador>> {
    return this.http
      .get<
        ApiResponse<Trabajador>
      >(`${this.baseUrl}/trabajadores/search?id=${documento_trabajador}`)
      .pipe(catchError(this.handleError.handleError));
  }

  getTrabajadores(): Observable<Trabajador[]> {
    return this.http.get<ApiResponse<Trabajador[]>>(`${this.baseUrl}/trabajadores`).pipe(
      map((res: ApiResponse<Trabajador[]>) => res.data),
      catchError(this.handleError.handleError),
    );
  }

  getTrabajadorId(documento: number): Observable<ApiResponse<Trabajador>> {
    return this.http
      .get<ApiResponse<Trabajador>>(`${this.baseUrl}/trabajadores/search?id=${documento}`)
      .pipe(catchError(this.handleError.handleError));
  }
}
