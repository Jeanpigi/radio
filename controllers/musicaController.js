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
    const insertedSongs = [];

    for (const file of files) {
      const { filename, path: filepath } = file;
      const filepathNormalized = filepath.replace(/\\/g, "/");

      const songExists = await checkIfFileMusicExists(filename);
      if (songExists) {
        return res.send(`La canción '${filename}' ya existe`);
      }

      const song = await createSong(filename, filepathNormalized);

      if (song) {
        insertedSongs.push(filename);
      }
    }

    const resultMessage =
      insertedSongs.length > 0
        ? `Se completó la carga de las canciones ${insertedSongs}`
        : "No se insertaron nuevos canciones";
    console.log(resultMessage);

    res.redirect("/canciones");
  } catch (error) {
    console.error(
      `Ocurrió un error al momento de insertar en la base de datos ${error}`
    );
    res.redirect("/canciones");
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
