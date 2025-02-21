export interface Trabajador {
    documentoTrabajador: number;
    nombre: string;
    apellido: string;
    fechaIngreso: string;
    fechaNacimiento: string;
    fechaRetiro?: Date;
    horario: string;
    nuevo: boolean;
    password: string;
    restauranteId: number;
    rol: string;
    sueldo: number;
    telefono: string;
    trabajadorNombre?: string;
}