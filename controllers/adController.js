const {
  getAllAds,
  createAd,
  checkIfFileAdExists,
  removeAd,
} = require("../model/adLite");

const fs = require("fs");

const anuncios = async (req, res) => {
  try {
    const anuncios = await getAllAds();
    console.log(anuncios);
    res.json(anuncios);
  } catch (error) {
    console.error(error);
    res.send("Error del parte del servidor");
  }
};

const getAudios = async (req, res) => {
  try {
    const query = "SELECT * FROM anuncios";
    const [rows] = await pool.execute(query);
    res.render("test", { rows });
  } catch (error) {
    console.error(error);
    res.send("Error del parte del servidor");
  }
};

const insertAudios = async (req, res) => {
  try {
    const files = req.files;
    const { dia } = req.body;
    const insertedAudios = [];

    for (let file of files) {
      const { filename, path } = file;
      const filepathNormalized = path.replace(/\\/g, "/");

      if (await checkIfFileAdExists(filename)) {
        return res.send(`El anuncio '${filename}' ya existe`);
      }

      await createAd(filename, filepathNormalized, dia);

      insertedAudios.push(filename);
    }

    const resultMessage =
      insertedAudios.length > 0
        ? `Se completó la carga de los audios: ${insertedAudios}`
        : "No se insertaron nuevos audios";
    console.log(resultMessage);

    res.redirect("/canciones");
  } catch (error) {
    console.error(
      `Ocurrió un error al momento de insertar en la base de datos ${error}`
    );
    res.redirect("/canciones");
  }
};

const deleteAudios = async (req, res) => {
  const { id } = req.params;
  try {
    const anuncio = await removeAd(id);
    if (anuncio) {
      const filepath = anuncio[0].filepath;

      fs.unlink(filepath, (err) => {
        if (err) {
          console.error(err);
        } else {
          console.log("Archivo eliminado exitosamente");
        }
      });
      res.redirect("/canciones");
    } else {
      console.log("La audio no existe");
    }
  } catch (error) {
    console.error(
      `Ocurrió un error al momento de insertar en la base de datos ${error}`
    );
    res.redirect("/canciones");
  }
};

module.exports = {
  insertAudios,
  deleteAudios,
  getAudios,
  anuncios,
};
