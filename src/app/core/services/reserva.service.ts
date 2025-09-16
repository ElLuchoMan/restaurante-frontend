import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, switchMap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { HandleErrorService } from '../../core/services/handle-error.service';
import { UserService } from '../../core/services/user.service';
import { ApiResponse } from '../../shared/models/api-response.model';
import { Reserva, ReservaCreate, ReservaUpdate } from '../../shared/models/reserva.model';

@Injectable({
  providedIn: 'root',
})
export class ReservaService {
  private baseUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private userService: UserService,
    private handleError: HandleErrorService,
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
      const params = new HttpParams().set('documento_cliente', String(userId));
      return this.http.get<ApiResponse<any>>(`${this.baseUrl}/reserva_contacto`, { params }).pipe(
        map((r) => (Array.isArray(r?.data) && r.data.length > 0 ? r.data[0]?.contactoId : null)),
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

  // Helper: resolver contactoId a partir de documento del cliente
  getContactoIdByDocumento(documentoCliente: number): Observable<number | null> {
    if (documentoCliente == null || isNaN(documentoCliente)) return of(null);
    const params = new HttpParams().set('documento_cliente', String(documentoCliente));
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/reserva_contacto`, { params }).pipe(
      map((r) =>
        Array.isArray(r?.data) && r.data.length > 0 ? (r.data[0]?.contactoId ?? null) : null,
      ),
      catchError(() => of(null)),
    );
  }

  getContactoById(contactoId: number): Observable<{
    contactoId: number;
    nombreCompleto?: string;
    telefono?: string;
    documentoCliente?: { documentoCliente: number };
  } | null> {
    if (contactoId == null || isNaN(contactoId)) return of(null);
    const params = new HttpParams().set('id', String(contactoId));
    return this.http
      .get<ApiResponse<any>>(`${this.baseUrl}/reserva_contacto/search`, { params })
      .pipe(
        map((r) => (r?.data ? r.data : null)),
        catchError(() => of(null)),
      );
  }
}
