import { RolTrabajador } from '../constants';
import { HorarioTrabajador } from './horario-trabajador.model';

/**
 * Trabajador tal como lo devuelve el back (solo accesible para un Administrador). Fechas en
 * DD-MM-YYYY. La contraseña nunca viaja en las respuestas. `restauranteId` sale como objeto
 * `{ restauranteId }` y se omite si no tiene restaurante; `horarios` es `[]` si no hay.
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
  horarios: HorarioTrabajador[];
  restauranteId?: { restauranteId: number };
}

/**
 * Cuerpo de POST /trabajadores (solo Administrador). Fechas como YYYY-MM-DD. `nuevo` es
 * opcional (false si se omite). 409 si el documento o el teléfono ya existen.
 */
export interface TrabajadorCreate {
  documentoTrabajador: number;
  nombre: string;
  apellido: string;
  rol: RolTrabajador;
  fechaIngreso: string;
  sueldo: number;
  password: string;
  nuevo?: boolean;
  telefono?: string;
  restauranteId?: number;
  fechaNacimiento?: string;
}

/**
 * Cuerpo de PUT /trabajadores?id= (merge): los campos ausentes se conservan. Solo
 * `telefono`, `fechaNacimiento`, `fechaRetiro` y `restauranteId` admiten `null` (los limpia);
 * null en cualquier otro campo, o un string vacío en nombre/apellido/password, responde 400.
 * Fechas como YYYY-MM-DD.
 */
export type TrabajadorUpdate = Partial<
  Omit<TrabajadorCreate, 'documentoTrabajador' | 'telefono' | 'fechaNacimiento' | 'restauranteId'>
> & {
  fechaRetiro?: string | null;
  telefono?: string | null;
  fechaNacimiento?: string | null;
  restauranteId?: number | null;
};
