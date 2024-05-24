const {
  insertPlaylist,
  insertSongsToPlaylist,
} = require("../model/playlistLite");

const createPlaylists = async (req, res) => {
  try {
    const { name } = req.body;
    await insertPlaylist(name);
    res.redirect("api/playlists");
  } catch (error) {
    console.log("Error en createPlaylist:", error);
  }
};

const addSongsToPlaylist = async (req, res) => {
  const { playlistId } = req.params;
  const { songIds } = req.body;
  try {
    await insertSongsToPlaylist(playlistId, songIds);
    res.redirect("/playlists");
  } catch (error) {
    console.log("Error en addSongsToPlaylist:", error);
  }
};

module.exports = {
  addSongsToPlaylist,
  createPlaylists,
};
