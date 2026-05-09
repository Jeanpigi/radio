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

const handleMusicUpload = (req, res, next) => {
  musicUpload(req, res, (err) => {
    if (err) {
      return res.redirect("/canciones?error=" + encodeURIComponent(err.message));
    }
    if (!req.files || req.files.length === 0) {
      return res.redirect("/canciones?error=" + encodeURIComponent("No se seleccionaron archivos válidos"));
    }
    next();
  });
};

// Rutas de canciones
router.get("/canciones", verificarSesion, getAll, controlInactividad);

router.post(
  "/canciones",
  verificarSesion,
  checkNetworkConnectivity,
  handleMusicUpload,
  insertSong,
  controlInactividad
);

router.post("/canciones/:id", verificarSesion, deleteSong, controlInactividad);

// APIs
router.get("/api/canciones", verificarSesion, canciones);

module.exports = router;
