const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./database/player.db");

// Migración: agregar columna session_token si no existe
db.run("ALTER TABLE users ADD COLUMN session_token TEXT", (err) => {
  if (err && !err.message.includes("duplicate column")) {
    console.error("Migración session_token:", err.message);
  }
});

module.exports = {
  db,
};
