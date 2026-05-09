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
    const inserted = [];
    const duplicates = [];

    for (const file of files) {
      const { filename, path: filepath } = file;
      const filepathNormalized = filepath.replace(/\\/g, "/");

      if (await checkIfFileAdExists(filename)) {
        duplicates.push(filename);
        fs.unlink(filepath, () => {});
        continue;
      }

      await createAd(filename, filepathNormalized, dia);
      inserted.push(filename);
    }

    const params = new URLSearchParams();
    if (inserted.length > 0) {
      params.set("success", `${inserted.length} anuncio(s) subido(s) correctamente`);
    }
    if (duplicates.length > 0) {
      params.set("warning", `${duplicates.length} anuncio(s) ya existía(n): ${duplicates.join(", ")}`);
    }
    if (inserted.length === 0 && duplicates.length === 0) {
      params.set("error", "No se pudieron insertar los anuncios");
    }

    res.redirect("/canciones?" + params.toString());
  } catch (error) {
    console.error(`Error al insertar en la base de datos: ${error}`);
    res.redirect("/canciones?error=" + encodeURIComponent("Error al guardar los anuncios en la base de datos"));
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
