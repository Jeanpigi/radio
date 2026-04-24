const { getAllSongs } = require("../model/songLite");
const { getAllAds } = require("../model/adLite");

const getRadioPanel = async (req, res) => {
  try {
    const [canciones, anuncios] = await Promise.all([getAllSongs(), getAllAds()]);
    const cancionesConPath = canciones.map((c) => ({
      ...c,
      path: decodeURIComponent(c.filepath).replace("public/", ""),
    }));
    const anunciosConPath = anuncios.map((a) => ({
      ...a,
      path: decodeURIComponent(a.filepath).replace("public/", ""),
    }));
    res.render("radio", {
      canciones: cancionesConPath,
      anuncios: anunciosConPath,
      isAdmin: !!req.user.isAdmin,
      username: req.user.username,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error del servidor");
  }
};

module.exports = { getRadioPanel };
