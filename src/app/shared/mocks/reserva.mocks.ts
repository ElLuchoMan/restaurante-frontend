import { estadoReserva } from '../constants';
import { ApiResponse } from '../models/api-response.model';
import { ReservaCreate, ReservaPopulada, RestauranteRef } from '../models/reserva.model';
import { ReservaContacto } from '../models/reserva-contacto.model';

// Los mocks reproducen la forma real del backend: `contactoId` y `restauranteId` llegan como
// objetos embebidos y las fechas de la respuesta usan formato DD-MM-YYYY.
const restaurante: RestauranteRef = {
  restauranteId: 1,
  nombreRestaurante: 'Restaurante',
  horaApertura: '10:00:00',
};

const contactoCliente: ReservaContacto = {
  contactoId: 1,
  nombreCompleto: 'Carlos Perez',
  telefono: '3216549870',
  documentoCliente: { documentoCliente: 1015466495 },
};

const contactoInvitado: ReservaContacto = {
  contactoId: 2,
  nombreCompleto: 'Edwin Torres',
  telefono: '3131234567',
  documentoContacto: 1000000542,
};

export const mockReserva: ReservaPopulada = {
  reservaId: 1,
  contactoId: contactoCliente,
  restauranteId: restaurante,
  fechaReserva: '01-01-2025',
  horaReserva: '18:00:00',
  personas: 4,
  estadoReserva: estadoReserva.PENDIENTE,
  createdAt: '01-01-2025 10:00:00',
  createdBy: 'testUser',
  indicaciones: 'Ninguna',
  nombreCompleto: 'Carlos Perez',
  telefono: '3216549870',
  documentoCliente: 1015466495,
  updatedAt: '01-01-2025 11:00:00',
  updatedBy: 'testUser',
};

export const mockReservaResponse: ApiResponse<ReservaPopulada> = {
  code: 200,
  message: 'Reserva creada exitosamente',
  data: mockReserva,
};

export const mockReservasDelDiaResponse: ApiResponse<ReservaPopulada[]> = {
  code: 200,
  message: 'Reservas obtenidas exitosamente',
  data: [
    {
      reservaId: 8,
      contactoId: contactoCliente,
      restauranteId: restaurante,
      fechaReserva: '06-02-2025',
      horaReserva: '21:18:00',
      personas: 4,
      estadoReserva: estadoReserva.CUMPLIDA,
      createdAt: '06-02-2025 15:12:42',
      updatedAt: '06-02-2025 15:50:48',
      createdBy: 'Administrador - Bryan Luis',
      updatedBy: 'Administrador - Bryan Luis',
      indicaciones: 'Esto es una prueba para ver la visualización del componente',
      nombreCompleto: 'Carlos Perez',
      telefono: '3216549870',
      documentoCliente: 1015466495,
    },
    {
      reservaId: 9,
      contactoId: contactoInvitado,
      restauranteId: restaurante,
      fechaReserva: '06-02-2025',
      horaReserva: '19:41:00',
      personas: 2,
      estadoReserva: estadoReserva.CANCELADA,
      createdAt: '06-02-2025 15:37:35',
      updatedAt: '06-02-2025 15:50:47',
      createdBy: 'Administrador - Bryan Luis',
      updatedBy: 'Administrador - Bryan Luis',
      indicaciones: 'test',
      nombreCompleto: 'Edwin Torres',
      telefono: '3131234567',
    },
  ],
};

export const mockReservaUpdateResponse: ApiResponse<ReservaPopulada> = {
  code: 200,
  message: 'Reserva actualizada con éxito',
  data: mockReserva,
};

export const mockReservasUnordered: ReservaPopulada[] = [
  {
    reservaId: 1,
    contactoId: contactoCliente,
    restauranteId: restaurante,
    fechaReserva: '01-01-2025',
    horaReserva: '14:00:00',
    personas: 4,
    estadoReserva: estadoReserva.PENDIENTE,
    createdAt: '01-01-2025 09:00:00',
    createdBy: 'testUser',
    indicaciones: 'Ninguna',
    nombreCompleto: 'Carlos Perez',
    telefono: '3216549870',
    documentoCliente: 1015466495,
    updatedAt: '01-01-2025 10:00:00',
    updatedBy: 'testUser',
  },
  {
    reservaId: 2,
    contactoId: contactoInvitado,
    restauranteId: restaurante,
    fechaReserva: '02-01-2025',
    horaReserva: '16:00:00',
    personas: 2,
    estadoReserva: estadoReserva.CONFIRMADA,
    createdAt: '02-01-2025 09:00:00',
    createdBy: 'testUser',
    indicaciones: 'Ninguna',
    nombreCompleto: 'Edwin Torres',
    telefono: '3131234567',
    updatedAt: '02-01-2025 10:00:00',
    updatedBy: 'testUser',
  },
  {
    reservaId: 3,
    contactoId: contactoCliente,
    restauranteId: restaurante,
    fechaReserva: '01-01-2025',
    horaReserva: '18:00:00',
    personas: 3,
    estadoReserva: estadoReserva.CANCELADA,
    createdAt: '01-01-2025 12:00:00',
    createdBy: 'testUser',
    indicaciones: 'Ninguna',
    nombreCompleto: 'Carlos Perez',
    telefono: '3216549870',
    updatedAt: '01-01-2025 13:00:00',
    updatedBy: 'testUser',
  },
];

// Body de creación: el backend resuelve el contacto desde documentoCliente/documentoContacto
// (no acepta contactoId).
export const mockReservaBody: ReservaCreate = {
  documentoCliente: 1015466495,
  restauranteId: 1,
  fechaReserva: '2025-02-06',
  horaReserva: '10:00:00',
  personas: 3,
  estadoReserva: estadoReserva.PENDIENTE,
  indicaciones: 'Reserva de prueba',
  createdBy: 'Administrador - Bryan Luis',
};
