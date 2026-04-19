const express = require("express");
const router = express.Router();
const {
  createNewPlaylist,
  getPlaylists,
  deletePlaylist,
} = require("../controllers/playlistController");
const { verificarSesion } = require("../middleware/verificacion");

router.post("/api/playlist", verificarSesion, createNewPlaylist);
router.get("/api/playlists", verificarSesion, getPlaylists);
router.delete("/api/playlist/:id", verificarSesion, deletePlaylist);

module.exports = router;
