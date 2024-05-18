const { db } = require("../database/sqlLite");

const checkIfFileAdExists = async (filename) => {
  try {
    const ad = await new Promise((resolve, reject) => {
      db.all(
        "SELECT filename FROM anuncios WHERE filename = ?",
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
    return ad.length > 0;
  } catch (error) {
    console.error("Error en checkIfFileAdExists:", error);
    throw error;
  }
};

const createAd = async (filename, filepath, selectedDia) => {
  try {
    await new Promise((resolve, reject) => {
      db.run(
        "INSERT INTO anuncios (filename, filepath, dia) VALUES (?, ?, ?)",
        [filename, filepath, selectedDia],
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  } catch (error) {
    console.error("Error en createAd:", error);
    throw error;
  }
};

const getAllAds = async () => {
  try {
    const anuncios = await new Promise((resolve, reject) => {
      db.all("SELECT * FROM anuncios", (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
    return anuncios;
  } catch (error) {
    console.error("Error en getAllAds:", error);
    throw error;
  }
};

const removeAd = async (id) => {
  try {
    const adExist = await new Promise((resolve, reject) => {
      db.all(
        "SELECT filepath FROM anuncios WHERE id = ?",
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
    if (!adExist || adExist.length === 0) {
      console.log("El anuncio no existe");
      return null;
    }
    await new Promise((resolve, reject) => {
      db.run("DELETE FROM anuncios WHERE id = ?", [id], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
    return adExist;
  } catch (error) {
    console.error("Error en removeAd:", error);
    throw error;
  }
};

module.exports = {
  checkIfFileAdExists,
  createAd,
  getAllAds,
  removeAd,
};
