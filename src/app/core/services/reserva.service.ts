import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, switchMap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { HandleErrorService } from '../../core/services/handle-error.service';
import { UserService } from '../../core/services/user.service';
import { ApiResponse } from '../../shared/models/api-response.model';
import { Reserva, ReservaCreate, ReservaUpdate } from '../../shared/models/reserva.model';
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
  ): Observable<ApiResponse<Reserva>> {
    const userId = this.userService.getUserId?.();
    const role = this.userService.getUserRole?.();
    const payload: any = { ...reserva };

    const postReserva = (body: any) =>
      this.http
        .post<ApiResponse<Reserva>>(`${this.baseUrl}/reservas`, body)
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
    delete payload.contactoId;

    return postReserva(payload);
  }

  obtenerReservas(): Observable<ApiResponse<Reserva[]>> {
    return this.http
      .get<ApiResponse<Reserva[]>>(`${this.baseUrl}/reservas`)
      .pipe(catchError(this.handleError.handleError));
  }

  actualizarReserva(reservaId: number, reserva: ReservaUpdate): Observable<ApiResponse<Reserva>> {
    return this.http
      .put<ApiResponse<Reserva>>(`${this.baseUrl}/reservas?id=${reservaId}`, reserva)
      .pipe(catchError(this.handleError.handleError));
  }

  getReservaByParameter(contactoId?: number, fecha?: string): Observable<ApiResponse<Reserva[]>> {
    let params = new HttpParams();

    if (contactoId !== undefined && !isNaN(contactoId)) {
      params = params.set('contactoId', contactoId.toString());
    }

    if (fecha) params = params.set('fecha', fecha);

    return this.http
      .get<ApiResponse<Reserva[]>>(`${this.baseUrl}/reservas/parameter`, { params })
      .pipe(catchError(this.handleError.handleError));
  }

  // Métodos de contacto fueron trasladados a ReservaContactoService para SRP
}
