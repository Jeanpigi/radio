const { db } = require("../database/sqlLite");
const bcrypt = require("bcrypt");

const checkIfUsernameExists = async (username) => {
  try {
    const users = await new Promise((resolve, reject) => {
      db.all(
        "SELECT * FROM users WHERE username = ?",
        [username],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        }
      );
    });
    return users.length > 0;
  } catch (error) {
    console.error("Error en checkIfUsernameExists:", error);
    throw error;
  }
};

const createUser = async (username, password) => {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await new Promise((resolve, reject) => {
      db.run(
        "INSERT INTO users (username, password) VALUES (?, ?)",
        [username, hashedPassword],
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
    console.error("Error en createUser:", error);
    throw error;
  }
};

const getUserByUsername = async (username) => {
  try {
    const users = await new Promise((resolve, reject) => {
      db.all(
        "SELECT * FROM users WHERE username = ?",
        [username],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        }
      );
    });
    return users;
  } catch (error) {
    console.error("Error en getUser:", error);
    throw error;
  }
};

const comparePasswords = async (password, hashedPassword) => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    console.error("Error en comparePasswords:", error);
    throw error;
  }
};

const updateSessionToken = async (userId, token) => {
  return new Promise((resolve, reject) => {
    db.run(
      "UPDATE users SET session_token = ? WHERE id = ?",
      [token, userId],
      (err) => (err ? reject(err) : resolve())
    );
  });
};

const getSessionTokenByUsername = async (username) => {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT session_token FROM users WHERE username = ?",
      [username],
      (err, row) => (err ? reject(err) : resolve(row ? row.session_token : null))
    );
  });
};

const getAllUsers = async () => {
  return new Promise((resolve, reject) => {
    db.all(
      "SELECT id, username, is_admin FROM users ORDER BY id",
      (err, rows) => (err ? reject(err) : resolve(rows || []))
    );
  });
};

const deleteUserById = async (id) => {
  return new Promise((resolve, reject) => {
    db.run("DELETE FROM users WHERE id = ?", [id], function (err) {
      if (err) reject(err);
      else resolve(this.changes);
    });
  });
};

module.exports = {
  checkIfUsernameExists,
  createUser,
  getUserByUsername,
  comparePasswords,
  updateSessionToken,
  getSessionTokenByUsername,
  getAllUsers,
  deleteUserById,
};
