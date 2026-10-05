import { ApiResponse } from '../models/api-response.model';
import { Trabajador } from '../models/trabajador.model';
import { FormatDatePipe } from '../pipes/format-date.pipe';

const formatDatePipe = new FormatDatePipe();
const fechaActual = formatDatePipe.transform(new Date());

export const mockTrabajadorResponse: ApiResponse<Trabajador> = {
  code: 200,
  message: 'Trabajador encontrado',
  data: {
    fechaNacimiento: '1990-01-01',
    fechaIngreso: fechaActual,
    documentoTrabajador: 1015466494,
    nombre: 'Bryan',
    apellido: 'Luis',
    sueldo: 1000000,
    telefono: '3042449339',
    nuevo: true,
    rol: 'Administrador',
    password: '',
    horario: '08:00 - 20:00',
    restauranteId: 1,
  },
};

export const mockTrabajadorBody: Trabajador = {
  fechaNacimiento: '1990-01-01',
  fechaIngreso: fechaActual,
  documentoTrabajador: 1015466494,
  nombre: 'Bryan',
  apellido: 'Luis',
  sueldo: 1000000,
  telefono: '3042449339',
  nuevo: true,
  rol: 'Administrador',
  password: '12345',
  horario: '08:00 - 20:00',
  restauranteId: 1,
};

export const mockTrabajadorRegisterResponse: ApiResponse<Trabajador> = {
  code: 201,
  message: 'Trabajador registrado con éxito',
  data: {
    fechaNacimiento: '1990-01-01',
    fechaIngreso: fechaActual,
    documentoTrabajador: 1015466494,
    nombre: 'Bryan',
    apellido: 'Luis',
    sueldo: 1000000,
    telefono: '3042449339',
    nuevo: true,
    rol: 'Administrador',
    password: '',
    horario: '08:00 - 20:00',
    restauranteId: 1,
  },
};

export const mockTrabajadorDeleteResponse: ApiResponse<unknown> = {
  code: 200,
  message: 'Trabajador eliminado',
  data: {},
};
