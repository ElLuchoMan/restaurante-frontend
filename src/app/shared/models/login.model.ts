export interface Login {
  documento: number;
  password: string;
}

/**
 * Cuerpo `data` de POST /login y POST /auth/refresh (map[string]string en el back).
 * El rol NO viaja aquí: está en el claim `rol` del JWT (ver DecodedToken).
 */
export interface LoginResponse {
  token: string; // alias de access_token (compatibilidad hacia atrás)
  access_token: string;
  refresh_token: string;
  token_type: string; // siempre "Bearer"
  expires_in: string; // segundos, como string (el back responde "1800")
  nombre: string; // "<nombre> <apellido>"
}
