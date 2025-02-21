import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { HandleErrorService } from './handle-error.service';
import { Observable, catchError } from 'rxjs';
import { ApiResponse } from '../../shared/models/api-response.model';
import { Trabajador } from '../../shared/models/trabajador.model';

@Injectable({
  providedIn: 'root'
})
export class TrabajadorService {
  private baseUrl = environment.apiUrl;
  private tokenKey = 'auth_token';
  constructor(private http: HttpClient, private handleError: HandleErrorService) { }

  registroTrabajador(trabajador: Trabajador): Observable<ApiResponse<Trabajador>> {
    return this.http.post<ApiResponse<Trabajador>>(`${this.baseUrl}/trabajadores`, trabajador).pipe(
      catchError(this.handleError.handleError)
    );
  }
  searchTrabajador(documento_trabajador: number): Observable<ApiResponse<Trabajador>> {
    return this.http.get<ApiResponse<Trabajador>>(`${this.baseUrl}/trabajadores/search?id=${documento_trabajador}`).pipe(
      catchError(this.handleError.handleError)
    )
  }

  getTrabajadores(): Observable<ApiResponse<Trabajador>> {
    return this.http.get<ApiResponse<Trabajador>>(`${this.baseUrl}/trabajadores`).pipe(
      catchError(this.handleError.handleError)
    )
  }
}
