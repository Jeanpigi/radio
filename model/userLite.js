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

module.exports = {
  checkIfUsernameExists,
  createUser,
  getUserByUsername,
  comparePasswords,
};
