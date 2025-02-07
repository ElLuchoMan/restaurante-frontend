import { ApiResponse } from '../models/api-response.model';
import { Trabajador } from '../models/trabajador.model';

export const mockResponseTrabajador: ApiResponse<Trabajador> = {
    code: 200,
    message: 'Trabajador encontrado',
    data: {
        fechaNacimiento: '01-01-1990',
        fechaIngreso: '01-01-2024 00:00:00',
        documentoTrabajador: 1015466494,
        nombre: 'Bryan',
        apellido: 'Luis',
        sueldo: 1000000,
        telefono: '3042449339',
        nuevo: true,
        rol: 'Administrador',
        password: '',
        horario: '08:00 - 20:00',
        restauranteId: 1
    }
};
