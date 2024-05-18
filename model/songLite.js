const { db } = require("../database/sqlLite");

const checkIfFileMusicExists = async (filename) => {
  try {
    const cancion = await new Promise((resolve, reject) => {
      db.all(
        "SELECT filename FROM canciones WHERE filename = ?",
        [filename],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        }
      );
    });
    return cancion.length > 0;
  } catch (error) {
    console.error("Error en checkIfFileSongExists:", error);
    throw error;
  }
};

const createSong = async (filename, filepath) => {
  return new Promise((resolve, reject) => {
    db.run(
      "INSERT INTO canciones (filename, filepath) VALUES (?, ?)",
      [filename, filepath],
      (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      }
    );
  });
};

const getAllSongs = async () => {
  try {
    const canciones = await new Promise((resolve, reject) => {
      db.all("SELECT * FROM canciones", (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
    return canciones;
  } catch (error) {
    console.error("Error en getAllSongs:", error);
    throw error;
  }
};

const removeSong = async (id) => {
  try {
    const songExist = await new Promise((resolve, reject) => {
      db.all(
        "SELECT filepath FROM canciones WHERE id = ?",
        [id],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        }
      );
    });
    if (!songExist || songExist.length === 0) {
      console.log("El cancion no existe");
      return null;
    }
    await new Promise((resolve, reject) => {
      db.run("DELETE FROM canciones WHERE id = ?", [id], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
    return songExist;
  } catch (error) {
    console.error("Error en removeSong:", error);
    throw error;
  }
};

module.exports = {
  checkIfFileMusicExists,
  createSong,
  getAllSongs,
  removeSong,
};
