import { estadoReserva } from '../constants';
import { ApiResponse } from '../models/api-response.model';
import { Reserva } from '../models/reserva.model';

export const mockReserva: Reserva = {
    reservaId: 1,
    documentoCliente: 123456,
    telefono: '123456789',
    fechaReserva: '01-01-2025',
    horaReserva: '18:00',
    personas: 4,
    estadoReserva: estadoReserva.PENDIENTE,
    createdAt: new Date().toISOString(),
    createdBy: 'testUser',
    indicaciones: 'Ninguna',
    nombreCompleto: 'John Doe',
    updatedAt: new Date().toISOString(),
    updatedBy: 'testUser'
};

export const mockReservaResponse: ApiResponse<Reserva> = {
    code: 200,
    message: 'Reserva creada exitosamente',
    data: mockReserva
};

export const mockReservasDelDiaResponse: ApiResponse<Reserva[]> = {
    code: 200,
    message: "Reservas obtenidas exitosamente",
    data: [
        {
            reservaId: 8,
            documentoCliente: 1015466494,
            telefono: "2408689",
            fechaReserva: "06-02-2025",
            horaReserva: "21:18:00",
            personas: 4,
            estadoReserva: estadoReserva.CUMPLIDA,
            createdAt: "2025-02-06T15:12:42.777813-05:00",
            updatedAt: "2025-02-06T15:50:48.809162-05:00",
            createdBy: "Administrador - Bryan Luis",
            updatedBy: "Administrador - Bryan Luis",
            indicaciones: "Esto es una prueba para ver la visualización del componente",
            nombreCompleto: "Benito Camilo Rico"
        },
        {
            reservaId: 9,
            documentoCliente: 1015466494,
            telefono: "3118276767",
            fechaReserva: "06-02-2025",
            horaReserva: "19:41:00",
            personas: 2,
            estadoReserva: estadoReserva.CANCELADA,
            createdAt: "2025-02-06T15:37:35.089062-05:00",
            updatedAt: "2025-02-06T15:50:47.870498-05:00",
            createdBy: "Administrador - Bryan Luis",
            updatedBy: "Administrador - Bryan Luis",
            indicaciones: "test",
            nombreCompleto: "asdasd"
        }
    ]
};

export const mockReservaUpdateResponse: ApiResponse<Reserva> = {
    code: 200,
    message: 'Reserva actualizada con éxito',
    data: mockReserva
};

export const mockReservasUnordered: Reserva[] = [
    {
        reservaId: 1,
        documentoCliente: 123456,
        telefono: '123456789',
        fechaReserva: '01-01-2025',
        horaReserva: '14:00',
        personas: 4,
        estadoReserva: estadoReserva.PENDIENTE,
        createdAt: new Date().toISOString(),
        createdBy: 'testUser',
        indicaciones: 'Ninguna',
        nombreCompleto: 'John Doe',
        updatedAt: new Date().toISOString(),
        updatedBy: 'testUser'
    },
    {
        reservaId: 2,
        documentoCliente: 123456,
        telefono: '123456789',
        fechaReserva: '02-01-2025',
        horaReserva: '16:00',
        personas: 2,
        estadoReserva: estadoReserva.CONFIRMADA,
        createdAt: new Date().toISOString(),
        createdBy: 'testUser',
        indicaciones: 'Ninguna',
        nombreCompleto: 'John Doe',
        updatedAt: new Date().toISOString(),
        updatedBy: 'testUser'
    },
    {
        reservaId: 3,
        documentoCliente: 123456,
        telefono: '123456789',
        fechaReserva: '01-01-2025',
        horaReserva: '18:00',
        personas: 3,
        estadoReserva: estadoReserva.CANCELADA,
        createdAt: new Date().toISOString(),
        createdBy: 'testUser',
        indicaciones: 'Ninguna',
        nombreCompleto: 'John Doe',
        updatedAt: new Date().toISOString(),
        updatedBy: 'testUser'
    }
];

export const mockReservaBody: Reserva = {
    documentoCliente: 1015466494,
    telefono: '3042449339',
    fechaReserva: '2025-02-06',
    horaReserva: '10:00:00',
    personas: 3,
    estadoReserva: estadoReserva.PENDIENTE,
    createdAt: '2025-02-06T12:00:00.000Z',
    createdBy: 'Administrador - Bryan Luis',
    indicaciones: 'Reserva de prueba',
    nombreCompleto: 'Bryan Luis',
    updatedAt: '2025-02-06T12:00:00.000Z',
    updatedBy: 'Administrador - Bryan Luis'
};
