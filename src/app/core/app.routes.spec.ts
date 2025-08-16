import { routes } from './app.routes';
import { PageNotFoundComponent } from '../modules/public/page-not-found/page-not-found.component';

describe('App Routes', () => {
  it('should contain root route', () => {
    expect(routes).toContainEqual(
      expect.objectContaining({ path: '', loadChildren: expect.any(Function) })
    );
  });

  it('should contain admin module route', () => {
    expect(routes).toContainEqual(
      expect.objectContaining({ path: 'admin', loadChildren: expect.any(Function) })
    );
  });

  it('should contain trabajador module route', () => {
    expect(routes).toContainEqual(
      expect.objectContaining({ path: 'trabajador', loadChildren: expect.any(Function) })
    );
  });

  it('should contain client module route', () => {
    expect(routes).toContainEqual(
      expect.objectContaining({ path: 'cliente', loadChildren: expect.any(Function) })
    );
  });

  it('should contain not-found route', () => {
    expect(routes).toContainEqual(
      expect.objectContaining({ path: 'not-found', component: PageNotFoundComponent })
    );
  });

  it('should contain wildcard route', () => {
    expect(routes).toContainEqual(
      expect.objectContaining({ path: '**', component: PageNotFoundComponent })
    );
  });
});
