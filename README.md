# RestauranteFrontend

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.0.5.

## Development server

To start a local development server, run:

```bash
npm run start
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Building

To build the project run:

```bash
npm run build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Jest](https://jestjs.io/) test runner, use the following command:

```bash
npm run test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.


## Status
[![Netlify Status](https://api.netlify.com/api/v1/badges/08900eb5-ce5b-4278-932b-037569ffd3c4/deploy-status)](https://app.netlify.com/sites/lacocinademaria/deploys)

## Structure

```
src/
├── app/
│   ├── core/                  # Elementos esenciales y configuración de la app
│   │   ├── components/        # Componentes reutilizables globales
│   │   ├── guards/            # Guardias para autenticación y roles
│   │   ├── interceptors/      # Interceptores HTTP (e.g., manejo de JWT)
│   │   ├── services/          # Servicios generales (e.g., autenticación)
│   │   ├── core.module.ts     # Módulo de configuración de Core
│   │   └── app.config.ts      # Configuración global (e.g., constantes, URLs)
│   ├── shared/                # Componentes y utilidades reutilizables
│   │   ├── components/        # Botones, tarjetas, modales, etc.
│   │   │   ├── header/        # Header común
│   │   │   ├── footer/        # Footer común
│   │   ├── directives/        # Directivas personalizadas
│   │   ├── pipes/             # Pipes comunes
│   │   └── shared.module.ts   # Módulo compartido
│   ├── modules/               # Módulos específicos por funcionalidad/rol
│   │   ├── public/            # Vistas públicas (sin autenticación)
│   │   │   ├── home/          # Página principal
│   │   │   ├── about/         # Sobre nosotros
│   │   │   ├── contact/       # Contacto
│   │   │   └── public.module.ts
│   │   ├── admin/             # Módulo de administrador
│   │   │   ├── dashboard/     # Panel de administración
│   │   │   ├── users/         # Gestión de usuarios
│   │   │   └── admin.module.ts
│   │   ├── client/            # Módulo de cliente
│   │   │   ├── profile/       # Perfil del cliente
│   │   │   ├── orders/        # Gestión de pedidos
│   │   │   └── client.module.ts
│   │   └── auth/              # Módulo de autenticación
│   │       ├── login/         # Página de inicio de sesión
│   │       ├── register/      # Página de registro
│   │       └── auth.module.ts
│   ├── app-routing.module.ts  # Configuración de rutas principales
│   ├── app.component.ts       # Componente raíz
│   └── app.module.ts          # Módulo raíz
├── assets/                    # Recursos estáticos (imágenes, fuentes, etc.)
├── environments/              # Archivos de configuración de entorno
│   ├── environment.ts         # Configuración para desarrollo
│   └── environment.prod.ts    # Configuración para producción


