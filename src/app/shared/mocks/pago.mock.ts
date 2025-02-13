import { estadoPago } from "../constants";
import { ApiResponse } from "../models/api-response.model";
import { Pago } from "../models/pago.model";

export const mockPagosResponse: ApiResponse<Pago[]> = {
    code: 200,
    message: 'Pago encontrado',
    data: [
        {
            fechaPago: "24-12-2024",
            updatedAt: "31-12-0000 19:03:44",
            pagoId: 1,
            horaPago: "12:05:00",
            monto: 2000,
            estadoPago: estadoPago.PAGADO,
            metodoPagoId: 1,
            updatedBy: "Administrador - Bryan Luis"
        },
        {
            fechaPago: "29-12-2024",
            updatedAt: "31-12-0000 19:03:44",
            pagoId: 2,
            horaPago: "14:15:00",
            monto: 1800,
            estadoPago: estadoPago.PENDIENTE,
            metodoPagoId: 2,
            updatedBy: "Administrador - Bryan Luis"
        }
    ]
}
export const mockPagoResponse: ApiResponse<Pago> = {
    code: 200,
    message: 'Pago creado exitosamente',
    data: {
        fechaPago: "24-12-2024",
        updatedAt: "31-12-0000 19:03:44",
        pagoId: 1,
        horaPago: "12:05:00",
        monto: 2000,
        estadoPago: estadoPago.PAGADO,
        metodoPagoId: 1,
        updatedBy: "Administrador - Bryan Luis"
    }
}
export const mockPagoBody: Pago = {
    fechaPago: "2024-12-24",
    updatedAt: "31-12-0000 19:03:44",
    horaPago: "12:05:00",
    monto: 2000,
    estadoPago: estadoPago.PAGADO,
    metodoPagoId: 1,
    updatedBy: "Administrador - Bryan Luis"
}