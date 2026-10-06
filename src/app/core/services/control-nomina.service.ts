import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/models/api-response.model';
import { ControlNomina } from '../../shared/models/control-nomina.model';
import { HandleErrorService } from './handle-error.service';

@Injectable({ providedIn: 'root' })
export class ControlNominaService {
  private baseUrl = `${environment.apiUrl}/control_nomina`;
  constructor(
    private http: HttpClient,
    private handleError: HandleErrorService,
  ) {}

  /** GET /control_nomina, filtro opcional `fecha` (YYYY-MM-DD; inválida = 400). Sin filas responde 200 con `data: []`. */
  list(fecha?: string): Observable<ControlNomina[]> {
    let params: HttpParams | undefined;
    if (fecha) params = new HttpParams().set('fecha', fecha);
    return this.http.get<ApiResponse<ControlNomina[]>>(this.baseUrl, { params }).pipe(
      map((res) => res.data),
      catchError(this.handleError.handleError),
    );
  }

  /** GET /control_nomina/search?id=. Si no existe el backend responde 404 y se devuelve `null`. */
  getById(id: number): Observable<ControlNomina | null> {
    const params = new HttpParams().set('id', String(id));
    return this.http.get<ApiResponse<ControlNomina>>(`${this.baseUrl}/search`, { params }).pipe(
      map((res) => res.data),
      catchError((error) =>
        error?.status === 404 ? of(null) : this.handleError.handleError(error),
      ),
    );
  }
}
