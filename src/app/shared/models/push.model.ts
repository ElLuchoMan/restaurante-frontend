export type PlataformaNotificacion = 'WEB' | 'ANDROID' | 'IOS';
export type ProveedorPush = 'WEB_PUSH' | 'FCM';
export type TipoRemitente = 'TRABAJADOR' | 'SISTEMA';
export type TipoDestinatario =
  'TODOS' | 'CLIENTE' | 'TRABAJADOR' | 'TOPIC' | 'CLIENTES' | 'TRABAJADORES';

/** Envoltorio de listados paginados de /push (models.PaginatedResponse), dentro de ApiResponse.data. */
export interface PushPaginatedData<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Dispositivo push tal como lo expone el backend: `documentoCliente`/`documentoTrabajador` son el
 * número de documento (no el struct), `subscribedTopics` siempre es una lista y las fechas llegan como
 * `DD-MM-YYYY HH:MM:SS` en hora de Bogotá.
 */
export interface PushDispositivo {
  pushDispositivoId: number;
  plataforma: PlataformaNotificacion;
  endpoint?: string | null;
  p256dh?: string | null;
  auth?: string | null;
  fcmToken?: string | null;
  enabled: boolean;
  locale?: string | null;
  timeZone?: string | null;
  appVersion?: string | null;
  userAgent?: string | null;
  subscribedTopics: string[];
  documentoCliente?: number | null;
  documentoTrabajador?: number | null;
  /** `DD-MM-YYYY HH:MM:SS` (hora de Bogotá). */
  createdAt: string;
  /** `DD-MM-YYYY HH:MM:SS` (hora de Bogotá). */
  lastSeenAt?: string | null;
}

/**
 * POST /push/dispositivos: upsert por `fcmToken`/`endpoint`. Responde 201 si el dispositivo es nuevo y
 * 200 si ya existía (se reactiva y se reasigna el dueño). Indicar exactamente uno de
 * `documentoCliente`/`documentoTrabajador`.
 */
export interface RegistrarDispositivoRequest {
  plataforma: PlataformaNotificacion;
  endpoint?: string;
  p256dh?: string;
  auth?: string;
  fcmToken?: string;
  locale?: string;
  timeZone?: string;
  appVersion?: string;
  userAgent?: string;
  subscribedTopics?: string[];
  documentoCliente?: number;
  documentoTrabajador?: number;
}

export interface RemitenteNotificacion {
  tipo: TipoRemitente;
  documentoTrabajador?: number;
  nombre?: string;
}

export interface DestinatariosNotificacion {
  tipo: TipoDestinatario;
  documentoCliente?: number;
  documentoTrabajador?: number;
  topic?: string;
}

export interface ContenidoNotificacion {
  titulo: string;
  mensaje: string;
  datos?: Record<string, unknown>;
}

export interface EnviarNotificacionRequest {
  remitente: RemitenteNotificacion;
  destinatarios: DestinatariosNotificacion;
  notificacion: ContenidoNotificacion;
}

export interface DetalleEnvioNotificacion {
  pushDispositivoId: number;
  plataforma: string;
  exito: boolean;
  statusCode?: number;
  errorCode?: string;
  documentoCliente?: number;
  documentoTrabajador?: number;
}

export interface ResumenDestinatarios {
  tipoDestinatario: string;
  clientesNotificados?: number[];
  trabajadoresNotificados?: number[];
  topicsNotificados?: string[];
}

export interface EnviarNotificacionResponse {
  totalDispositivos: number;
  enviosExitosos: number;
  enviosFallidos: number;
  detalleEnvios: DetalleEnvioNotificacion[];
  resumenDestinatarios: ResumenDestinatarios;
}

/**
 * Body de PUT /push/dispositivos (merge): los campos ausentes se conservan. `locale`, `timeZone`,
 * `appVersion` y `userAgent` admiten `null` para limpiarse; `enabled` y `subscribedTopics` NO admiten
 * `null` (400).
 */
export interface ActualizarDispositivoRequest {
  enabled?: boolean;
  locale?: string | null;
  timeZone?: string | null;
  appVersion?: string | null;
  userAgent?: string | null;
  subscribedTopics?: string[];
}

/**
 * Query params de GET /push/dispositivos (el backend no filtra por `enabled`).
 * `limit` 1-100 (por defecto 20; >100 se reduce a 100) y `offset` >= 0; valores inválidos responden 400.
 */
export interface PushParams {
  limit?: number;
  offset?: number;
  plataforma?: PlataformaNotificacion;
  cliente_id?: number;
  trabajador_id?: number;
}

/** Query params de GET /push/envios (fechas YYYY-MM-DD). */
export interface PushEnviosParams {
  dispositivo_id?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
  limit?: number;
  offset?: number;
}

export interface RegistrarEnvioRequest {
  pushDispositivoId: number;
  proveedor: ProveedorPush;
  data?: Record<string, unknown>;
  exito: boolean;
  statusCode?: number;
  errorCode?: string;
}

/** `pushDispositivoId` es el id numérico del dispositivo; `sentAt` llega como `DD-MM-YYYY HH:MM:SS` (Bogotá). */
export interface PushEnviosParams {
  dispositivo_id?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
  limit?: number;
  offset?: number;
}

export interface RegistrarEnvioRequest {
  pushDispositivoId: number;
  proveedor: ProveedorPush;
  data?: Record<string, unknown>;
  exito: boolean;
  statusCode?: number;
  errorCode?: string;
}

/** El backend serializa `pushDispositivoId` con el dispositivo (FK) completo, no con el id. */
export interface PushEnvio {
  pushEnvioId: number;
  pushDispositivoId: number;
  proveedor: ProveedorPush;
  data?: Record<string, unknown>;
  exito: boolean;
  statusCode?: number;
  errorCode?: string;
  sentAt: string;
}
