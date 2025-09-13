import { DOCUMENT } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { LiveAnnouncerService } from './live-announcer.service';

function createDocument(withRegion: boolean = true): Document {
  const d = document.implementation.createHTMLDocument('test');
  if (withRegion) {
    const div = d.createElement('div');
    div.id = 'aria-live-region';
    d.body.appendChild(div);
  }
  return d as Document;
}

describe('LiveAnnouncerService', () => {
  let service: LiveAnnouncerService;
  let doc: Document;

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    TestBed.resetTestingModule();
  });

  it('anuncia en modo polite por defecto', () => {
    doc = createDocument();
    TestBed.configureTestingModule({
      providers: [
        { provide: DOCUMENT, useValue: doc },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });
    service = TestBed.inject(LiveAnnouncerService);

    service.announce('Hola');
    const region = doc.getElementById('aria-live-region')!;
    expect(region.getAttribute('aria-live')).toBe('polite');
    // Se programa con setTimeout; aún vacío antes de avanzar timers
    expect(region.textContent).toBe('');
    jest.advanceTimersByTime(60);
    expect(region.textContent).toBe('Hola');
  });

  it('permite anunciar como assertive', () => {
    doc = createDocument();
    TestBed.configureTestingModule({
      providers: [
        { provide: DOCUMENT, useValue: doc },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });
    service = TestBed.inject(LiveAnnouncerService);

    service.announce('Atención', 'assertive');
    const region = doc.getElementById('aria-live-region')!;
    jest.advanceTimersByTime(60);
    expect(region.getAttribute('aria-live')).toBe('assertive');
    expect(region.textContent).toBe('Atención');
  });

  it('no hace nada cuando no es navegador (server)', () => {
    doc = createDocument();
    TestBed.configureTestingModule({
      providers: [
        { provide: DOCUMENT, useValue: doc },
        { provide: PLATFORM_ID, useValue: 'server' },
      ],
    });
    service = TestBed.inject(LiveAnnouncerService);

    service.announce('No debería anunciar');
    const region = doc.getElementById('aria-live-region')!;
    jest.advanceTimersByTime(60);
    expect(region.getAttribute('aria-live')).toBeNull();
    expect(region.textContent).toBe('');
  });

  it('no falla si falta el aria-live-region', () => {
    doc = createDocument(false);
    TestBed.configureTestingModule({
      providers: [
        { provide: DOCUMENT, useValue: doc },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });
    service = TestBed.inject(LiveAnnouncerService);
    expect(() => service.announce('Mensaje')).not.toThrow();
    jest.advanceTimersByTime(60);
  });
});
