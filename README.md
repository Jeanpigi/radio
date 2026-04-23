# Radio Online

Radio online desarrollada con Node.js, Express, SQLite3 y WebSockets. Permite transmitir música y anuncios en tiempo real a todos los oyentes conectados, con un panel de administración completo y un mixer en vivo para transmisiones de voz.

## Características

- **Radio en tiempo real**: Reproducción sincronizada vía WebSockets para todos los oyentes conectados.
- **Mixer en vivo**: Transmisión de audio en vivo desde el micrófono del administrador (WebM/Opus vía MediaRecorder).
- **Gestión de canciones y anuncios**: Carga y administración de archivos MP3 desde el panel de administración.
- **Inserción de anuncios**: Sistema de prioridad ponderada que inserta anuncios entre canciones, evitando repeticiones inmediatas.
- **Playlists**: Creación y gestión de listas de reproducción.
- **Himno nacional**: Reproducción automática del himno a las 6:00, 12:00, 18:00 y 00:00 (zona horaria Colombia) vía `node-cron`.
- **Autenticación**: Registro e inicio de sesión con bcrypt + JWT en cookies/sesiones.
- **API REST**: Endpoints para consultar canciones, anuncios y playlists.

## Stack

| Capa | Tecnología |
|------|-----------|
| Backend | Express 4, Node.js |
| Base de datos | SQLite3 |
| Tiempo real | ws (WebSockets) |
| Streaming | HTTP chunked (audio/webm) |
| Vistas | Handlebars (SSR) |
| Auth | bcrypt + JWT + express-session |
| Tareas programadas | node-cron |

## Arquitectura

```
server.js                 # Punto de entrada — Express, WebSocket upgrade, static files
├── routes/               # Definición de rutas
│   ├── homeRoutes.js     # Página del oyente
│   ├── radioRoutes.js    # Panel de radio + stream del mixer
│   ├── playerRoutes.js   # Reproductor
│   ├── songRoutes.js     # CRUD canciones
│   ├── adRoutes.js       # CRUD anuncios
│   ├── playlistRoutes.js # CRUD playlists
│   └── userRoutes.js     # Registro/login
├── controllers/          # Lógica de negocio
├── model/                # Acceso a datos (SQL directo sobre SQLite3)
├── middleware/            # Verificación de sesión, red, inactividad
├── utils/
│   ├── sockets.js        # Core: WebSocket server, sincronización, rotación, cron
│   ├── mixerStream.js    # Streaming HTTP para audio en vivo del mixer
│   ├── multerConfig.js   # Configuración de uploads (Multer)
│   └── ...
├── views/                # Templates Handlebars
│   ├── layouts/main.hbs  # Layout principal
│   ├── home.hbs          # Página del oyente
│   ├── radio.hbs         # Panel de administración
│   └── ...
├── public/
│   ├── css/              # Estilos
│   ├── js/               # Scripts del cliente
│   │   ├── radioListener.js  # Cliente oyente (WebSocket + audio)
│   │   └── radioAdmin.js     # Panel admin (mixer, controles)
│   ├── assets/           # Logo, favicon
│   ├── music/            # Archivos MP3 de canciones
│   ├── audios/           # Archivos MP3 de anuncios
│   └── himno/            # Himno nacional
└── database/
    ├── sqlLite.js        # Conexión SQLite3
    └── player.db         # Base de datos
```

## Requisitos previos

- Node.js v20.13.1 o superior
- Crear las carpetas de media dentro de `public/` si no existen: `music/`, `audios/`, `himno/`

## Instalación

```bash
git clone git@github.com:Jeanpigi/radio.git
cd radio
npm install
```

### Base de datos

Crear la base de datos SQLite3 con las tablas necesarias (usuarios, canciones, anuncios):

```bash
node db.js
```

### Variables de entorno

Crear un archivo `.env` en la raíz del proyecto con las variables necesarias para la configuración de la base de datos y JWT.

### Ejecutar

```bash
# Desarrollo (hot-reload)
npm run dev

# Producción
npm start
```

La aplicación estará disponible en `http://localhost:3000`.

## Uso

1. Registrarse e iniciar sesión.
2. Subir canciones y anuncios en formato MP3 desde el panel de administración.
3. Crear playlists y gestionar la rotación de contenido.
4. Los oyentes acceden a la página principal y presionan play para escuchar la radio.
5. Activar el mixer desde el panel de administración para transmitir audio en vivo.

## API

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/canciones` | Obtener todas las canciones |
| GET | `/api/canciones/:id` | Obtener una canción por ID |
| GET | `/api/anuncios` | Obtener todos los anuncios |
| GET | `/api/anuncios/:id` | Obtener un anuncio por ID |
| GET | `/api/playlist/:id` | Obtener una playlist por ID |

## Contribución

1. Crear un fork del repositorio.
2. Crear una rama: `git checkout -b nombre_de_rama`.
3. Realizar los cambios y commits.
4. Push: `git push origin nombre_de_rama`.
5. Abrir un pull request.

## Autor

**Jean Pierre Giovanni Arenas Ortiz**

## Licencia

[Creative Commons Atribución-NoComercial-SinDerivadas 4.0 Internacional](http://creativecommons.org/licenses/by-nc-nd/4.0/deed.es_ES)
