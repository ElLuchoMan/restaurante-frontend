import { AuthGuard } from '../../core/guards/auth.guard';
import { RoleGuard } from '../../core/guards/role.guard';
import { CarritoComponent } from './carrito/carrito.component';
import { clientRoutes } from './client.routes';
import { MisPedidosComponent } from './mis-pedidos/mis-pedidos.component';
import { PedidoComponent } from './pedido/pedido.component';
import { PerfilComponent } from './perfil/perfil.component';

describe('Client Routes', () => {
  it('should map carrito-cliente with guards', () => {
    const route = clientRoutes.find((r) => r.path === 'carrito-cliente');
    expect(route?.component).toBe(CarritoComponent);
    expect(route?.canActivate).toEqual([AuthGuard, RoleGuard]);
    expect(route?.data).toEqual({ roles: ['Cliente'] });
  });

  it('should map mis-pedidos with guards', () => {
    const route = clientRoutes.find((r) => r.path === 'mis-pedidos');
    expect(route?.component).toBe(MisPedidosComponent);
    expect(route?.canActivate).toEqual([AuthGuard, RoleGuard]);
    expect(route?.data).toEqual({ roles: ['Cliente'] });
  });

  it('should map pedido/:id with guards', () => {
    const route = clientRoutes.find((r) => r.path === 'pedido/:id');
    expect(route?.component).toBe(PedidoComponent);
    expect(route?.canActivate).toEqual([AuthGuard, RoleGuard]);
    expect(route?.data).toEqual({ roles: ['Cliente'] });
  });

  it('should map perfil with guards', () => {
    const route = clientRoutes.find((r) => r.path === 'perfil');
    expect(route?.component).toBe(PerfilComponent);
    expect(route?.canActivate).toEqual([AuthGuard, RoleGuard]);
    expect(route?.data).toEqual({ roles: ['Cliente'] });
  });
});
