import { AuthGuard } from '../../core/guards/auth.guard';
import { RoleGuard } from '../../core/guards/role.guard';
import { RegisterComponent } from '../auth/register/register.component';
import { adminRoutes } from './admin.routes';
import { CrearProductoComponent } from './productos/crear-producto/crear-producto.component';
import { ProductosComponent } from './productos/menu-productos/productos.component';
import { TelemetryDashboardComponent } from './telemetry/telemetry-dashboard.component';

describe('Admin Routes', () => {
  it('should map "registro-admin" with guards', () => {
    const route = adminRoutes.find((r) => r.path === 'registro-admin');
    expect(route?.component).toBe(RegisterComponent);
    expect(route?.canActivate).toEqual([AuthGuard, RoleGuard]);
    expect(route?.data).toEqual({ roles: ['Administrador'] });
  });

  it('should map "productos" with guards', () => {
    const route = adminRoutes.find((r) => r.path === 'productos');
    expect(route?.component).toBe(ProductosComponent);
    expect(route?.canActivate).toEqual([AuthGuard, RoleGuard]);
    expect(route?.data).toEqual({ roles: ['Administrador'] });
  });

  it('should map "productos/crear" to CrearProductoComponent', () => {
    const route = adminRoutes.find((r) => r.path === 'productos/crear');
    expect(route?.component).toBe(CrearProductoComponent);
    expect(route?.canActivate).toEqual([AuthGuard, RoleGuard]);
  });

  it('should map "productos/editar/:id" to CrearProductoComponent', () => {
    const route = adminRoutes.find((r) => r.path === 'productos/editar/:id');
    expect(route?.component).toBe(CrearProductoComponent);
    expect(route?.canActivate).toEqual([AuthGuard, RoleGuard]);
  });

  it('should map "telemetria" with guards and admin role', () => {
    const route = adminRoutes.find((r) => r.path === 'telemetria');
    expect(route?.component).toBe(TelemetryDashboardComponent);
    expect(route?.canActivate).toEqual([AuthGuard, RoleGuard]);
    expect(route?.data).toEqual({ roles: ['Administrador'] });
  });
});
