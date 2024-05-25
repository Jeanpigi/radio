const {
  createPlaylist,
  addSongsToPlaylist,
  getAllPlaylists,
  deletePlaylistById,
} = require("../model/playlistLite");

const createNewPlaylist = async (req, res) => {
  const { name, songs } = req.body;
  try {
    const playlistId = await createPlaylist(name);
    await addSongsToPlaylist(
      playlistId,
      songs.map((song) => song.id)
    );
    res
      .status(201)
      .json({ message: "Playlist creada exitosamente", playlistId });
  } catch (error) {
    console.error("Error al crear la playlist:", error);
    res.status(500).json({ error: "Hubo un problema al crear la playlist" });
  }
};

const getPlaylists = async (req, res) => {
  try {
    const playlists = await getAllPlaylists();
    res.status(200).json(playlists);
  } catch (error) {
    console.error("Error al obtener las playlists:", error);
    res
      .status(500)
      .json({ error: "Hubo un problema al obtener las playlists" });
  }
};

const deletePlaylist = async (req, res) => {
  const { id } = req.params;
  try {
    await deletePlaylistById(id);
    res.status(200).json({ message: "Playlist eliminada exitosamente" });
  } catch (error) {
    console.error("Error al eliminar la playlist:", error);
    res.status(500).json({ error: "Hubo un problema al eliminar la playlist" });
  }
};

module.exports = {
  createNewPlaylist,
  getPlaylists,
  deletePlaylist,
};
