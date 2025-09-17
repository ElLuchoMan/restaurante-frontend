import {
  mockCambioHorarioAbiertoResponse,
  mockCambioHorarioBody,
  mockCambioHorarioResponse,
} from './cambios-horario.mock';
import { mockClienteBody, mockClienteRegisterResponse, mockResponseCliente } from './cliente.mock';
import { mockDomicilioBody, mockDomicilioRespone, mockDomiciliosRespone } from './domicilio.mock';
import { mockHttpError400, mockHttpError500 } from './error.mock';
import { mockLogin, mockLoginResponse } from './login.mock';
import {
  mockMetodoPagoBody,
  mockMetodoPagoRespone,
  mockMetodosPagoRespone,
} from './metodo-pago.mock';
import { mockNominaTrabajadorMes, mockNominaTrabajadorResponse } from './nomina-trabajador.mock';
import {
  mockNominaBody,
  mockNominaFecha,
  mockNominaPagaResponse,
  mockNominaResponse,
} from './nomina.mock';
import { mockPagoBody, mockPagoResponse, mockPagosResponse } from './pago.mock';
import { mockPedidoBody, mockPedidoDetalle, mockPedidosResponse } from './pedido.mock';
import { mockProductoPedidoResponse } from './producto-pedido.mock';
import {
  mockProductoResponse,
  mockProductosResponse,
  mockProductosSinImagenResponse,
} from './producto.mock';
import {
  mockReserva,
  mockReservaBody,
  mockReservaResponse,
  mockReservasDelDiaResponse,
  mockReservasUnordered,
  mockReservaUpdateResponse,
} from './reserva.mocks';
import { mockRestauranteResponse, mockRestaurantesResponse } from './restaurante.mock';
import {
  mockTrabajadorBody,
  mockTrabajadorRegisterResponse,
  mockTrabajadorResponse,
} from './trabajador.mock';

// simple tests to ensure mocks are loaded correctly

describe('shared mocks', () => {
  it('cliente mocks', () => {
    expect(mockResponseCliente.data.nombre).toBe('Carlos');
    expect(mockClienteBody.telefono).toBe('3216549870');
    expect(mockClienteRegisterResponse.code).toBe(201);
  });

  it('domicilio mocks', () => {
    expect(mockDomicilioRespone.data.telefono).toBe('3042449339');
    expect(mockDomiciliosRespone.data).toHaveLength(2);
    expect(mockDomicilioBody.direccion).toBe('Carrera 45 #10-20');
  });

  it('error mocks', () => {
    expect(mockHttpError500.status).toBe(500);
    expect(mockHttpError400.status).toBe(400);
  });

  it('login mocks', () => {
    expect(mockLogin.documento).toBe('12345');
    expect(mockLoginResponse.data.token).toBe('testToken');
  });

  it('metodo pago mocks', () => {
    expect(mockMetodoPagoRespone.data.detalle).toBe('3042449339');
    expect(mockMetodosPagoRespone.data).toHaveLength(3);
    expect(mockMetodoPagoBody.tipo).toBe('Nequi');
  });

  it('nomina trabajador mocks', () => {
    expect(mockNominaTrabajadorResponse.data).toHaveLength(2);
    expect(mockNominaTrabajadorMes.data[0].sueldoBase).toBe(2000000);
  });

  it('nomina mocks', () => {
    expect(mockNominaResponse.data[0].monto).toBe(5500000);
    expect(mockNominaFecha.data[0].estadoNomina).toBeDefined();
    expect(mockNominaBody.estadoNomina).toBeDefined();
    expect(mockNominaPagaResponse.data.estadoNomina).toBeDefined();
  });

  // pedido-cliente eliminado: ya no se requiere mock

  it('pedido mocks', () => {
    expect(mockPedidosResponse.data).toHaveLength(3);
    expect(mockPedidoBody.delivery).toBe(true);
    expect(mockPedidoDetalle.data.metodoPago).toBe('Nequi');
  });

  it('producto mocks', () => {
    expect(mockProductoResponse.data.nombre).toBe('Coca Cola Zero 500ml');
    expect(mockProductosResponse.data[0].nombre).toBe('Pepsi 500ml');
    expect(mockProductosSinImagenResponse.data).toHaveLength(3);
  });

  it('producto pedido mocks', () => {
    expect(mockProductoPedidoResponse.data.detalles[0].nombre).toContain('Coca Cola');
  });

  it('reserva mocks', () => {
    expect(mockReserva.reservaId).toBe(1);
    expect(mockReservaResponse.data).toEqual(mockReserva);
    expect(mockReservasDelDiaResponse.data).toHaveLength(2);
    expect(mockReservaUpdateResponse.data).toEqual(mockReserva);
    expect(mockReservasUnordered).toHaveLength(3);
    expect(mockReservaBody.contactoId).toBe(1);
  });

  it('restaurante mocks', () => {
    expect(mockRestaurantesResponse.data[0].nombreRestaurante).toBe('La cocina de María');
    expect(mockRestauranteResponse.data.restauranteId).toBe(1);
    expect(mockCambioHorarioResponse.data.cambioHorarioId).toBe(1);
    expect(mockCambioHorarioAbiertoResponse.data.abierto).toBe(false);
    expect(mockCambioHorarioBody.abierto).toBe(false);
  });

  it('trabajador mocks', () => {
    expect(mockTrabajadorResponse.data.nombre).toBe('Bryan');
    expect(mockTrabajadorBody.nuevo).toBe(true);
    expect(mockTrabajadorRegisterResponse.data.apellido).toBe('Luis');
  });
});
