import { clientRoutes } from './client.routes';
import { CarritoComponent } from './carrito/carrito.component';
import { MisPedidosComponent } from './mis-pedidos/mis-pedidos.component';
import { PerfilComponent } from './perfil/perfil.component';
import { AuthGuard } from '../../core/guards/auth.guard';
import { RoleGuard } from '../../core/guards/role.guard';

describe('Client Routes', () => {
  it('should map carrito-cliente with guards', () => {
    const route = clientRoutes.find(r => r.path === 'carrito-cliente');
    expect(route?.component).toBe(CarritoComponent);
    expect(route?.canActivate).toEqual([AuthGuard, RoleGuard]);
    expect(route?.data).toEqual({ roles: ['Cliente'] });
  });

  it('should map mis-pedidos with guards', () => {
    const route = clientRoutes.find(r => r.path === 'mis-pedidos');
    expect(route?.component).toBe(MisPedidosComponent);
    expect(route?.canActivate).toEqual([AuthGuard, RoleGuard]);
    expect(route?.data).toEqual({ roles: ['Cliente'] });
  });

  it('should map perfil with guards', () => {
    const route = clientRoutes.find(r => r.path === 'perfil');
    expect(route?.component).toBe(PerfilComponent);
    expect(route?.canActivate).toEqual([AuthGuard, RoleGuard]);
    expect(route?.data).toEqual({ roles: ['Cliente'] });
  });
});
