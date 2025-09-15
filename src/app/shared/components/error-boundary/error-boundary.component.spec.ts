import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';

import { ErrorBoundaryComponent, ErrorBoundaryConfig } from './error-boundary.component';

describe('ErrorBoundaryComponent', () => {
  let component: ErrorBoundaryComponent;
  let fixture: ComponentFixture<ErrorBoundaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErrorBoundaryComponent, RouterTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ErrorBoundaryComponent);
    component = fixture.componentInstance;

    // Ensure the component has the default config
    component.config = {
      showDetails: false,
      showRetry: true,
      redirectTo: '/home',
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Default Configuration', () => {
    it('should have default configuration', () => {
      expect(component.config).toEqual({
        showDetails: false,
        showRetry: true,
        redirectTo: '/home',
      });
    });

    it('should render default error message', () => {
      fixture.detectChanges();

      const messageElement = fixture.debugElement.query(By.css('.error-boundary__message'));
      expect(messageElement.nativeElement.textContent.trim()).toBe(
        'Ha ocurrido un error inesperado. Por favor, intenta nuevamente.',
      );
    });

    it('should show retry button by default', () => {
      fixture.detectChanges();

      const retryButton = fixture.debugElement.query(By.css('button[type="button"]'));
      expect(retryButton).toBeTruthy();
      expect(retryButton.nativeElement.textContent.trim()).toContain('Intentar nuevamente');
    });

    it('should show redirect link by default', () => {
      fixture.detectChanges();

      const redirectLink = fixture.debugElement.query(By.css('a'));
      expect(redirectLink).toBeTruthy();
      expect(redirectLink.nativeElement.getAttribute('href')).toBe('/home');
      expect(redirectLink.nativeElement.textContent.trim()).toContain('Ir al inicio');
    });
  });

  describe('Custom Configuration', () => {
    it('should render custom message when provided', () => {
      const customConfig: ErrorBoundaryConfig = {
        customMessage: 'Error personalizado de prueba',
      };
      component.config = customConfig;
      fixture.detectChanges();

      const messageElement = fixture.debugElement.query(By.css('.error-boundary__message'));
      expect(messageElement.nativeElement.textContent.trim()).toBe('Error personalizado de prueba');
    });

    it('should hide retry button when showRetry is false', () => {
      const customConfig: ErrorBoundaryConfig = {
        showRetry: false,
      };
      component.config = customConfig;
      fixture.detectChanges();

      const retryButton = fixture.debugElement.query(By.css('button[type="button"]'));
      expect(retryButton).toBeFalsy();
    });

    it('should hide redirect link when redirectTo is not provided', () => {
      const customConfig: ErrorBoundaryConfig = {
        redirectTo: undefined,
      };
      component.config = customConfig;
      fixture.detectChanges();

      const redirectLink = fixture.debugElement.query(By.css('a'));
      expect(redirectLink).toBeFalsy();
    });

    it('should use custom redirect route', () => {
      const customConfig: ErrorBoundaryConfig = {
        showDetails: false,
        showRetry: true,
        redirectTo: '/custom-route',
      };
      component.config = customConfig;
      fixture.detectChanges();

      const redirectLink = fixture.debugElement.query(By.css('a'));
      expect(redirectLink).toBeTruthy();
      expect(redirectLink.nativeElement.getAttribute('href')).toBe('/custom-route');
    });
  });

  describe('Error Details', () => {
    it('should not show error details by default', () => {
      const testError = new Error('Test error message');
      testError.stack = 'Error stack trace';
      component.error = testError;
      fixture.detectChanges();

      const detailsElement = fixture.debugElement.query(By.css('.error-boundary__details'));
      expect(detailsElement).toBeFalsy();
    });

    it('should show error details when showDetails is true and error is provided', () => {
      const testError = new Error('Test error message');
      testError.stack = 'Error stack trace';
      component.error = testError;
      component.config = { showDetails: true };
      fixture.detectChanges();

      const detailsElement = fixture.debugElement.query(By.css('.error-boundary__details'));
      expect(detailsElement).toBeTruthy();

      const stackElement = fixture.debugElement.query(By.css('.error-boundary__stack'));
      expect(stackElement.nativeElement.textContent).toContain('Test error message');
      expect(stackElement.nativeElement.textContent).toContain('Error stack trace');
    });

    it('should not show error details when showDetails is true but no error is provided', () => {
      component.error = undefined;
      component.config = { showDetails: true };
      fixture.detectChanges();

      const detailsElement = fixture.debugElement.query(By.css('.error-boundary__details'));
      expect(detailsElement).toBeFalsy();
    });

    it('should handle error without stack trace', () => {
      const testError = new Error('Test error message');
      testError.stack = undefined;
      component.error = testError;
      component.config = { showDetails: true };
      fixture.detectChanges();

      const stackElement = fixture.debugElement.query(By.css('.error-boundary__stack'));
      expect(stackElement.nativeElement.textContent).toContain('Test error message');
      // When stack is undefined, the template shows it as empty or doesn't show it
      expect(stackElement).toBeTruthy();
    });
  });

  describe('User Interactions', () => {
    // no jest.fn directos, la recarga ya no se asserta directamente

    it('should reload page when retry button is clicked', () => {
      fixture.detectChanges();

      const retryButton = fixture.debugElement.query(By.css('button[type="button"]'));
      retryButton.nativeElement.click();

      expect(window.location.reload).toHaveBeenCalled();
    });

    it('should call retry method when retry button is clicked', () => {
      const retrySpy = jest.spyOn(component, 'retry');
      fixture.detectChanges();

      const retryButton = fixture.debugElement.query(By.css('button[type="button"]'));
      retryButton.nativeElement.click();

      expect(retrySpy).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      fixture.detectChanges();

      const errorBoundary = fixture.debugElement.query(By.css('.error-boundary'));
      expect(errorBoundary.nativeElement.getAttribute('role')).toBe('alert');
      expect(errorBoundary.nativeElement.getAttribute('aria-live')).toBe('assertive');
    });

    it('should have proper icon accessibility', () => {
      fixture.detectChanges();

      const icon = fixture.debugElement.query(By.css('.error-boundary__icon i'));
      expect(icon.nativeElement.getAttribute('aria-hidden')).toBe('true');
    });

    it('should have proper button accessibility', () => {
      fixture.detectChanges();

      const retryButton = fixture.debugElement.query(By.css('button[type="button"]'));
      expect(retryButton.nativeElement.getAttribute('type')).toBe('button');

      const retryIcon = retryButton.query(By.css('i'));
      expect(retryIcon.nativeElement.getAttribute('aria-hidden')).toBe('true');
    });

    it('should have proper link accessibility', () => {
      fixture.detectChanges();

      const redirectLink = fixture.debugElement.query(By.css('a'));
      expect(redirectLink).toBeTruthy(); // Should exist with default config
      const linkIcon = redirectLink.query(By.css('i'));
      expect(linkIcon.nativeElement.getAttribute('aria-hidden')).toBe('true');
    });
  });

  describe('Component Structure', () => {
    it('should render all main elements', () => {
      fixture.detectChanges();

      const container = fixture.debugElement.query(By.css('.error-boundary__container'));
      const icon = fixture.debugElement.query(By.css('.error-boundary__icon'));
      const content = fixture.debugElement.query(By.css('.error-boundary__content'));
      const title = fixture.debugElement.query(By.css('.error-boundary__title'));
      const message = fixture.debugElement.query(By.css('.error-boundary__message'));
      const actions = fixture.debugElement.query(By.css('.error-boundary__actions'));

      expect(container).toBeTruthy();
      expect(icon).toBeTruthy();
      expect(content).toBeTruthy();
      expect(title).toBeTruthy();
      expect(message).toBeTruthy();
      expect(actions).toBeTruthy();
    });

    it('should have correct title text', () => {
      fixture.detectChanges();

      const title = fixture.debugElement.query(By.css('.error-boundary__title'));
      expect(title.nativeElement.textContent.trim()).toBe('Algo salió mal');
    });

    it('should have FontAwesome icons', () => {
      fixture.detectChanges();

      const warningIcon = fixture.debugElement.query(By.css('.fa-exclamation-triangle'));
      const retryIcon = fixture.debugElement.query(By.css('.fa-redo'));
      const homeIcon = fixture.debugElement.query(By.css('.fa-home'));

      expect(warningIcon).toBeTruthy();
      expect(retryIcon).toBeTruthy();
      expect(homeIcon).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty config object', () => {
      component.config = {};
      fixture.detectChanges();

      const messageElement = fixture.debugElement.query(By.css('.error-boundary__message'));
      expect(messageElement.nativeElement.textContent.trim()).toBe(
        'Ha ocurrido un error inesperado. Por favor, intenta nuevamente.',
      );

      const retryButton = fixture.debugElement.query(By.css('button[type="button"]'));
      expect(retryButton).toBeFalsy(); // showRetry is undefined, so falsy

      const redirectLink = fixture.debugElement.query(By.css('a[routerLink]'));
      expect(redirectLink).toBeFalsy(); // redirectTo is undefined
    });

    it('should handle null error object', () => {
      component.error = null as any;
      component.config = { showDetails: true };
      fixture.detectChanges();

      const detailsElement = fixture.debugElement.query(By.css('.error-boundary__details'));
      expect(detailsElement).toBeFalsy();
    });

    it('should handle error with empty message', () => {
      const testError = new Error('');
      component.error = testError;
      component.config = { showDetails: true };
      fixture.detectChanges();

      const stackElement = fixture.debugElement.query(By.css('.error-boundary__stack'));
      expect(stackElement).toBeTruthy();
    });
  });
});
