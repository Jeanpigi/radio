require("dotenv").config({ path: require("path").join(__dirname, ".env") });
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
const radioRoutes = require("./routes/radioRoutes");
const adminRoutes = require("./routes/adminRoutes");

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

// Archivos de media — cachear 10 minutos (son pesados y no cambian seguido)
const mediaCache = { maxAge: 600000 };
app.use("/music", express.static(path.join(__dirname, "public/music"), mediaCache));
app.use("/audios", express.static(path.join(__dirname, "public/audios"), mediaCache));
app.use("/himno", express.static(path.join(__dirname, "public/himno"), mediaCache));
app.use("/assets", express.static(path.join(__dirname, "public/assets"), mediaCache));

// JS, CSS y demás estáticos — sin caché para que siempre tome los cambios
app.use(express.static(path.join(__dirname, "public"), { maxAge: 0 }));

// Rutas
app.use("/", adminRoutes);
app.use("/", playlistRoutes);
app.use("/", radioRoutes);
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
