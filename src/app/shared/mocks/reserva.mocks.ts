import { estadoReserva } from '../constants';
import { ApiResponse } from '../models/api-response.model';
import { Reserva } from '../models/reserva.model';

export const mockReservaResponse: ApiResponse<Reserva> = {
    code: 200,
    message: 'Reserva creada exitosamente',
    data: {
        createdAt: '2025-02-06T12:00:00.000Z',
        updatedAt: '2025-02-06T12:00:00.000Z',
        createdBy: 'Administrador - Bryan Luis',
        updatedBy: 'Administrador - Bryan Luis',
        documentoCliente: 1015466494,
        estadoReserva: estadoReserva.PENDIENTE,
        fechaReserva: '2025-02-06',
        horaReserva: '10:00:00',
        indicaciones: 'Reserva de prueba',
        nombreCompleto: 'Bryan Luis',
        personas: 3,
        telefono: '3042449339'
    }
};

export const mockReservasDelDiaResponse: ApiResponse<Reserva[]> = {
    "code": 200,
    "message": "Reservas obtenidas exitosamente",
    "data": [
        {
            fechaReserva: "06-02-2025",
            reservaId: 8,
            horaReserva: "21:18:00",
            personas: 4,
            estadoReserva: estadoReserva.CUMPLIDA,
            indicaciones: "Esto es una prueba para ver la visualización del componente",
            createdAt: "2025-02-06T15:12:42.777813-05:00",
            updatedAt: "2025-02-06T15:50:48.809162-05:00",
            createdBy: "Administrador - Bryan Luis",
            updatedBy: "Administrador - Bryan Luis",
            nombreCompleto: "Benito Camilo Rico",
            telefono: "2408689",
            documentoCliente: 1015466494
        },
        {
            reservaId: 9,
            fechaReserva: "06-02-2025",
            horaReserva: "19:41:00",
            personas: 2,
            estadoReserva: estadoReserva.CANCELADA,
            indicaciones: "test",
            createdAt: "2025-02-06T15:37:35.089062-05:00",
            updatedAt: "2025-02-06T15:50:47.870498-05:00",
            createdBy: "Administrador - Bryan Luis",
            updatedBy: "Administrador - Bryan Luis",
            nombreCompleto: "asdasd",
            telefono: "3118276767",
            documentoCliente: 1015466494
        }
    ]
};

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
