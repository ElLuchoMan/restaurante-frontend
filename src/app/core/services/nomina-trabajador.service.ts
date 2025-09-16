import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/models/api-response.model';
import { NominaTrabajador } from '../../shared/models/nomina-trabajador.model';
import { HandleErrorService } from './handle-error.service';

export interface NominaTrabajadorRequest {
  documentoTrabajador: number;
  detalles?: string;
}

@Injectable({ providedIn: 'root' })
export class NominaTrabajadorService {
  private baseUrl = `${environment.apiUrl}/nomina_trabajador`;
  constructor(
    private http: HttpClient,
    private handleError: HandleErrorService,
  ) {}

  list(): Observable<ApiResponse<NominaTrabajador[]>> {
    return this.http
      .get<ApiResponse<NominaTrabajador[]>>(this.baseUrl)
      .pipe(catchError(this.handleError.handleError));
  }

  listMes(mes?: number, anio?: number): Observable<ApiResponse<Record<string, unknown>[]>> {
    let params = new HttpParams();
    if (mes !== undefined) params = params.set('mes', String(mes));
    if (anio !== undefined) params = params.set('anio', String(anio));
    return this.http
      .get<ApiResponse<Record<string, unknown>[]>>(`${this.baseUrl}/mes`, { params })
      .pipe(catchError(this.handleError.handleError));
  }

  search(params: {
    documento: number;
    actual?: boolean;
    pagas?: boolean;
    no_pagas?: boolean;
    mes?: number;
    anio?: number;
  }): Observable<ApiResponse<Record<string, unknown>[]>> {
    let hp = new HttpParams().set('documento', String(params.documento));
    if (params.actual !== undefined) hp = hp.set('actual', String(params.actual));
    if (params.pagas !== undefined) hp = hp.set('pagas', String(params.pagas));
    if (params.no_pagas !== undefined) hp = hp.set('no_pagas', String(params.no_pagas));
    if (params.mes !== undefined) hp = hp.set('mes', String(params.mes));
    if (params.anio !== undefined) hp = hp.set('anio', String(params.anio));
    return this.http
      .get<ApiResponse<Record<string, unknown>[]>>(`${this.baseUrl}/search`, { params: hp })
      .pipe(catchError(this.handleError.handleError));
  }

  create(body: NominaTrabajadorRequest): Observable<ApiResponse<Record<string, unknown>>> {
    return this.http
      .post<ApiResponse<Record<string, unknown>>>(this.baseUrl, body)
      .pipe(catchError(this.handleError.handleError));
  }
}
