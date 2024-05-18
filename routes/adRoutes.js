const express = require("express");
const router = express.Router();

const {
  anuncios,
  insertAudios,
  deleteAudios,
} = require("../controllers/adController");

// Middlewares
const { controlInactividad } = require("../middleware/inactividad");
const { verificarSesion } = require("../middleware/verificacion");
const { checkNetworkConnectivity } = require("../middleware/checkNetwork");

const { adsUpload } = require("../utils/multerConfig");

// Rutas del panel de anuncios
router.post(
  "/audios",
  verificarSesion,
  checkNetworkConnectivity,
  adsUpload,
  insertAudios,
  controlInactividad
);

router.post("/audios/:id", verificarSesion, deleteAudios, controlInactividad);

// APIs
router.get("/api/anuncios", verificarSesion, anuncios);

module.exports = router;
