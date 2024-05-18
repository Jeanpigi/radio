const express = require("express");
const router = express.Router();

const {
  canciones,
  insertSong,
  deleteSong,
} = require("../controllers/musicaController");

const { getAll } = require("../controllers/audioController");

// Middlewares
const { controlInactividad } = require("../middleware/inactividad");
const { verificarSesion } = require("../middleware/verificacion");
const { checkNetworkConnectivity } = require("../middleware/checkNetwork");

const { musicUpload } = require("../utils/multerConfig");

// Rutas de canciones
router.get("/canciones", verificarSesion, getAll, controlInactividad);

router.post(
  "/canciones",
  verificarSesion,
  checkNetworkConnectivity,
  musicUpload,
  insertSong,
  controlInactividad
);

router.post("/canciones/:id", verificarSesion, deleteSong, controlInactividad);

// APIs
router.get("/api/canciones", verificarSesion, canciones);

module.exports = router;
