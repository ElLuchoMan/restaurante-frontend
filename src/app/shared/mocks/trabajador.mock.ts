import { RolTrabajador } from '../constants';
import { ApiResponse } from '../models/api-response.model';
import { Trabajador, TrabajadorCreate, TrabajadorUpdate } from '../models/trabajador.model';
import { fechaYYYYMMDD_Bogota } from '../utils/dateHelper';

// Las respuestas del back traen las fechas en DD-MM-YYYY y la entrada va en YYYY-MM-DD
const fechaActual = fechaYYYYMMDD_Bogota();
const fechaActualResponse = fechaActual.split('-').reverse().join('-');

export const mockTrabajadorResponse: ApiResponse<Trabajador> = {
  code: 200,
  message: 'Trabajador encontrado',
  data: {
    fechaNacimiento: '01-01-1990',
    fechaIngreso: fechaActualResponse,
    documentoTrabajador: 1015466494,
    nombre: 'Bryan',
    apellido: 'Luis',
    sueldo: 1000000,
    telefono: '3042449339',
    nuevo: true,
    rol: RolTrabajador.RolAdministrador,
    password: '',
    restauranteId: { restauranteId: 1 },
  },
};

export const mockTrabajadorBody: TrabajadorCreate = {
  fechaNacimiento: '1990-01-01',
  fechaIngreso: fechaActual,
  documentoTrabajador: 1015466494,
  nombre: 'Bryan',
  apellido: 'Luis',
  sueldo: 1000000,
  telefono: '3042449339',
  rol: RolTrabajador.RolAdministrador,
  password: '12345',
  restauranteId: 1,
};

export const mockTrabajadorUpdateBody: TrabajadorUpdate = {
  sueldo: 1200000,
  nuevo: false,
};

export const mockTrabajadorRegisterResponse: ApiResponse<Trabajador> = {
  code: 201,
  message: 'Trabajador creado correctamente',
  data: {
    fechaNacimiento: '01-01-1990',
    fechaIngreso: fechaActualResponse,
    documentoTrabajador: 1015466494,
    nombre: 'Bryan',
    apellido: 'Luis',
    sueldo: 1000000,
    telefono: '3042449339',
    nuevo: false,
    rol: RolTrabajador.RolAdministrador,
    password: '',
    restauranteId: { restauranteId: 1 },
  },
};

export const mockTrabajadorDeleteResponse: ApiResponse<Trabajador> = {
  code: 200,
  message: 'Fecha de retiro del trabajador actualizada correctamente',
  data: { ...mockTrabajadorResponse.data, fechaRetiro: fechaActualResponse },
};
