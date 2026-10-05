/**
 * Acceso a window.location aislado en un solo punto.
 * jsdom 26 (Jest 30) no permite redefinir `window.location`, así que en los tests
 * se espía este objeto (jest.spyOn(browserLocation, 'reload')) en lugar de reemplazar location.
 */
export const browserLocation = {
  reload: (): void => window.location.reload(),
  assign: (url: string): void => {
    window.location.href = url;
  },
  hostname: (): string => window.location.hostname,
};
