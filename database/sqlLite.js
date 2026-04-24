const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./database/player.db");

// Migración: agregar columna session_token si no existe
db.run("ALTER TABLE users ADD COLUMN session_token TEXT", (err) => {
  if (err && !err.message.includes("duplicate column")) {
    console.error("Migración session_token:", err.message);
  }
});

// Migración: agregar columna is_admin si no existe
db.run("ALTER TABLE users ADD COLUMN is_admin INTEGER DEFAULT 0", (err) => {
  if (err && !err.message.includes("duplicate column")) {
    console.error("Migración is_admin:", err.message);
  } else if (!err) {
    db.run("UPDATE users SET is_admin = 1 WHERE id = (SELECT MIN(id) FROM users)");
  }
});

module.exports = {
  db,
};
