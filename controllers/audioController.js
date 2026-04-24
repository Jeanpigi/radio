const { getAllSongs } = require("../model/songLite");
const { getAllAds } = require("../model/adLite");

const getAll = async (req, res) => {
  try {
    const canciones = await getAllSongs();
    const anuncios = await getAllAds();
    res.render("dashboard", {
      canciones,
      anuncios,
      isAdmin: !!(req.user && req.user.isAdmin),
    });
  } catch (error) {
    console.error(error);
    res.send("Error del parte del servidor");
  }
};

module.exports = { getAll };
