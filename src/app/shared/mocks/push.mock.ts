import { ApiResponse } from '../models/api-response.model';
import {
  EnviarNotificacionResponse,
  PushDispositivo,
  PushPaginatedData,
} from '../models/push.model';

export const mockPushDispositivoWeb: ApiResponse<PushDispositivo> = {
  code: 200,
  message: 'Dispositivo obtenido exitosamente',
  data: {
    pushDispositivoId: 1,
    plataforma: 'WEB',
    endpoint: 'https://push.example.com/subscription/cliente_1015466495',
    p256dh: 'test_p256dh_1',
    auth: 'test_auth_1',
    fcmToken: null,
    enabled: true,
    locale: 'es-CO',
    timeZone: 'America/Bogota',
    appVersion: '1.0.0',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    subscribedTopics: ['promos', 'novedades'],
    documentoCliente: 1015466495,
    documentoTrabajador: null,
    createdAt: '01-01-2025 05:00:00',
    lastSeenAt: '15-01-2025 09:30:00',
  },
};

export const mockPushDispositivoAndroid: ApiResponse<PushDispositivo> = {
  code: 200,
  message: 'Dispositivo obtenido exitosamente',
  data: {
    pushDispositivoId: 2,
    plataforma: 'ANDROID',
    endpoint: null,
    p256dh: null,
    auth: null,
    fcmToken: 'fcm_token_trabajador_1000000000',
    enabled: true,
    locale: 'es-CO',
    timeZone: 'America/Bogota',
    appVersion: '2.1.0',
    userAgent: null,
    subscribedTopics: ['domicilios'],
    documentoCliente: null,
    documentoTrabajador: 1000000000,
    createdAt: '01-01-2025 03:00:00',
    lastSeenAt: '15-01-2025 11:45:00',
  },
};

export const mockListaDispositivos: ApiResponse<PushPaginatedData<PushDispositivo>> = {
  code: 200,
  message: 'Dispositivos obtenidos exitosamente',
  data: {
    data: [mockPushDispositivoWeb.data, mockPushDispositivoAndroid.data],
    total: 2,
    page: 1,
    pageSize: 20,
    totalPages: 1,
  },
};

export const mockEnvioNotificacionExitoso: ApiResponse<EnviarNotificacionResponse> = {
  code: 200,
  message: 'Notificación enviada exitosamente',
  data: {
    totalDispositivos: 15,
    enviosExitosos: 13,
    enviosFallidos: 2,
    detalleEnvios: [
      {
        pushDispositivoId: 1,
        plataforma: 'WEB',
        exito: true,
        statusCode: 200,
        documentoCliente: 1015466495,
      },
      {
        pushDispositivoId: 2,
        plataforma: 'ANDROID',
        exito: true,
        statusCode: 200,
        documentoTrabajador: 1000000000,
      },
      {
        pushDispositivoId: 3,
        plataforma: 'IOS',
        exito: false,
        statusCode: 410,
        errorCode: 'DEVICE_UNREGISTERED',
        documentoCliente: 1023456789,
      },
    ],
    resumenDestinatarios: {
      tipoDestinatario: 'TODOS',
      clientesNotificados: [1015466495, 1023456789, 1034567890],
      trabajadoresNotificados: [1000000000, 1087654321],
      topicsNotificados: [],
    },
  },
};
