# Radio de Música Web

Radio online el cuál esta desarrollado con las tecnologías Node.js, Express y SqlLite. Esta aplicación avanzada permite a los usuarios disfrutar de su música favorita mientras brinda una experiencia fluida y confiable. Ambos servicios consumen la misma musica y anuncios.

## Características principales

- Registro de usuarios: Los usuarios pueden crear fácilmente una cuenta personal para acceder a todas las funcionalidades del reproductor de música.
- Inicio de sesión seguro: Con un sistema de autenticación robusto, los usuarios pueden iniciar sesión de manera segura en sus cuentas.
- Carga de canciones y anuncios: La aplicación permite a los usuarios autorizados cargar y almacenar sus canciones o anuncios en formato MP3 para acceder a ellas en cualquier momento y desde cualquier dispositivo.
- Reproducción de canciones y anuncios: Los usuarios pueden reproducir sus audios cargados sin problemas, brindando una experiencia auditiva excepcional.
- API para información de canciones: Además de las funcionalidades principales, la aplicación también proporciona una API intuitiva que permite a los desarrolladores obtener información detallada sobre las canciones almacenadas.
- Permite consumir el servicio de radio online, escuchando musica y anuncios.
- Permite crear playlists de reproducción.

## Requisitos previos

Antes de ejecutar la aplicación, asegúrate de tener instalado lo siguiente:

- Node.js (v20.13.1 o superior)
- Crear las carpetas correspondientes dentro de la carpeta public (music, audios, himno)

## Instalación

1. Clona este repositorio:

   ```bash
      git clone git@github.com:Jeanpigi/radio.git
   ```

2. Ve al directorio del proyecto:

   ```bash
      cd radio
   ```

3. Instala las dependencias:

   ```bash
      npm install
   ```

4. Configura la base de datos sqllite3:

- La forma básica, es crear el nombre de la base de datos, luego crear las tablas necesarias que para este caso serán: usuarios, canciones y anuncios. Nota: puedes crearla con una archivo .js en el directorio raíz del proyecto y correrlo con node.

```bash
     node db.js
```

- Las tablas que necesita son una para almacenar los usuarios, otra para alamacenar la ruta de la musica, y por último la tabla para alamcenar la ruta de los anuncios.

5. Configura las variables de entorno:

- Crea un archivo .env en el directorio raíz del proyecto.
- Copia el contenido del archivo .env.example y pégalo en el archivo .env
- Completa las variables de entorno con tus propios , estos valores son los que permiten el acceso a la base de datos.

### Nota

los servicios se dividen en dos, en el reproductor y la radio online, dependiendo del servicio que se requiera utilizar, asi mismo se debe correr el servidor, de igual manera puedes correr ambos servicios al mismo tiempo.

6. Inicia el servidor:

   ```bash
      npm run start
   ```

7. Accede a la aplicación en tu navegador web en la siguiente URL: http://localhost:3000

## Uso

1. Regístrate en la aplicación para crear una cuenta de usuario.
2. Inicia sesión con tu cuenta de usuario.
3. Carga canciones en formato MP3 desde la sección de administración.
4. Carga anuncios en formato MP3 desde la sección de administración.
5. Reproduce las canciones en el reproductor.
6. Reproduce audio mediante la radio online.
7. Utiliza la API para obtener información sobre las canciones.
8. Crear playlists de reproducción.

## API

La aplicación proporciona las siguientes rutas de la API:

- `GET /api/canciones`: Obtiene todas las canciones.
- `GET /api/anuncios`: Obtiene todos los anuncios.
- `GET /api/canciones/:id`: Obtiene una cancion por su ID.
- `GET /api/anuncios/:id`: Obtiene un anuncio por su ID.
- `GET /api/playlist/:id`: Obtiene una playlist por su ID.

## Contribución

Si deseas contribuir a este proyecto y ayudarlo a crecer, sigue estos pasos:

1. Crea un fork de este repositorio.
2. Crea una nueva rama con un nombre descriptivo: `git checkout -b nombre_de_rama`.
3. Realiza las modificaciones necesarias y realiza los commits correspondientes.
4. Envía tus cambios al repositorio remoto: `git push origin nombre_de_rama`.
5. Abre un pull request para revisar tus cambios y fusionarlos con la rama principal.

# Authors

- **Jean Pierre Giovanni Arenas Ortiz**

## Licencia

Esta obra está bajo una [Licencia Creative Commons Atribución-NoComercial-SinDerivadas 4.0 Internacional](http://creativecommons.org/licenses/by-nc-nd/4.0/deed.es_ES).
