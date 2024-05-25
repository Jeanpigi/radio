const express = require("express");
const router = express.Router();
const {
  createNewPlaylist,
  getPlaylists,
  deletePlaylist,
} = require("../controllers/playlistController");

// Ruta para crear una nueva playlist
router.post("/api/playlist", createNewPlaylist);

// Ruta para obtener todas las playlists con sus canciones
router.get("/api/playlists", getPlaylists);

// Ruta para eliminar una playlist
router.delete("/api/playlist/:id", deletePlaylist);

module.exports = router;
