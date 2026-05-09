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

const handleAdsUpload = (req, res, next) => {
  adsUpload(req, res, (err) => {
    if (err) {
      return res.redirect("/canciones?error=" + encodeURIComponent(err.message));
    }
    if (!req.files || req.files.length === 0) {
      return res.redirect("/canciones?error=" + encodeURIComponent("No se seleccionaron archivos válidos"));
    }
    next();
  });
};

// Rutas del panel de anuncios
router.post(
  "/audios",
  verificarSesion,
  checkNetworkConnectivity,
  handleAdsUpload,
  insertAudios,
  controlInactividad
);

router.post("/audios/:id", verificarSesion, deleteAudios, controlInactividad);

// APIs
router.get("/api/anuncios", verificarSesion, anuncios);

module.exports = router;
