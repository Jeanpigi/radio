const express = require("express");
const router = express.Router();
const {
  createNewPlaylist,
  getPlaylists,
} = require("../controllers/playlistController");

// Ruta para crear una nueva playlist
router.post("/api/playlist", createNewPlaylist);

// Ruta para obtener todas las playlists con sus canciones
router.get("/api/playlists", getPlaylists);

module.exports = router;
