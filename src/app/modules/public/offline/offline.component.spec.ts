import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { createLocationReloadMock } from '../../../shared/mocks/test-doubles';
import { OfflineComponent } from './offline.component';

describe('OfflineComponent', () => {
  let component: OfflineComponent;
  let fixture: ComponentFixture<OfflineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OfflineComponent, RouterTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(OfflineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a title "Sin conexión"', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const title = compiled.querySelector('h1');
    expect(title?.textContent).toBe('Sin conexión');
  });

  it('should have a message about internet connection', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const message = compiled.querySelector('p[role="alert"]');
    expect(message?.textContent).toContain('no hay internet');
  });

  it('should have a link to home page', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const homeLink = compiled.querySelector('a[routerLink="/home"]');
    expect(homeLink).toBeTruthy();
    expect(homeLink?.textContent).toContain('Ir al inicio');
  });

  it('should have a retry button', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const retryButton = compiled.querySelector('button');
    expect(retryButton).toBeTruthy();
    expect(retryButton?.textContent).toContain('Reintentar');
  });

  it('should reload page when reintentar is called', () => {
    const reloadMock = createLocationReloadMock();

    component.reintentar();

    expect(reloadMock).toHaveBeenCalled();
  });

  it('should call reintentar when retry button is clicked', () => {
    const reintentarSpy = jest.spyOn(component, 'reintentar').mockImplementation(() => {});
    const compiled = fixture.nativeElement as HTMLElement;
    const retryButton = compiled.querySelector('button') as HTMLButtonElement;

    retryButton.click();

    expect(reintentarSpy).toHaveBeenCalled();

    reintentarSpy.mockRestore();
  });

  it('should have proper accessibility attributes', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const alertMessage = compiled.querySelector('p[role="alert"]');
    expect(alertMessage?.getAttribute('role')).toBe('alert');
    expect(alertMessage?.getAttribute('aria-live')).toBe('polite');
  });
});
