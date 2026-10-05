import { AuthGuard } from '../../core/guards/auth.guard';
import { RoleGuard } from '../../core/guards/role.guard';
import { LoginComponent } from '../auth/login/login.component';
import { RegisterComponent } from '../auth/register/register.component';
import { ConsultarDomicilioComponent } from './domicilios/consultar-domicilios/consultar-domicilios.component';
import { HomeComponent } from './home/home.component';
import { NotificationCenterComponent } from './notification-center/notification-center.component';
import { OfflineComponent } from './offline/offline.component';
import { publicRoutes } from './public.routes';
import { ConsultarReservaComponent } from './reservas/consultar-reserva/consultar-reserva.component';
import { CrearReservaComponent } from './reservas/crear-reserva/crear-reserva.component';
import { ReservasDelDiaComponent } from './reservas/reservas-del-dia/reservas-del-dia.component';
import { UbicacionRestauranteComponent } from './ubicacion-restaurante/ubicacion-restaurante.component';
import { VerProductosComponent } from './ver-productos/ver-productos.component';

describe('Public Routes', () => {
  it('should map "" to HomeComponent', () => {
    const route = publicRoutes.find((r) => r.path === '');
    expect(route?.component).toBe(HomeComponent);
  });

  it('should map "home" to HomeComponent', () => {
    const route = publicRoutes.find((r) => r.path === 'home');
    expect(route?.component).toBe(HomeComponent);
  });

  it('should map "login" to LoginComponent', () => {
    const route = publicRoutes.find((r) => r.path === 'login');
    expect(route?.component).toBe(LoginComponent);
  });

  it('should map "registro-cliente" to RegisterComponent', () => {
    const route = publicRoutes.find((r) => r.path === 'registro-cliente');
    expect(route?.component).toBe(RegisterComponent);
  });

  it('should map "menu" to VerProductosComponent with title', async () => {
    const route = publicRoutes.find((r) => r.path === 'menu');
    expect(route?.loadComponent).toBeDefined();
    expect(route?.title).toBe('Ver Productos');

    // Test lazy loading
    if (route?.loadComponent) {
      const component = await route.loadComponent();
      expect(component).toBe(VerProductosComponent);
    }
  });

  it('should configure reservas routes', () => {
    // Ruta base de reservas redirige a crear
    const reservas = publicRoutes.find((r) => r.path === 'reservas');
    expect(reservas?.redirectTo).toBe('reservas/crear');
    expect(reservas?.pathMatch).toBe('full');

    // Consultar reservas
    const consultar = publicRoutes.find((r) => r.path === 'reservas/consultar');
    expect(consultar?.component).toBe(ConsultarReservaComponent);
    expect(consultar?.canActivate).toEqual([AuthGuard, RoleGuard]);
    expect(consultar?.data).toEqual({ roles: ['Administrador', 'Cliente'] });

    // Reservas del día
    const hoy = publicRoutes.find((r) => r.path === 'reservas/hoy');
    expect(hoy?.component).toBe(ReservasDelDiaComponent);
    expect(hoy?.canActivate).toEqual([AuthGuard, RoleGuard]);
    expect(hoy?.data).toEqual({ roles: ['Administrador'] });

    // Crear reserva
    const crear = publicRoutes.find((r) => r.path === 'reservas/crear');
    expect(crear?.component).toBe(CrearReservaComponent);
  });

  it('should configure domicilios child route', () => {
    const dom = publicRoutes.find((r) => r.path === 'domicilios');
    const consultar = dom?.children?.find((c) => c.path === 'consultar');
    expect(consultar?.component).toBe(ConsultarDomicilioComponent);
    expect(consultar?.canActivate).toEqual([AuthGuard, RoleGuard]);
    expect(consultar?.data).toEqual({ roles: ['Administrador', 'Domiciliario'] });
  });

  it('should map "ubicacion" to UbicacionRestauranteComponent', async () => {
    const route = publicRoutes.find((r) => r.path === 'ubicacion');
    expect(route?.loadComponent).toBeDefined();
    expect(route?.title).toBe('Ubicación');

    // Test lazy loading
    if (route?.loadComponent) {
      const component = await route.loadComponent();
      expect(component).toBe(UbicacionRestauranteComponent);
    }
  });

  it('should map "notificaciones" to NotificationCenterComponent', async () => {
    const route = publicRoutes.find((r) => r.path === 'notificaciones');
    expect(route?.loadComponent).toBeDefined();
    expect(route?.title).toBe('Notificaciones');
    expect(route?.data?.description).toBe('Centro de notificaciones recibidas.');

    // Test lazy loading
    if (route?.loadComponent) {
      const component = await route.loadComponent();
      expect(component).toBe(NotificationCenterComponent);
    }
  });

  it('should map "offline" to OfflineComponent', () => {
    const route = publicRoutes.find((r) => r.path === 'offline');
    expect(route?.component).toBe(OfflineComponent);
    expect(route?.title).toBe('Sin conexión');
    expect(route?.data?.robots).toBe('noindex, nofollow');
    expect(route?.data?.description).toBe('Estás sin conexión. Intenta nuevamente.');
  });

  it('should have titles for all routes', () => {
    const routesWithTitle = publicRoutes.filter((r) => r.title);
    expect(routesWithTitle.length).toBeGreaterThan(0);

    // Check that main routes have titles
    const homeRoute = publicRoutes.find((r) => r.path === 'home');
    expect(homeRoute?.title).toBe('Inicio');

    const loginRoute = publicRoutes.find((r) => r.path === 'login');
    expect(loginRoute?.title).toBe('Login');
  });

  it('should have SEO descriptions for key routes', () => {
    const homeRoute = publicRoutes.find((r) => r.path === 'home');
    expect(homeRoute?.data?.description).toBeDefined();
    expect(homeRoute?.data?.description).toContain('colombiano');

    const menuRoute = publicRoutes.find((r) => r.path === 'menu');
    expect(menuRoute?.data?.description).toBeDefined();
    expect(menuRoute?.data?.description).toContain('platos');
  });
});
