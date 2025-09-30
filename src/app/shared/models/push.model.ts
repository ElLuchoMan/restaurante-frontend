export type PlataformaNotificacion = 'WEB' | 'ANDROID' | 'IOS';
export type ProveedorPush = 'WEB_PUSH' | 'FCM';
export type TipoRemitente = 'TRABAJADOR' | 'SISTEMA';
export type TipoDestinatario = 'TODOS' | 'CLIENTE' | 'TRABAJADOR' | 'TOPIC';

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

export interface PushParams {
  limit?: number;
  offset?: number;
  plataforma?: PlataformaNotificacion;
  enabled?: boolean;
  cliente_id?: number;
  trabajador_id?: number;
}
