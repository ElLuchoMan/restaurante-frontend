import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { BehaviorSubject, catchError, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/models/api-response.model';
import { Login, LoginResponse } from '../../shared/models/login.model';
import { HandleErrorService } from './handle-error.service';
import { LoggingService, LogLevel } from './logging.service';

export interface DecodedToken {
  rol: string;
  documento: number;
  exp: number;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private baseUrl = environment.apiUrl;
  private tokenKey = 'auth_token';

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

  saveToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
    this.authState.next(true);
  }

  getToken(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }
    return localStorage.getItem(this.tokenKey);
  }

  private decodeTokenSafely(token: string): DecodedToken | null {
    try {
      return jwtDecode<DecodedToken>(token);
    } catch (error) {
      this.logger.log(LogLevel.ERROR, 'Error al decodificar el token', error);
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
    localStorage.removeItem(this.tokenKey);
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
}
