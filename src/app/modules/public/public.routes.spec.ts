import publicRoutes from './public.routes';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from '../auth/login/login.component';
import { RegisterComponent } from '../auth/register/register.component';
import { VerProductosComponent } from './ver-productos/ver-productos.component';
import { MenuReservasComponent } from './reservas/menu-reservas/menu-reservas.component';
import { ConsultarReservaComponent } from './reservas/consultar-reserva/consultar-reserva.component';
import { CrearReservaComponent } from './reservas/crear-reserva/crear-reserva.component';
import { ReservasDelDiaComponent } from './reservas/reservas-del-dia/reservas-del-dia.component';
import { ConsultarDomicilioComponent } from './domicilios/consultar-domicilios/consultar-domicilios.component';
import { UbicacionRestauranteComponent } from './ubicacion-restaurante/ubicacion-restaurante.component';
import { AuthGuard } from '../../core/guards/auth.guard';
import { RoleGuard } from '../../core/guards/role.guard';

describe('Public Routes', () => {
  it('should map "" to HomeComponent', () => {
    const route = publicRoutes.find(r => r.path === '');
    expect(route?.component).toBe(HomeComponent);
  });

  it('should map "home" to HomeComponent', () => {
    const route = publicRoutes.find(r => r.path === 'home');
    expect(route?.component).toBe(HomeComponent);
  });

  it('should map "login" to LoginComponent', () => {
    const route = publicRoutes.find(r => r.path === 'login');
    expect(route?.component).toBe(LoginComponent);
  });

  it('should map "registro-cliente" to RegisterComponent', () => {
    const route = publicRoutes.find(r => r.path === 'registro-cliente');
    expect(route?.component).toBe(RegisterComponent);
  });

  it('should map "menu" to VerProductosComponent with title', () => {
    const route = publicRoutes.find(r => r.path === 'menu');
    expect(route?.component).toBe(VerProductosComponent);
    expect(route?.title).toBe('Ver Productos');
  });

  it('should configure reservas child routes', () => {
    const reservas = publicRoutes.find(r => r.path === 'reservas');
    expect(reservas?.component).toBe(MenuReservasComponent);
    const consultar = reservas?.children?.find(c => c.path === 'consultar');
    expect(consultar?.component).toBe(ConsultarReservaComponent);
    expect(consultar?.canActivate).toEqual([AuthGuard, RoleGuard]);
    expect(consultar?.data).toEqual({ roles: ['Administrador', 'Cliente'] });

    const hoy = reservas?.children?.find(c => c.path === 'hoy');
    expect(hoy?.component).toBe(ReservasDelDiaComponent);
    expect(hoy?.canActivate).toEqual([AuthGuard, RoleGuard]);
    expect(hoy?.data).toEqual({ roles: ['Administrador'] });

    const crear = reservas?.children?.find(c => c.path === 'crear');
    expect(crear?.component).toBe(CrearReservaComponent);
  });

  it('should configure domicilios child route', () => {
    const dom = publicRoutes.find(r => r.path === 'domicilios');
    const consultar = dom?.children?.find(c => c.path === 'consultar');
    expect(consultar?.component).toBe(ConsultarDomicilioComponent);
    expect(consultar?.canActivate).toEqual([AuthGuard, RoleGuard]);
    expect(consultar?.data).toEqual({ roles: ['Administrador', 'Domiciliario'] });
  });

  it('should map "ubicacion" to UbicacionRestauranteComponent', () => {
    const route = publicRoutes.find(r => r.path === 'ubicacion');
    expect(route?.component).toBe(UbicacionRestauranteComponent);
  });
});
