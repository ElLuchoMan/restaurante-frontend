import { trabajadoresRoutes } from './trabajadores.routes';
import { TomarDomicilioComponent } from './domicilios/tomar-domicilio/tomar-domicilio.component';
import { RutaDomicilioComponent } from './domicilios/ruta-domicilio/ruta-domicilio.component';
import { AuthGuard } from '../../core/guards/auth.guard';
import { RoleGuard } from '../../core/guards/role.guard';

describe('Trabajadores Routes', () => {
  it('should configure domicilios child routes', () => {
    const dom = trabajadoresRoutes.find(r => r.path === 'domicilios');
    const tomar = dom?.children?.find(c => c.path === 'tomar');
    expect(tomar?.component).toBe(TomarDomicilioComponent);
    expect(tomar?.canActivate).toEqual([AuthGuard, RoleGuard]);
    expect(tomar?.data).toEqual({ roles: ['Domiciliario'] });

    const ruta = dom?.children?.find(c => c.path === 'ruta-domicilio');
    expect(ruta?.component).toBe(RutaDomicilioComponent);
  });
});
