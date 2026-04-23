const express = require("express");
const router = express.Router();
const { verificarSesion } = require("../middleware/verificacion");
const { getRadioPanel } = require("../controllers/radioController");
const mixerStream = require("../utils/mixerStream");

router.get("/radio", verificarSesion, getRadioPanel);

// Stream de audio en vivo del mixer — público, sin auth
router.get("/stream/mixer", (req, res) => {
  // Deshabilitar el algoritmo de Nagle: los chunks pequeños (~2KB) se envían inmediatamente
  req.socket.setNoDelay(true);
  res.setHeader("Content-Type", "audio/webm");
  res.setHeader("Cache-Control", "no-cache, no-store");
  res.setHeader("Content-Encoding", "identity"); // sin compresión en el stream
  res.flushHeaders();
  mixerStream.addClient(res);
  req.on("close", () => mixerStream.removeClient(res));
});

module.exports = router;
