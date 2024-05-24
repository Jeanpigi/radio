const {
  createPlaylist,
  addSongsToPlaylist,
  getAllPlaylists,
} = require("../model/playlistLite");

const createNewPlaylist = async (req, res) => {
  const { name, songs } = req.body;
  console.log("Nombre de la playlist:", name); // Añade esta línea para depurar
  console.log("Canciones:", songs); // Añade esta línea para depurar
  console.log(name, songs);
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

module.exports = {
  createNewPlaylist,
  getPlaylists,
};
