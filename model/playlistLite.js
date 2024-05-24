const { db } = require("../database/sqlLite");

const createPlaylist = (name) => {
  return new Promise((resolve, reject) => {
    db.run("INSERT INTO playlists (name) VALUES (?)", [name], function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.lastID); // Obtener el ID de la nueva playlist
      }
    });
  });
};

const addSongsToPlaylist = (playlistId, songIds) => {
  return new Promise((resolve, reject) => {
    const placeholders = songIds.map(() => "(?, ?)").join(",");
    const sql = `INSERT INTO playlist_songs (playlist_id, song_id) VALUES ${placeholders}`;
    const values = [];
    songIds.forEach((id) => {
      values.push(playlistId, id);
    });

    db.run(sql, values, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

const getAllPlaylists = () => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT playlists.id AS playlist_id, playlists.name AS playlist_name, canciones.id AS song_id, canciones.filename, canciones.filepath
      FROM playlist_songs
      INNER JOIN playlists ON playlist_songs.playlist_id = playlists.id
      INNER JOIN canciones ON playlist_songs.song_id = canciones.id;
    `;

    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        const playlists = rows.reduce((acc, row) => {
          const { playlist_id, playlist_name, song_id, filename, filepath } =
            row;
          if (!acc[playlist_id]) {
            acc[playlist_id] = {
              id: playlist_id,
              name: playlist_name,
              songs: [],
            };
          }
          acc[playlist_id].songs.push({ id: song_id, filename, filepath });
          return acc;
        }, {});
        resolve(Object.values(playlists));
      }
    });
  });
};

module.exports = {
  createPlaylist,
  addSongsToPlaylist,
  getAllPlaylists,
};
