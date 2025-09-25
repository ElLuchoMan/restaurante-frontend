import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'cocina.maria.app',
  appName: 'La Cocina de María',
  webDir: 'dist/restaurante-frontend/browser',
  // Habilitar HTTP en dev-server local (live reload)
  server: {
    url: 'http://localhost:4200',
    cleartext: true,
  },
};

export default config;
