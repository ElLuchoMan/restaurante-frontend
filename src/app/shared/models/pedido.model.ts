export interface Pedido {
    fechaPedido: string;
    createdAt: string;
    updatedAt?: string;
    pedidoId?: number;
    horaPedido: string;
    delivery: boolean;
    estadoPedido: string;
    domicilioId?: number;
    pagoId: number;
    restauranteId: number;
    updatedBy?: string;
}

export interface PedidoDetalle {
    PK_ID_PEDIDO?: number;
    FECHA: string;
    HORA: string;
    delivery: boolean;
    ESTADO_PEDIDO: string;
    METODO_PAGO: string;
    PRODUCTOS: string;
}
