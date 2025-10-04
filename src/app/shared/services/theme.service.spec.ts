import { TestBed } from '@angular/core/testing';
import { createMatchMediaMock } from '../mocks/test-doubles';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    // Mock window.matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: createMatchMediaMock(false),
    });

    TestBed.configureTestingModule({});
    service = TestBed.inject(ThemeService);

    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getCurrentTheme', () => {
    it('should return current theme as observable', (done) => {
      service.getCurrentTheme().subscribe((theme) => {
        expect(['light', 'dark', 'auto']).toContain(theme);
        done();
      });
    });
  });

  describe('setTheme', () => {
    it('should set theme to light', () => {
      service.setTheme('light');

      service.getCurrentTheme().subscribe((theme) => {
        expect(theme).toBe('light');
      });
    });

    it('should set theme to dark', () => {
      service.setTheme('dark');

      service.getCurrentTheme().subscribe((theme) => {
        expect(theme).toBe('dark');
      });
    });

    it('should set theme to auto', () => {
      service.setTheme('auto');

      service.getCurrentTheme().subscribe((theme) => {
        expect(theme).toBe('auto');
      });
    });

    it('should apply theme to document', () => {
      jest.spyOn(document.documentElement, 'setAttribute');

      service.setTheme('dark');

      expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'dark');
    });

    it('should add theme transition class', () => {
      jest.spyOn(document.documentElement.classList, 'add');
      jest.spyOn(document.documentElement.classList, 'remove');

      service.setTheme('light');

      expect(document.documentElement.classList.add).toHaveBeenCalledWith('theme-transition');
    });
  });

  describe('toggleTheme', () => {
    it('should toggle from light to dark', () => {
      service.setTheme('light');
      service.toggleTheme();

      service.getCurrentTheme().subscribe((theme) => {
        expect(theme).toBe('dark');
      });
    });

    it('should toggle from dark to light', () => {
      service.setTheme('dark');
      service.toggleTheme();

      service.getCurrentTheme().subscribe((theme) => {
        expect(theme).toBe('light');
      });
    });
  });

  describe('isDarkMode', () => {
    it('should return true for dark theme', () => {
      service.setTheme('dark');
      expect(service.isDarkMode()).toBeTruthy();
    });

    it('should return false for light theme', () => {
      service.setTheme('light');
      expect(service.isDarkMode()).toBeFalsy();
    });

    it('should detect system preference for auto theme', () => {
      // Mock matchMedia
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: createMatchMediaMock(true),
      });

      service.setTheme('auto');
      expect(service.isDarkMode()).toBeTruthy();
    });
  });

  describe('localStorage integration', () => {
    it('should save theme to localStorage', () => {
      service.setTheme('dark');

      const saved = localStorage.getItem('restaurant_theme');
      expect(saved).toBe('dark');
    });

    it('should load theme from localStorage', () => {
      localStorage.setItem('restaurant_theme', 'dark');

      const newService = new ThemeService();

      newService.getCurrentTheme().subscribe((theme) => {
        expect(theme).toBe('dark');
      });
    });

    it('should handle invalid localStorage data', () => {
      localStorage.setItem('restaurant_theme', 'invalid');

      const newService = new ThemeService();

      newService.getCurrentTheme().subscribe((theme) => {
        expect(['light', 'dark']).toContain(theme);
      });
    });

    it('should handle localStorage errors gracefully', () => {
      const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');
      setItemSpy.mockImplementation(() => {
        throw new Error('Storage error');
      });

      expect(() => {
        service.setTheme('dark');
      }).not.toThrow();

      setItemSpy.mockRestore();
    });

    it('should handle localStorage getItem errors gracefully', () => {
      const getItemSpy = jest.spyOn(Storage.prototype, 'getItem');
      getItemSpy.mockImplementation(() => {
        throw new Error('Storage error');
      });

      expect(() => {
        const newService = new ThemeService();
      }).not.toThrow();

      getItemSpy.mockRestore();
    });
  });

  describe('system preference detection', () => {
    it('should detect dark system preference', () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: createMatchMediaMock(true),
      });

      const newService = new ThemeService();

      newService.getCurrentTheme().subscribe((theme) => {
        expect(theme).toBe('dark');
      });
    });

    it('should detect light system preference', () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: createMatchMediaMock(false),
      });

      const newService = new ThemeService();

      newService.getCurrentTheme().subscribe((theme) => {
        expect(theme).toBe('light');
      });
    });
  });

  describe('theme application', () => {
    it('should apply light theme correctly', () => {
      jest.spyOn(document.documentElement, 'setAttribute');

      service.setTheme('light');

      expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'light');
    });

    it('should apply dark theme correctly', () => {
      jest.spyOn(document.documentElement, 'setAttribute');

      service.setTheme('dark');

      expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'dark');
    });

    it('should apply auto theme based on system preference', () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: createMatchMediaMock(true),
      });

      jest.spyOn(document.documentElement, 'setAttribute');

      service.setTheme('auto');

      expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'dark');
    });
  });
});
