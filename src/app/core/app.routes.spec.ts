import { PageNotFoundComponent } from '../modules/public/page-not-found/page-not-found.component';
import { routes } from './app.routes';

describe('App Routes', () => {
  it('should load the public module for root route', async () => {
    const route = routes.find((r) => r.path === '');
    expect(route).toBeDefined();

    const module = await (route!.loadChildren as () => Promise<any>)();
    expect(module.name).toBe('PublicModule');
  });

  it('should load the admin module', async () => {
    const route = routes.find((r) => r.path === 'admin');
    expect(route).toBeDefined();

    const module = await (route!.loadChildren as () => Promise<any>)();
    expect(module.name).toBe('AdminModule');
  });

  it('should load the trabajadores module', async () => {
    const route = routes.find((r) => r.path === 'trabajador');
    expect(route).toBeDefined();

    const module = await (route!.loadChildren as () => Promise<any>)();
    expect(module.name).toBe('TrabajadoresModule');
  });

  it('should load the client module', async () => {
    const route = routes.find((r) => r.path === 'cliente');
    expect(route).toBeDefined();

    const module = await (route!.loadChildren as () => Promise<any>)();
    expect(module.name).toBe('ClientModule');
  });

  it('should contain not-found route', () => {
    expect(routes).toContainEqual(
      expect.objectContaining({ path: 'not-found', component: PageNotFoundComponent }),
    );
  });

  it('should contain wildcard route', () => {
    expect(routes).toContainEqual(
      expect.objectContaining({ path: '**', component: PageNotFoundComponent }),
    );
  });
});
