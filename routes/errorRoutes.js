const express = require("express");
const router = express.Router();

// Ruta de manejo de errores 404
router.use((req, res) => {
  res.status(404).render("404", { mensaje: "Página no encontrada" });
});

module.exports = router;
