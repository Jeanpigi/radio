const {
  checkIfFileMusicExists,
  getAllSongs,
  createSong,
  removeSong,
} = require("../model/songLite");

const fs = require("fs");

const canciones = async (req, res) => {
  try {
    const canciones = await getAllSongs();
    res.json(canciones);
  } catch (error) {
    console.log(`Error del parte del servidor ${error}`);
    res.json(error);
  }
};

const insertSong = async (req, res) => {
  try {
    const files = req.files;
    const inserted = [];
    const duplicates = [];

    for (const file of files) {
      const { filename, path: filepath } = file;
      const filepathNormalized = filepath.replace(/\\/g, "/");

      const songExists = await checkIfFileMusicExists(filename);
      if (songExists) {
        duplicates.push(filename);
        fs.unlink(filepath, () => {});
        continue;
      }

      await createSong(filename, filepathNormalized);
      inserted.push(filename);
    }

    const params = new URLSearchParams();
    if (inserted.length > 0) {
      params.set("success", `${inserted.length} canción(es) subida(s) correctamente`);
    }
    if (duplicates.length > 0) {
      params.set("warning", `${duplicates.length} archivo(s) ya existía(n): ${duplicates.join(", ")}`);
    }
    if (inserted.length === 0 && duplicates.length === 0) {
      params.set("error", "No se pudieron insertar las canciones");
    }

    res.redirect("/canciones?" + params.toString());
  } catch (error) {
    console.error(`Error al insertar en la base de datos: ${error}`);
    res.redirect("/canciones?error=" + encodeURIComponent("Error al guardar las canciones en la base de datos"));
  }
};

const deleteSong = async (req, res) => {
  const { id } = req.params;
  try {
    const song = await removeSong(id);
    if (song) {
      const filepath = song[0].filepath;

      fs.unlink(filepath, (err) => {
        if (err) {
          console.error(err);
        } else {
          console.log("Archivo eliminado exitosamente");
        }
      });
      res.redirect("/canciones");
    } else {
      console.log("La cancion no existe");
    }
  } catch (error) {
    console.error(
      `Ocurrió un error al momento de insertar en la base de datos ${error}`
    );
    res.redirect("/canciones");
  }
};

module.exports = {
  canciones,
  insertSong,
  deleteSong,
};
