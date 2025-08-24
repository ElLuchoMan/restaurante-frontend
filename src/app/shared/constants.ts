export enum Roles {
    ADMINISTRADOR = 'Administrador',
    CLIENTE = 'Cliente',
    MESERO = 'Mesero',
    DOMICILIARIO = 'Domiciliario',
    COCINERO = 'Cocinero',
    GENERAL = 'General'
}
export enum estadoReserva {
    PENDIENTE = 'PENDIENTE',
    CONFIRMADA = 'CONFIRMADA',
    CANCELADA = 'CANCELADA',
    CUMPLIDA = 'CUMPLIDA'
}

export enum estadoNomina {
    PAGO = 'PAGO',
    NO_PAGO = 'NO PAGO',
}
export enum estadoPago {
    PAGADO = 'PAGADO',
    PENDIENTE = 'PENDIENTE',
    NO_PAGADO = 'NO PAGO',
}
export enum estadoProducto {
    DISPONIBLE = 'DISPONIBLE',
    NO_DISPONIBLE = 'NO DISPONIBLE',
}
export const metodoPago = {
    Nequi: { metodoPagoId: 1, tipo: 'Nequi', detallle: '3042449339' },
    Daviplata: { metodoPagoId: 2, tipo: 'Daviplata', detallle: '3042449339' },
    Efectivo: { metodoPagoId: 3, tipo: 'Efectivo', detallle: '3042449339' },
} as const;
