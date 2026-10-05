import { NotificationItem } from '../utils/notification-center.store';

export const mockNotificationReserva: NotificationItem = {
  id: 1,
  title: 'Reserva confirmada',
  body: 'Tu reserva para 4 personas ha sido confirmada',
  data: {
    tipo: 'RESERVA',
    url: '/cliente/reservas',
    reservaId: 123,
  },
  createdAt: '2025-01-15T10:30:00.000Z',
};

export const mockNotificationPedido: NotificationItem = {
  id: 2,
  title: 'Pedido en camino',
  body: 'Tu pedido #456 está en camino',
  data: {
    tipo: 'PEDIDO',
    url: '/cliente/mis-pedidos',
    pedidoId: 456,
  },
  createdAt: '2025-01-15T11:00:00.000Z',
};

export const mockNotificationPromocion: NotificationItem = {
  id: 3,
  title: '¡Promoción especial!',
  body: '20% de descuento en pizzas grandes',
  data: {
    tipo: 'PROMOCION',
    url: '/menu',
    promoId: 789,
  },
  createdAt: '2025-01-15T09:00:00.000Z',
};

export const mockNotificationCalificacion: NotificationItem = {
  id: 4,
  title: 'Califica tu pedido',
  body: '¿Cómo estuvo tu experiencia?',
  data: {
    tipo: 'CALIFICACION',
    url: '/cliente/calificar/456',
    pedidoId: 456,
  },
  createdAt: '2025-01-15T12:00:00.000Z',
};

export const mockNotificationDefault: NotificationItem = {
  id: 5,
  title: 'Notificación general',
  body: 'Información importante del restaurante',
  data: {
    tipo: 'GENERAL',
    url: '/home',
  },
  createdAt: '2025-01-15T08:00:00.000Z',
};

export const mockNotificationWithoutUrl: NotificationItem = {
  id: 6,
  title: 'Notificación sin URL',
  body: 'Esta notificación no tiene enlace',
  data: {
    tipo: 'INFO',
  },
  createdAt: '2025-01-15T13:00:00.000Z',
};

export const mockNotifications: NotificationItem[] = [
  mockNotificationCalificacion,
  mockNotificationPedido,
  mockNotificationReserva,
  mockNotificationPromocion,
  mockNotificationDefault,
  mockNotificationWithoutUrl,
];
