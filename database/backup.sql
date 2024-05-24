PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE canciones (
      id INTEGER PRIMARY KEY,
      filename TEXT,
      filepath TEXT
);

CREATE TABLE anuncios (
      id INTEGER PRIMARY KEY,
      filename TEXT,
      filepath TEXT,
      dia TEXT NOT NULL
);

CREATE TABLE users (
      id INTEGER PRIMARY KEY,
      username TEXT NOT NULL,
      password TEXT NOT NULL
);
CREATE TABLE playlists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE playlist_songs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    playlist_id INTEGER NOT NULL,
    song_id INTEGER NOT NULL,
    FOREIGN KEY (playlist_id) REFERENCES playlists(id),
    FOREIGN KEY (song_id) REFERENCES canciones(id)
);
DELETE FROM sqlite_sequence;
COMMIT;
