import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { BehaviorSubject, catchError, map, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/models/api-response.model';
import { Login, LoginResponse } from '../../shared/models/login.model';
import { HandleErrorService } from './handle-error.service';
import { LoggingService, LogLevel } from './logging.service';

export interface DecodedToken {
  rol: string;
  documento: number;
  exp: number;
  [key: string]: unknown;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private baseUrl = environment.apiUrl;
  private tokenKey = 'auth_token';
  private refreshTokenKey = 'refresh_token';
  private useSession = false;
  private refreshTimer: any = null;

  private authState = new BehaviorSubject<boolean>(this.isLoggedIn());

  constructor(
    private http: HttpClient,
    private handleError: HandleErrorService,
    private logger: LoggingService,
  ) {}

  getAuthState(): Observable<boolean> {
    return this.authState.asObservable();
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  login(credenciales: Login): Observable<ApiResponse<LoginResponse>> {
    return this.http
      .post<ApiResponse<LoginResponse>>(`${this.baseUrl}/login`, credenciales)
      .pipe(catchError(this.handleError.handleError));
  }

  setRemember(remember: boolean): void {
    this.useSession = !remember;
  }

  private storage(): Storage {
    return this.useSession ? sessionStorage : localStorage;
  }

  saveToken(token: string): void {
    this.storage().setItem(this.tokenKey, token);
    this.authState.next(true);
  }

  saveTokens(accessToken: string, refreshToken: string): void {
    const storage = this.storage();
    storage.setItem(this.tokenKey, accessToken);
    storage.setItem(this.refreshTokenKey, refreshToken);
    this.authState.next(true);

    // Programar refresh automático para 25 minutos (5 min antes de que expire)
    this.scheduleTokenRefresh();
  }

  getRefreshToken(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }
    // Buscar en ambos storages para compatibilidad
    return (
      localStorage.getItem(this.refreshTokenKey) ?? sessionStorage.getItem(this.refreshTokenKey)
    );
  }

  getToken(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }
    // Buscar en ambos storages para compatibilidad
    return localStorage.getItem(this.tokenKey) ?? sessionStorage.getItem(this.tokenKey);
  }

  private decodeTokenSafely(token: string): DecodedToken | null {
    try {
      return jwtDecode<DecodedToken>(token);
    } catch (error: unknown) {
      this.logger.log(LogLevel.ERROR, 'Error al decodificar el token', error as Error);
      return null;
    }
  }

  decodeToken(): DecodedToken | null {
    const token = this.getToken();
    return token ? this.decodeTokenSafely(token) : null;
  }

  getUserRole(): string | null {
    const decoded: DecodedToken | null = this.decodeToken();
    return decoded ? decoded.rol : null;
  }

  getUserId(): number {
    const decoded: DecodedToken | null = this.decodeToken();
    return decoded ? decoded.documento : 0;
  }

  isTokenExpired(): boolean {
    const decoded: DecodedToken | null = this.decodeToken();
    if (!decoded) {
      // Si no hay token en absoluto: no expirado. Si hay token malformado: expirado.
      const token = this.getToken();
      return !!token; // true si hay token pero no se pudo decodificar
    }
    if (typeof decoded.exp !== 'number') return true;

    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  }

  logout(): void {
    // Limpiar timer de refresh
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }

    // Limpiar tokens de ambos storages
    localStorage.removeItem(this.tokenKey);
    sessionStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    sessionStorage.removeItem(this.refreshTokenKey);

    this.authState.next(false);
  }

  validateTokenAndLogout(): string | null {
    const token = this.getToken();
    if (token && this.isTokenExpired()) {
      this.logout();
      return null;
    }
    return token;
  }

  refreshTokens(): Observable<ApiResponse<LoginResponse>> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.logout();
      throw new Error('No refresh token available');
    }

    return this.http
      .post<ApiResponse<LoginResponse>>(
        `${this.baseUrl}/auth/refresh`,
        {},
        {
          headers: { Authorization: `Bearer ${refreshToken}` },
        },
      )
      .pipe(
        catchError((error) => {
          this.logger.log(LogLevel.ERROR, 'Error al refrescar token', error);
          this.logout(); // Si falla el refresh, hacer logout
          return this.handleError.handleError(error);
        }),
      );
  }

  private scheduleTokenRefresh(): void {
    // Limpiar timer anterior si existe
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    // Programar refresh para 25 minutos (1500000 ms)
    this.refreshTimer = setTimeout(
      () => {
        this.refreshTokens().subscribe({
          next: (response) => {
            this.saveTokens(response.data.access_token, response.data.refresh_token);
            this.logger.log(LogLevel.INFO, 'Tokens refrescados automáticamente');
          },
          error: (error) => {
            this.logger.log(LogLevel.ERROR, 'Error en refresh automático', error);
            // El logout ya se maneja en refreshTokens()
          },
        });
      },
      25 * 60 * 1000,
    ); // 25 minutos
  }

  // Método para intentar refresh manual cuando una API call falla con 401
  attemptTokenRefresh(): Observable<boolean> {
    return this.refreshTokens().pipe(
      map((response) => {
        this.saveTokens(response.data.access_token, response.data.refresh_token);
        return true;
      }),
      catchError(() => {
        return new Observable<boolean>((observer) => {
          observer.next(false);
          observer.complete();
        });
      }),
    );
  }
}
