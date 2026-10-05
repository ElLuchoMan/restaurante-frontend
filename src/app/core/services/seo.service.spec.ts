import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRouteSnapshot } from '@angular/router';

import { createSpy } from '../../shared/mocks/test-doubles';
import { SeoService } from './seo.service';

function createDocument(): Document {
  const d = document.implementation.createHTMLDocument('test');
  return d as Document;
}

function createRouteTree(dataRoot: any, dataChild?: any): ActivatedRouteSnapshot {
  const root: any = { data: dataRoot };
  if (dataChild) {
    root.firstChild = { data: dataChild };
  }
  return root as ActivatedRouteSnapshot;
}

describe('SeoService', () => {
  let service: SeoService;
  let meta: Meta;
  let title: Title;
  let doc: Document;

  beforeEach(() => {
    doc = createDocument();
    TestBed.configureTestingModule({
      providers: [Meta, Title, { provide: DOCUMENT, useValue: doc }],
    });
    service = TestBed.inject(SeoService);
    meta = TestBed.inject(Meta);
    title = TestBed.inject(Title);
    title.setTitle('Página de Prueba');
  });

  it('actualiza metas básicas y robots, y luego limpia robots', () => {
    service.update('Descripción custom', 'noindex, nofollow');
    expect(meta.getTag("name='description'")?.content).toBe('Descripción custom');
    expect(meta.getTag("name='robots'")?.content).toBe('noindex, nofollow');
    expect(meta.getTag("property='og:title'")?.content).toBe('Página de Prueba');

    // Llamada sin robots debe remover tag previo
    service.update('Otra desc');
    expect(meta.getTag("name='robots'")).toBeNull();
  });

  it('crea/actualiza canonical con path cuando no hay origin y actualiza og:url', () => {
    service.updateCanonical('/ruta/prueba?x=1#y');
    const link = doc.head.querySelector("link[rel='canonical']") as HTMLLinkElement;
    expect(link).toBeTruthy();
    expect(link.getAttribute('href')).toBe('/ruta/prueba');
    expect(meta.getTag("property='og:url'")?.content).toBe('/ruta/prueba');
  });

  it('no falla si no se pasa routerUrl en applyForRoute', () => {
    const route = createRouteTree({ description: 'root' });
    expect(() => service.applyForRoute(route)).not.toThrow();
  });

  it('aplica datos por ruta y agrega JSON-LD dinámico para /menu', () => {
    const route = createRouteTree(
      { description: 'root' },
      { description: 'child', robots: 'index' },
    );
    service.applyForRoute(route, '/menu');

    const script = doc.getElementById('dynamic-jsonld');
    expect(script).toBeTruthy();
    expect(script?.getAttribute('type')).toBe('application/ld+json');
    expect(script?.textContent).toContain('"@type":"Menu"');
  });

  it('aplica JSON-LD para /ubicacion', () => {
    const route = createRouteTree({});
    service.applyForRoute(route, '/ubicacion');
    const script = doc.getElementById('dynamic-jsonld');
    expect(script).toBeTruthy();
    expect(script?.textContent).toContain('"@type":"Place"');
  });

  it('aplica JSON-LD para /ver-productos (equivalente a menú)', () => {
    const route = createRouteTree({});
    service.applyForRoute(route, '/ver-productos');
    const script = doc.getElementById('dynamic-jsonld');
    expect(script).toBeTruthy();
    expect(script?.textContent).toContain('"@type":"Menu"');
  });

  it('update con robots definido actualiza meta robots', () => {
    const metaMock = {
      updateTag: createSpy(),
      getTag: createSpy(),
      removeTagElement: createSpy(),
    } as unknown as Meta;
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: Meta, useValue: metaMock },
        Title,
        { provide: DOCUMENT, useValue: doc },
      ],
    });
    const svc = TestBed.inject(SeoService);
    svc.update('desc', 'noindex');
    expect((metaMock as any).updateTag).toHaveBeenCalledWith({
      name: 'robots',
      content: 'noindex',
    });
  });

  it('update sin robots y sin tag previo no intenta remover', () => {
    const getTagSpy: any = createSpy();
    getTagSpy.mockReturnValue(null);
    const metaMock = {
      updateTag: createSpy(),
      getTag: getTagSpy,
      removeTagElement: createSpy(),
    } as unknown as Meta;
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: Meta, useValue: metaMock },
        Title,
        { provide: DOCUMENT, useValue: doc },
      ],
    });
    const svc = TestBed.inject(SeoService);
    svc.update();
    expect((metaMock as any).removeTagElement).not.toHaveBeenCalled();
  });

  it('updateJsonLd elimina script previo y no crea nuevo cuando ruta no mapea', () => {
    const prev = doc.createElement('script');
    prev.id = 'dynamic-jsonld';
    doc.head.appendChild(prev);
    const route = createRouteTree({});
    service.applyForRoute(route, '/otra');
    expect(doc.getElementById('dynamic-jsonld')).toBeNull();
  });

  it('remueve meta robots si no se provee y limpia JSON-LD previo', () => {
    // Pre-colocar robots y un JSON-LD existente
    meta.updateTag({ name: 'robots', content: 'noindex' });
    const old = doc.createElement('script');
    old.id = 'dynamic-jsonld';
    doc.head.appendChild(old);

    // update sin robots debe eliminar la meta existente
    service.update();
    expect(meta.getTag("name='robots'")).toBeNull();

    // Llamar applyForRoute con ruta que no genera JSON-LD y url sin routerUrl debe eliminar script previo
    const route = createRouteTree({});
    service.applyForRoute(route); // no routerUrl => no crea nuevo
    // updateJsonLd no se invoca, pero nos aseguramos que si se invoca con otra ruta, remueve el previo
    service.applyForRoute(route, '/menu');
    expect(doc.getElementById('dynamic-jsonld')).toBeTruthy();
    // Reinvocar para forzar limpieza
    service.applyForRoute(route, '/menu');
    expect(doc.getElementById('dynamic-jsonld')).toBeTruthy();
  });

  it('applyForRoute usa datos del hijo más profundo', () => {
    const metaMock = {
      updateTag: createSpy(),
      getTag: createSpy(),
      removeTagElement: createSpy(),
    } as unknown as Meta;
    const localDoc = createDocument();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: Meta, useValue: metaMock },
        Title,
        { provide: DOCUMENT, useValue: localDoc },
      ],
    });
    const svc = TestBed.inject(SeoService);
    const root: any = {
      data: { description: 'root' },
      firstChild: { data: { description: 'child' }, firstChild: { data: { description: 'deep' } } },
    };
    svc.applyForRoute(root as any, '/menu');
    expect((metaMock as any).updateTag).toHaveBeenCalledWith({
      name: 'description',
      content: 'deep',
    });
  });

  it('updateCanonical retorna temprano si no hay head', () => {
    const metaMock = {
      updateTag: createSpy(),
      getTag: createSpy(),
      removeTagElement: createSpy(),
    } as unknown as Meta;
    const base = document.implementation.createHTMLDocument('x');
    const noHeadDoc: any = {
      head: null,
      location: { pathname: '/p' },
      createElement: base.createElement.bind(base),
    };
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: Meta, useValue: metaMock },
        Title,
        { provide: DOCUMENT, useValue: noHeadDoc as Document },
      ],
    });
    const svc = TestBed.inject(SeoService);
    expect(() => svc.updateCanonical('/cualquiera')).not.toThrow();
    expect((metaMock as any).updateTag).not.toHaveBeenCalled();
  });

  it('updateCanonical actualiza un link existente sin duplicarlo', () => {
    const base = document.implementation.createHTMLDocument('doc');
    const link = base.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', '/old');
    base.head.appendChild(link);
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [Meta, Title, { provide: DOCUMENT, useValue: base as Document }],
    });
    const svc = TestBed.inject(SeoService);
    svc.updateCanonical('/nuevo?x=1#y');
    const links = base.head.querySelectorAll("link[rel='canonical']");
    expect(links.length).toBe(1);
    expect(links[0].getAttribute('href')).toBe('/nuevo');
  });

  it('updateCanonical crea link cuando no existe y usa origin cuando está disponible', () => {
    const base = document.implementation.createHTMLDocument('withOrigin');
    const originDoc: any = {
      head: base.head,
      createElement: base.createElement.bind(base),
      location: { origin: 'https://ejemplo.com', pathname: '/path?x=1#y' },
    };
    const metaMock = {
      updateTag: createSpy(),
      getTag: createSpy(),
      removeTagElement: createSpy(),
    } as unknown as Meta;
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: Meta, useValue: metaMock },
        Title,
        { provide: DOCUMENT, useValue: originDoc as Document },
      ],
    });
    const svc = TestBed.inject(SeoService);
    svc.updateCanonical('/about?x=1#y');
    const link = originDoc.head.querySelector("link[rel='canonical']") as HTMLLinkElement;
    expect(link).toBeTruthy();
    expect(link.getAttribute('href')).toBe('https://ejemplo.com/about');
    expect((metaMock as any).updateTag).toHaveBeenCalledWith({
      property: 'og:url',
      content: 'https://ejemplo.com/about',
    });
  });

  it("updateCanonical usa '/' cuando no hay routerUrl ni location.pathname", () => {
    const base = document.implementation.createHTMLDocument('noloc');
    const proxyDoc: any = {
      head: base.head,
      createElement: base.createElement.bind(base),
      querySelector: base.querySelector.bind(base),
      location: undefined,
    };
    const metaMock = {
      updateTag: createSpy(),
      getTag: createSpy(),
      removeTagElement: createSpy(),
    } as unknown as Meta;

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: Meta, useValue: metaMock },
        Title,
        { provide: DOCUMENT, useValue: proxyDoc as Document },
      ],
    });
    const svc = TestBed.inject(SeoService);
    svc.updateCanonical();
    const link = base.head.querySelector("link[rel='canonical']") as HTMLLinkElement;
    expect(link).toBeTruthy();
    expect(link.getAttribute('href')).toBe('/');
    expect((metaMock as any).updateTag).toHaveBeenCalledWith({ property: 'og:url', content: '/' });
  });
});
