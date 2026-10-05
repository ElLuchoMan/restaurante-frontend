export type PlataformaNotificacion = 'WEB' | 'ANDROID' | 'IOS';
export type ProveedorPush = 'WEB_PUSH' | 'FCM';
export type TipoRemitente = 'TRABAJADOR' | 'SISTEMA';
export type TipoDestinatario =
  'TODOS' | 'CLIENTE' | 'TRABAJADOR' | 'TOPIC' | 'CLIENTES' | 'TRABAJADORES';

/**
 * El backend serializa las relaciones FK de PushDispositivo con el struct completo
 * (models.Cliente / models.Trabajador), no con el número de documento. Al listar solo
 * viene poblado el documento (el resto llega vacío).
 */
export interface PushClienteRef {
  documentoCliente: number;
  nombre?: string;
  apellido?: string;
  correo?: string;
  direccion?: string;
  telefono?: string;
  observaciones?: string | null;
}

export interface PushTrabajadorRef {
  documentoTrabajador: number;
  nombre?: string;
  apellido?: string;
  rol?: string;
  telefono?: string;
}

/** Envoltorio de listados paginados de /push (models.PaginatedResponse), dentro de ApiResponse.data. */
export interface PushPaginatedData<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

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
  documentoCliente?: PushClienteRef | null;
  documentoTrabajador?: PushTrabajadorRef | null;
  createdAt: string;
  lastSeenAt?: string | null;
}

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

/** Query params de GET /push/dispositivos (el backend no filtra por `enabled`). */
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

/** El backend serializa `pushDispositivoId` con el dispositivo (FK) completo, no con el id. */
export interface PushEnvio {
  pushEnvioId: number;
  pushDispositivoId: Partial<PushDispositivo> & Pick<PushDispositivo, 'pushDispositivoId'>;
  proveedor: ProveedorPush;
  data?: Record<string, unknown>;
  exito: boolean;
  statusCode?: number;
  errorCode?: string;
  sentAt: string;
}
