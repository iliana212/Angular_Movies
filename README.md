🇪🇸 Español&nbsp;|&nbsp;🇬🇧 [English](README.en.md)

# 🎬 Movies — Cliente Angular

Aplicación de una sola página (SPA) construida con **Angular 21** y **Angular Material**, que consume la [Movies API](https://github.com/iliana212/API_Movies) (ASP.NET Core / .NET 10). Permite explorar y filtrar películas, calificarlas, y administrar géneros, actores, cines y películas con control de acceso por rol.

Existe también una versión de este cliente en React: [React_Movies](https://github.com/iliana212/React_Movies).

![Angular](https://img.shields.io/badge/Angular-21-DD0031?logo=angular&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white) ![Angular Material](https://img.shields.io/badge/Angular-Material-3F51B5?logo=angular&logoColor=white) ![RxJS](https://img.shields.io/badge/RxJS-7-B7178C?logo=reactivex&logoColor=white)

> **Estado:** en desarrollo activo.

![Inicio](docs/filtro.png) ![Filtro](docs/pelicula.png) ![Detalle](docs/detalle.png) ![Actores](docs/generos.png)

## En un vistazo

- **Página de inicio** con películas en cines y próximos estrenos
- **Filtro de películas** por título, género, en cines y próximos estrenos, con paginación
- **Detalle de película** con calificación por parte de usuarios autenticados
- **Autenticación JWT**: registro e inicio de sesión, y un *interceptor HTTP* que adjunta el token a cada petición
- **Guard de rutas** (`esAdminGuard`) para proteger la administración de géneros, actores, cines, películas y usuarios
- CRUD completo con **formularios reactivos** validados, **carga de imágenes**, autocompletado de actores y **mapa interactivo** para ubicar los cines
- Servicios que implementan una interfaz CRUD genérica (`IServicioCRUD`) y componentes compartidos reutilizables

## Tecnologías

| Área | Tecnología |
| --- | --- |
| Framework | Angular 21 (componentes standalone), TypeScript 5.9 |
| Componentes UI | Angular Material, Angular CDK |
| Programación reactiva | RxJS 7 |
| Formularios | Formularios reactivos (`FormBuilder`) |
| Fechas | Moment.js + adaptador de Material |
| Mapas | Leaflet, `@bluehalo/ngx-leaflet` |
| Alertas | SweetAlert2 |
| Pruebas | Jasmine, Karma |

## Estructura del proyecto

```
src/
├── app/
│   ├── actores/  cines/  generos/  peliculas/   # Módulos por dominio (componentes + servicio)
│   ├── seguridad/      # Login, registro, servicio de autenticación e interceptor JWT
│   ├── compartidos/    # Componentes reutilizables, guards, interfaces y funciones
│   └── landing-page/
└── environments/       # Configuración por entorno (URL de la API)
```

## Cómo ejecutarlo

### Requisitos

- Una versión LTS actual de [Node.js](https://nodejs.org/) (20.19+ o 22.12+)
- La [Movies API](https://github.com/iliana212/API_Movies) en ejecución (sigue las instrucciones de su README)

### Instalación

```bash
git clone https://github.com/iliana212/Angular_Movies.git
cd Angular_Movies
npm install
```

### Configurar la URL de la API

La URL de la API se define en `src/environments/environment.development.ts`:

```ts
export const environment = {
    production: false,
    apiURL: 'https://localhost:44353/api'
};
```

Ajusta el puerto según cómo ejecutes la API: `44353` corresponde al perfil *IIS Express*; si usas `dotnet run --launch-profile https`, el valor es `https://localhost:7263/api`.

> La API solo acepta peticiones de los orígenes permitidos. Asegúrate de que `http://localhost:4200` (el puerto por defecto de Angular) esté en `origenesPermitidos` en la configuración de la API.

### Ejecutar en desarrollo

```bash
npm start
```

La aplicación estará disponible en `http://localhost:4200` y se recarga automáticamente al guardar cambios.

## Scripts disponibles

| Script | Descripción |
| --- | --- |
| `npm start` | Inicia el servidor de desarrollo (`ng serve`) |
| `npm run build` | Genera el build de producción en `dist/` |
| `npm run watch` | Recompila automáticamente con la configuración de desarrollo |
| `npm test` | Ejecuta las pruebas unitarias e integrales con Karma y Jasmine |

## Pruebas

El proyecto incluye pruebas unitarias e integrales (Jasmine + Karma) para sus rutas críticas:

- **Autenticación**: `SeguridadService` (login, registro, JWT, expiración de sesión)
- **Interceptor HTTP**: adjunta el token `Bearer` a cada petición
- **Guard de rutas**: `esAdminGuard`
- **Servicios HTTP**: `PeliculasService`, `GenerosService`
- **Funciones compartidas**: construcción de query params, extracción de errores del backend, validadores de formularios
- **Formularios y componentes**: validaciones, emisión de eventos y flujos de integración (login, alta de género)

Ejecutar la suite:

```bash
npm test
```

Cada push y pull request corre esta misma suite automáticamente vía GitHub Actions (ver `.github/workflows/tests.yml`).

## Proyectos relacionados

| Proyecto | Descripción |
| --- | --- |
| [API_Movies](https://github.com/iliana212/API_Movies) | Web API en ASP.NET Core (backend) |
| [React_Movies](https://github.com/iliana212/React_Movies) | Cliente en React + TypeScript |

## Autora

**Iliana Barron** — [@iliana212](https://github.com/iliana212)
