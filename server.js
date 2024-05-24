require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const path = require("path");
const exphbs = require("express-handlebars");
const compression = require("express-compression");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");

// Rutas
const homeRoutes = require("./routes/homeRoutes");
const userRoutes = require("./routes/userRoutes");
const songRoutes = require("./routes/songRoutes");
const adRoutes = require("./routes/adRoutes");
const playerRoutes = require("./routes/playerRoutes");
const errorRoutes = require("./routes/errorRoutes");
const playlistRoutes = require("./routes/playlistRoutes");

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3000;

app.use(morgan("tiny"));
app.use(express.json());
app.use(cors());
app.use(compression());

// Configurar cookie-parser con la misma clave secreta
app.use(cookieParser());

// Configuración de Handlebars como motor de plantillas
app.set("views", path.join(__dirname, "views"));
app.engine(
  ".hbs",
  exphbs.create({
    defaultLayout: "main",
    extname: ".hbs",
    partialsDir: __dirname + "/views/partials/",
  }).engine
);
app.set("view engine", ".hbs");

// Middleware para procesar datos del formulario
app.use(express.urlencoded({ extended: true }));

// Configuración para archivos estáticos (con manejo de caché)
app.use(
  express.static(path.join(__dirname, "public"), {
    // maxAge: "1d", // Establece un tiempo de vida de caché de 1 día para archivos estáticos
    maxAge: 600000, // Establece un tiempo de vida de caché de 10 minutos
  })
);

app.use("/js", express.static("public/js"));
app.use("/css", express.static("public/css"));
app.use("/music", express.static("public/music"));
app.use("/audios", express.static("public/audios"));
app.use("/himno", express.static("public/himno"));
app.use("/assets", express.static("public/assets"));

// Manejo de cache
app.use((req, res, next) => {
  // Configuración de cabeceras de caché
  res.set("Cache-Control", "no-store");
  next();
});

// Rutas
app.use("/", playlistRoutes);
app.use("/", homeRoutes);
app.use("/", userRoutes);
app.use("/", playerRoutes);
app.use("/", songRoutes);
app.use("/", adRoutes);
app.use("/", errorRoutes);

// Importar y configurar sockets
const socketHandler = require("./utils/sockets");
socketHandler(server);

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
