import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'cocina.maria.app',
  appName: 'El Fogón de María',
  webDir: 'dist/restaurante-frontend/browser',
  // Habilitar HTTP en dev-server local (live reload)
  server: {
    url: 'http://192.168.1.2:4200',
    cleartext: true,
  },
};

export default config;
