import { RolTrabajador } from '../constants';
import { HorarioTrabajador } from './horario-trabajador.model';

/**
 * Trabajador tal como lo devuelve el back. Fechas en DD-MM-YYYY. `password` llega siempre
 * vacío. OJO: el back serializa `restauranteId` como objeto Restaurante (no como número)
 * y lo omite si el trabajador no tiene restaurante.
 */
export interface Trabajador {
  documentoTrabajador: number;
  nombre: string;
  apellido: string;
  sueldo: number;
  telefono?: string;
  fechaNacimiento?: string;
  nuevo: boolean;
  rol: RolTrabajador;
  fechaIngreso: string;
  fechaRetiro?: string;
  password: string;
  horarios?: HorarioTrabajador[];
  restauranteId?: { restauranteId: number; nombreRestaurante?: string; horaApertura?: string };
}

/**
 * Cuerpo de POST /trabajadores. Fechas como YYYY-MM-DD. El back ignora `nuevo`
 * (siempre se crea con nuevo=false).
 */
export interface TrabajadorCreate {
  documentoTrabajador: number;
  nombre: string;
  apellido: string;
  rol: RolTrabajador;
  fechaIngreso: string;
  sueldo: number;
  password: string;
  telefono?: string;
  restauranteId?: number;
  fechaNacimiento?: string;
}

/**
 * Cuerpo de PUT /trabajadores?id= (todo opcional). El back ignora strings vacíos, por lo
 * que no permite limpiar campos; fechas como YYYY-MM-DD.
 */
export type TrabajadorUpdate = Partial<
  Omit<TrabajadorCreate, 'documentoTrabajador' | 'restauranteId'> & {
    nuevo: boolean;
    fechaRetiro: string;
  }
>;
