const { getAllSongs } = require("../model/songLite");
const { getAllAds } = require("../model/adLite");
const { getAllPlaylists } = require("../model/playlistLite");

const getAll = async (req, res) => {
  try {
    const canciones = await getAllSongs();
    const anuncios = await getAllAds();
    const playlists = await getAllPlaylists();
    res.render("dashboard", {
      canciones,
      anuncios,
      playlists,
      isAdmin: !!(req.user && req.user.isAdmin),
    });
  } catch (error) {
    console.error(error);
    res.send("Error del parte del servidor");
  }
};

module.exports = { getAll };
