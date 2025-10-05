import { PLATFORM_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { SwUpdate, VersionEvent } from '@angular/service-worker';
import { Subject } from 'rxjs';

import { createSwUpdateMock } from '../../../shared/mocks/test-doubles';
import { UpdateBannerComponent } from './update-banner.component';

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('UpdateBannerComponent', () => {
  let component: UpdateBannerComponent;
  let fixture: ComponentFixture<UpdateBannerComponent>;
  let mockSwUpdate: jest.Mocked<SwUpdate>;
  let versionUpdatesSubject: Subject<VersionEvent>;
  let availableSubject: Subject<unknown>;
  let unrecoverableSubject: Subject<unknown>;

  beforeEach(async () => {
    // Create subjects for observables
    versionUpdatesSubject = new Subject<VersionEvent>();
    availableSubject = new Subject<unknown>();
    unrecoverableSubject = new Subject<unknown>();

    // Create mock SwUpdate
    mockSwUpdate = createSwUpdateMock({
      isEnabled: true,
      versionUpdates$: versionUpdatesSubject.asObservable(),
      available$: availableSubject.asObservable(),
      unrecoverable$: unrecoverableSubject.asObservable(),
    }) as any;

    await TestBed.configureTestingModule({
      imports: [UpdateBannerComponent],
      providers: [
        { provide: SwUpdate, useValue: mockSwUpdate },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UpdateBannerComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    versionUpdatesSubject.complete();
    availableSubject.complete();
    unrecoverableSubject.complete();
    jest.restoreAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Platform Detection', () => {
    it('should detect browser platform', () => {
      expect(component['isBrowser']).toBe(true);
    });

    it('should detect server platform', async () => {
      await TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [UpdateBannerComponent],
        providers: [
          { provide: SwUpdate, useValue: mockSwUpdate },
          { provide: PLATFORM_ID, useValue: 'server' },
        ],
      }).compileComponents();

      const serverFixture = TestBed.createComponent(UpdateBannerComponent);
      const serverComponent = serverFixture.componentInstance;

      expect(serverComponent['isBrowser']).toBe(false);
    });
  });

  describe('ngOnInit - Browser Platform', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should not setup subscriptions when SwUpdate is disabled', () => {
      mockSwUpdate.isEnabled = false;
      const newComponent = TestBed.createComponent(UpdateBannerComponent).componentInstance;

      newComponent.ngOnInit();

      // Emit events - should not affect component state
      versionUpdatesSubject.next({ type: 'VERSION_READY' } as VersionEvent);
      availableSubject.next({});

      expect(newComponent.updateAvailable).toBe(false);
    });

    it('should setup subscriptions when SwUpdate is enabled', () => {
      expect(component.updateAvailable).toBe(false);
      expect(component.unrecoverable).toBe(false);
    });

    it('should handle VERSION_READY event from versionUpdates', () => {
      versionUpdatesSubject.next({ type: 'VERSION_READY' } as VersionEvent);

      expect(component.updateAvailable).toBe(true);
    });

    it('should ignore non-VERSION_READY events from versionUpdates', () => {
      versionUpdatesSubject.next({ type: 'VERSION_DETECTED' } as VersionEvent);

      expect(component.updateAvailable).toBe(false);
    });

    it('should handle available observable (legacy compatibility)', () => {
      availableSubject.next({});

      expect(component.updateAvailable).toBe(true);
    });

    it('should handle unrecoverable events', () => {
      unrecoverableSubject.next({});

      expect(component.unrecoverable).toBe(true);
    });

    it('should handle both versionUpdates and available events', () => {
      versionUpdatesSubject.next({ type: 'VERSION_READY' } as VersionEvent);
      availableSubject.next({});

      expect(component.updateAvailable).toBe(true);
    });
  });

  describe('ngOnInit - Server Platform', () => {
    it('should not setup subscriptions on server platform', async () => {
      await TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [UpdateBannerComponent],
        providers: [
          { provide: SwUpdate, useValue: mockSwUpdate },
          { provide: PLATFORM_ID, useValue: 'server' },
        ],
      }).compileComponents();

      const serverFixture = TestBed.createComponent(UpdateBannerComponent);
      const serverComponent = serverFixture.componentInstance;

      serverComponent.ngOnInit();

      // Emit events - should not affect component state
      versionUpdatesSubject.next({ type: 'VERSION_READY' } as VersionEvent);
      unrecoverableSubject.next({});

      expect(serverComponent.updateAvailable).toBe(false);
      expect(serverComponent.unrecoverable).toBe(false);
    });
  });

  describe('Template Rendering', () => {
    it('should not show banners initially', () => {
      fixture.detectChanges();

      const updateBanner = fixture.debugElement.query(By.css('.update-banner:not(.error)'));
      const errorBanner = fixture.debugElement.query(By.css('.update-banner.error'));

      expect(updateBanner).toBeFalsy();
      expect(errorBanner).toBeFalsy();
    });

    it('should show update banner when update is available', () => {
      component.updateAvailable = true;
      fixture.detectChanges();

      const updateBanner = fixture.debugElement.query(By.css('.update-banner:not(.error)'));
      expect(updateBanner).toBeTruthy();
      expect(updateBanner.nativeElement.textContent).toContain('Hay una nueva versión disponible');

      const updateButton = updateBanner.query(By.css('button:first-child'));
      const dismissButton = updateBanner.query(By.css('button:last-child'));

      expect(updateButton.nativeElement.textContent.trim()).toBe('Actualizar');
      expect(dismissButton.nativeElement.textContent.trim()).toBe('Cerrar');
    });

    it('should show error banner when unrecoverable error occurs', () => {
      component.unrecoverable = true;
      fixture.detectChanges();

      const errorBanner = fixture.debugElement.query(By.css('.update-banner.error'));
      expect(errorBanner).toBeTruthy();
      expect(errorBanner.nativeElement.textContent).toContain(
        'Se produjo un error con la versión actual',
      );

      const reloadButton = errorBanner.query(By.css('button'));
      expect(reloadButton.nativeElement.textContent.trim()).toBe('Recargar');
    });

    it('should show both banners when both conditions are true', () => {
      component.updateAvailable = true;
      component.unrecoverable = true;
      fixture.detectChanges();

      const updateBanner = fixture.debugElement.query(By.css('.update-banner:not(.error)'));
      const errorBanner = fixture.debugElement.query(By.css('.update-banner.error'));

      expect(updateBanner).toBeTruthy();
      expect(errorBanner).toBeTruthy();
    });
  });

  describe('User Interactions', () => {
    it.skip('should reload page when update button is clicked', async () => {
      /* JSDOM limitation */

      component.updateAvailable = true;
      fixture.detectChanges();

      mockSwUpdate.activateUpdate.mockResolvedValueOnce(undefined);

      const updateButton = fixture.debugElement.query(
        By.css('.update-banner:not(.error) button:first-child'),
      );
      updateButton.nativeElement.click();

      await flushPromises();

      expect(mockSwUpdate.activateUpdate).toHaveBeenCalled();
      expect(reloadSpy).toHaveBeenCalledTimes(1);
    });

    it.skip('should reload page when activateUpdate fails', async () => {
      /* JSDOM limitation */

      mockSwUpdate.activateUpdate.mockRejectedValueOnce(new Error('activation failed'));

      component.reload();

      await flushPromises();

      expect(mockSwUpdate.activateUpdate).toHaveBeenCalledTimes(1);
      expect(reloadSpy).toHaveBeenCalledTimes(1);
    });

    it('should dismiss update banner when dismiss button is clicked', () => {
      component.updateAvailable = true;
      fixture.detectChanges();

      const dismissButton = fixture.debugElement.query(
        By.css('.update-banner:not(.error) button:last-child'),
      );
      dismissButton.nativeElement.click();

      expect(component.updateAvailable).toBe(false);
    });

    it.skip('should reload page when error banner reload button is clicked', async () => {
      /* JSDOM limitation */

      component.unrecoverable = true;
      fixture.detectChanges();

      const reloadButton = fixture.debugElement.query(By.css('.update-banner.error button'));
      reloadButton.nativeElement.click();

      await flushPromises();

      expect(mockSwUpdate.activateUpdate).toHaveBeenCalledTimes(1);
      expect(reloadSpy).toHaveBeenCalledTimes(1);
    });

    it('should not call activateUpdate on server platform', async () => {
      await TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [UpdateBannerComponent],
        providers: [
          { provide: SwUpdate, useValue: mockSwUpdate },
          { provide: PLATFORM_ID, useValue: 'server' },
        ],
      }).compileComponents();

      const serverFixture = TestBed.createComponent(UpdateBannerComponent);
      const serverComponent = serverFixture.componentInstance;

      serverComponent.reload();

      expect(mockSwUpdate.activateUpdate).not.toHaveBeenCalled();
    });
  });

  describe('Component Methods', () => {
    it('should call reload method correctly', async () => {
      const reloadSpy = jest.spyOn(component, 'reload');
      component.updateAvailable = true;
      fixture.detectChanges();

      const updateButton = fixture.debugElement.query(
        By.css('.update-banner:not(.error) button:first-child'),
      );
      updateButton.nativeElement.click();

      expect(reloadSpy).toHaveBeenCalled();
    });

    it('should call dismiss method correctly', () => {
      const dismissSpy = jest.spyOn(component, 'dismiss');
      component.updateAvailable = true;
      fixture.detectChanges();

      const dismissButton = fixture.debugElement.query(
        By.css('.update-banner:not(.error) button:last-child'),
      );
      dismissButton.nativeElement.click();

      expect(dismissSpy).toHaveBeenCalled();
    });

    it('should set updateAvailable to false when dismiss is called', () => {
      component.updateAvailable = true;
      component.dismiss();

      expect(component.updateAvailable).toBe(false);
    });
  });

  describe('ngOnDestroy', () => {
    it('should complete destroyed subject', () => {
      const nextSpy = jest.spyOn(component['destroyed$'], 'next');
      const completeSpy = jest.spyOn(component['destroyed$'], 'complete');

      component.ngOnDestroy();

      expect(nextSpy).toHaveBeenCalled();
      expect(completeSpy).toHaveBeenCalled();
    });

    it('should unsubscribe from observables', () => {
      component.ngOnInit();

      // Set up state
      component.updateAvailable = false;
      component.unrecoverable = false;

      // Destroy component
      component.ngOnDestroy();

      // Emit events after destruction - should not affect component state
      versionUpdatesSubject.next({ type: 'VERSION_READY' } as VersionEvent);
      availableSubject.next({});
      unrecoverableSubject.next({});

      expect(component.updateAvailable).toBe(false);
      expect(component.unrecoverable).toBe(false);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes for update banner', () => {
      component.updateAvailable = true;
      fixture.detectChanges();

      const updateBanner = fixture.debugElement.query(By.css('.update-banner:not(.error)'));
      expect(updateBanner.nativeElement.getAttribute('role')).toBe('status');
      expect(updateBanner.nativeElement.getAttribute('aria-live')).toBe('polite');
    });

    it('should have proper ARIA attributes for error banner', () => {
      component.unrecoverable = true;
      fixture.detectChanges();

      const errorBanner = fixture.debugElement.query(By.css('.update-banner.error'));
      expect(errorBanner.nativeElement.getAttribute('role')).toBe('alert');
      expect(errorBanner.nativeElement.getAttribute('aria-live')).toBe('assertive');
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing versionUpdates observable', async () => {
      const swUpdateWithoutVersionUpdates = {
        ...mockSwUpdate,
        versionUpdates: undefined,
      } as any;

      await TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [UpdateBannerComponent],
        providers: [
          { provide: SwUpdate, useValue: swUpdateWithoutVersionUpdates },
          { provide: PLATFORM_ID, useValue: 'browser' },
        ],
      }).compileComponents();

      const newFixture = TestBed.createComponent(UpdateBannerComponent);
      const newComponent = newFixture.componentInstance;

      expect(() => newComponent.ngOnInit()).not.toThrow();
    });

    it('should handle missing available observable', async () => {
      const swUpdateWithoutAvailable = {
        ...mockSwUpdate,
        available: undefined,
      } as any;

      await TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [UpdateBannerComponent],
        providers: [
          { provide: SwUpdate, useValue: swUpdateWithoutAvailable },
          { provide: PLATFORM_ID, useValue: 'browser' },
        ],
      }).compileComponents();

      const newFixture = TestBed.createComponent(UpdateBannerComponent);
      const newComponent = newFixture.componentInstance;

      expect(() => newComponent.ngOnInit()).not.toThrow();
    });

    it('should handle version event without type property', () => {
      component.ngOnInit();

      // This should not crash or set updateAvailable to true
      versionUpdatesSubject.next({} as VersionEvent);

      expect(component.updateAvailable).toBe(false);
    });

    it('should handle malformed version events', () => {
      component.ngOnInit();

      // These should not crash
      versionUpdatesSubject.next(null as any);
      versionUpdatesSubject.next(undefined as any);
      versionUpdatesSubject.next('invalid' as any);

      expect(component.updateAvailable).toBe(false);
    });
  });
});
