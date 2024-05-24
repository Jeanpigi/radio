const { db } = require("../database/sqlLite");
// Función para crear una nueva playlist
const insertPlaylist = async (name) => {
  try {
    await new Promise((resolve, reject) => {
      db.run("INSERT INTO playlists (name) VALUES (?)", [name], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  } catch (error) {
    console.error("Error en createPlaylist:", error);
    throw error;
  }
};

// Función para agregar canciones a la playlist
const insertSongsToPlaylist = async (playlistId, songIds) => {
  try {
    await new Promise((resolve, reject) => {
      db.run(
        "INSERT INTO playlist_songs (playlist_id, song_id) VALUES (?, ?)",
        [playlistId, songIds],
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
    console.error("Error en addSongsToPlaylist:", error);
    throw error;
  }
};

module.exports = {
  insertPlaylist,
  insertSongsToPlaylist,
};
