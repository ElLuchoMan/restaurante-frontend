import { estadoReserva } from '../constants';
import { ApiResponse } from '../models/api-response.model';
import { ReservaBase, ReservaPopulada, ReservaCreate } from '../models/reserva.model';

export const mockReserva: ReservaPopulada = {
  reservaId: 1,
  contactoId: 1,
  restauranteId: 1,
  fechaReserva: '2025-01-01',
  horaReserva: '18:00:00',
  personas: 4,
  estadoReserva: estadoReserva.PENDIENTE,
  createdAt: '2025-01-01 10:00:00',
  createdBy: 'testUser',
  indicaciones: 'Ninguna',
  nombreCompleto: 'Carlos Perez',
  telefono: '3216549870',
  documentoCliente: 1015466495,
  updatedAt: '2025-01-01 11:00:00',
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
      contactoId: 1,
      restauranteId: 1,
      fechaReserva: '2025-02-06',
      horaReserva: '21:18:00',
      personas: 4,
      estadoReserva: estadoReserva.CUMPLIDA,
      createdAt: '2025-02-06 15:12:42',
      updatedAt: '2025-02-06 15:50:48',
      createdBy: 'Administrador - Bryan Luis',
      updatedBy: 'Administrador - Bryan Luis',
      indicaciones: 'Esto es una prueba para ver la visualización del componente',
      nombreCompleto: 'Carlos Perez',
      telefono: '3216549870',
      documentoCliente: 1015466495,
    },
    {
      reservaId: 9,
      contactoId: 2,
      restauranteId: 1,
      fechaReserva: '2025-02-06',
      horaReserva: '19:41:00',
      personas: 2,
      estadoReserva: estadoReserva.CANCELADA,
      createdAt: '2025-02-06 15:37:35',
      updatedAt: '2025-02-06 15:50:47',
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
    contactoId: 1,
    restauranteId: 1,
    fechaReserva: '2025-01-01',
    horaReserva: '14:00:00',
    personas: 4,
    estadoReserva: estadoReserva.PENDIENTE,
    createdAt: '2025-01-01 09:00:00',
    createdBy: 'testUser',
    indicaciones: 'Ninguna',
    nombreCompleto: 'Carlos Perez',
    telefono: '3216549870',
    documentoCliente: 1015466495,
    updatedAt: '2025-01-01 10:00:00',
    updatedBy: 'testUser',
  },
  {
    reservaId: 2,
    contactoId: 2,
    restauranteId: 1,
    fechaReserva: '2025-01-02',
    horaReserva: '16:00:00',
    personas: 2,
    estadoReserva: estadoReserva.CONFIRMADA,
    createdAt: '2025-01-02 09:00:00',
    createdBy: 'testUser',
    indicaciones: 'Ninguna',
    nombreCompleto: 'Edwin Torres',
    telefono: '3131234567',
    updatedAt: '2025-01-02 10:00:00',
    updatedBy: 'testUser',
  },
  {
    reservaId: 3,
    contactoId: 1,
    restauranteId: 1,
    fechaReserva: '2025-01-01',
    horaReserva: '18:00:00',
    personas: 3,
    estadoReserva: estadoReserva.CANCELADA,
    createdAt: '2025-01-01 12:00:00',
    createdBy: 'testUser',
    indicaciones: 'Ninguna',
    nombreCompleto: 'Carlos Perez',
    telefono: '3216549870',
    updatedAt: '2025-01-01 13:00:00',
    updatedBy: 'testUser',
  },
];

// Request sin PII: usa contactoId/restauranteId válidos y elimina PII del body
export const mockReservaBody: ReservaCreate = {
  contactoId: 1,
  restauranteId: 1,
  fechaReserva: '2025-02-06',
  horaReserva: '10:00:00',
  personas: 3,
  estadoReserva: estadoReserva.PENDIENTE,
  indicaciones: 'Reserva de prueba',
  createdBy: 'Administrador - Bryan Luis',
};
