import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, switchMap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { HandleErrorService } from '../../core/services/handle-error.service';
import { UserService } from '../../core/services/user.service';
import { ApiResponse } from '../../shared/models/api-response.model';
import {
  ReservaBase,
  ReservaCreate,
  ReservaPopulada,
  ReservaUpdate,
} from '../../shared/models/reserva.model';
import { ReservaContactoService } from './reserva-contacto.service';

@Injectable({
  providedIn: 'root',
})
export class ReservaService {
  private baseUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private userService: UserService,
    private handleError: HandleErrorService,
    private reservaContactoService: ReservaContactoService,
  ) {}

  crearReserva(
    reserva: ReservaCreate & { documentoCliente?: number | null },
  ): Observable<ApiResponse<ReservaPopulada>> {
    const userId = this.userService.getUserId?.();
    const role = this.userService.getUserRole?.();
    const payload: any = { ...reserva };

    const postReserva = (body: any) =>
      this.http
        .post<ApiResponse<ReservaPopulada>>(`${this.baseUrl}/reservas`, body)
        .pipe(catchError(this.handleError.handleError));

    // Cliente autenticado: resolver contactoId real a partir del documento
    if (role === 'Cliente' && typeof userId === 'number' && !isNaN(userId)) {
      return this.reservaContactoService.getContactos({ documento_cliente: userId }).pipe(
        map((r) =>
          Array.isArray(r?.data) && r.data.length > 0 ? (r.data[0] as any)?.contactoId : null,
        ),
        switchMap((contactoId) => {
          const finalPayload = { ...payload };
          if (contactoId) {
            finalPayload.contactoId = contactoId;
            delete finalPayload.documentoCliente;
          } else {
            // Fallback: enviar documentoCliente si no hay contacto
            finalPayload.documentoCliente = userId;
            delete finalPayload.contactoId;
          }
          return postReserva(finalPayload);
        }),
        catchError(() => postReserva(payload)),
      );
    }

    // Admin u otro/anónimo: permitir documentoCliente si fue provisto
    if (payload.documentoCliente == null || isNaN(Number(payload.documentoCliente))) {
      delete payload.documentoCliente;
    }
    if (payload.contactoId == null || isNaN(Number(payload.contactoId))) {
      delete payload.contactoId;
    }

    return postReserva(payload);
  }

  obtenerReservas(): Observable<ApiResponse<ReservaPopulada[]>> {
    return this.http
      .get<ApiResponse<ReservaPopulada[]>>(`${this.baseUrl}/reservas`)
      .pipe(catchError(this.handleError.handleError));
  }

  actualizarReserva(
    reservaId: number,
    reserva: ReservaUpdate,
  ): Observable<ApiResponse<ReservaPopulada>> {
    return this.http
      .put<ApiResponse<ReservaPopulada>>(`${this.baseUrl}/reservas?id=${reservaId}`, reserva)
      .pipe(catchError(this.handleError.handleError));
  }

  getReservaByParameter(
    contactoId?: number,
    fecha?: string,
    restauranteId?: number,
    dia?: string,
  ): Observable<ApiResponse<ReservaPopulada[]>> {
    let params = new HttpParams();

    if (contactoId !== undefined && !isNaN(contactoId)) {
      params = params.set('contactoId', contactoId.toString());
    }

    if (fecha) params = params.set('fecha', fecha);

    // Compatibilidad con endpoints públicos (Postman): restaurante_id y dia
    if (restauranteId !== undefined && !isNaN(restauranteId)) {
      params = params.set('restaurante_id', restauranteId.toString());
    }
    if (dia) params = params.set('dia', dia);

    return this.http
      .get<ApiResponse<ReservaPopulada[]>>(`${this.baseUrl}/reservas/parameter`, { params })
      .pipe(catchError(this.handleError.handleError));
  }

  getReservaById(id: number): Observable<ApiResponse<ReservaPopulada>> {
    const params = new HttpParams().set('id', String(id));
    return this.http
      .get<ApiResponse<ReservaPopulada>>(`${this.baseUrl}/reservas/search`, { params })
      .pipe(catchError(this.handleError.handleError));
  }

  deleteReserva(id: number): Observable<ApiResponse<unknown>> {
    const params = new HttpParams().set('id', String(id));
    return this.http
      .delete<ApiResponse<unknown>>(`${this.baseUrl}/reservas`, { params })
      .pipe(catchError(this.handleError.handleError));
  }

  // Métodos de contacto fueron trasladados a ReservaContactoService para SRP
}
