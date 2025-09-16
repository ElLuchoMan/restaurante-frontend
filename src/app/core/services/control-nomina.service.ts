import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable } from 'rxjs';

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

  list(fecha?: string): Observable<ControlNomina[]> {
    let params: HttpParams | undefined;
    if (fecha) params = new HttpParams().set('fecha', fecha);
    return this.http.get<ApiResponse<ControlNomina[]>>(this.baseUrl, { params }).pipe(
      map((res) => res.data),
      catchError(this.handleError.handleError),
    );
  }

  getById(id: number): Observable<ControlNomina> {
    const params = new HttpParams().set('id', String(id));
    return this.http
      .get<ApiResponse<ControlNomina>>(`${environment.apiUrl}/control_nomina/search`, { params })
      .pipe(
        map((res) => res.data),
        catchError(this.handleError.handleError),
      );
  }
}
