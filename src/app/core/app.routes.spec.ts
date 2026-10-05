import { PageNotFoundComponent } from '../modules/public/page-not-found/page-not-found.component';
import { routes } from './app.routes';

describe('App Routes', () => {
  it('should load the public routes for root route', async () => {
    const route = routes.find((r) => r.path === '');
    expect(route).toBeDefined();
    expect(route!.loadChildren).toBeDefined();

    const routesArray = await (route!.loadChildren as () => Promise<any>)();
    expect(Array.isArray(routesArray)).toBe(true);
    expect(routesArray.length).toBeGreaterThan(0);
  });

  it('should load the admin routes', async () => {
    const route = routes.find((r) => r.path === 'admin');
    expect(route).toBeDefined();
    expect(route!.loadChildren).toBeDefined();

    const routesArray = await (route!.loadChildren as () => Promise<any>)();
    expect(Array.isArray(routesArray)).toBe(true);
    expect(routesArray.length).toBeGreaterThan(0);
  });

  it('should load the trabajadores routes', async () => {
    const route = routes.find((r) => r.path === 'trabajador');
    expect(route).toBeDefined();
    expect(route!.loadChildren).toBeDefined();

    const routesArray = await (route!.loadChildren as () => Promise<any>)();
    expect(Array.isArray(routesArray)).toBe(true);
    expect(routesArray.length).toBeGreaterThan(0);
  });

  it('should load the client routes', async () => {
    const route = routes.find((r) => r.path === 'cliente');
    expect(route).toBeDefined();
    expect(route!.loadChildren).toBeDefined();

    const routesArray = await (route!.loadChildren as () => Promise<any>)();
    expect(Array.isArray(routesArray)).toBe(true);
    expect(routesArray.length).toBeGreaterThan(0);
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
