import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/models/api-response.model';
import { Restaurante } from '../../shared/models/restaurante.model';
import { CambioHorario } from '../../shared/models/cambio-horario.model';
import { HandleErrorService } from './handle-error.service';

@Injectable({
  providedIn: 'root',
})
export class RestauranteService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient, private handleError: HandleErrorService) { }

  getRestauranteInfo(): Observable<ApiResponse<Restaurante>> {
    return this.http.get<ApiResponse<Restaurante>>(`${this.baseUrl}/restaurantes/search?id=1`).pipe(
      catchError(this.handleError.handleError)
    );
  }

  getCambiosHorario(): Observable<ApiResponse<CambioHorario>> {
    return this.http.get<ApiResponse<CambioHorario>>(`${this.baseUrl}/cambios_horario/actual`).pipe(
      catchError(this.handleError.handleError)
    );
  }
}
