import { ApiResponse } from '../models/api-response.model';
import { Cliente } from '../models/cliente.model';

export const mockResponseCliente: ApiResponse<Cliente> = {
    code: 200,
    message: "Cliente encontrado",
    data: {
        documentoCliente: 1015466495,
        nombre: "Carlos",
        apellido: "Perez",
        direccion: "Carrera 50 #20-30",
        telefono: "3216549870",
        observaciones: "Cliente frecuente",
        password: "12345",
    }
};

export const mockCliente: Cliente = {
    documentoCliente: 1015466495,
    nombre: "Carlos",
    apellido: "Perez",
    direccion: "Carrera 50 #20-30",
    telefono: "3216549870",
    observaciones: "Cliente frecuente",
    password: "12345"
}

export const mockClienteRegisterResponse: ApiResponse<Cliente> = {
    code: 201,
    message: "Cliente registrado con éxito",
    data: {
        documentoCliente: 1015466495,
        nombre: "Carlos",
        apellido: "Perez",
        direccion: "Carrera 50 #20-30",
        telefono: "3216549870",
        observaciones: "Cliente frecuente",
        password: "12345"
    }
}