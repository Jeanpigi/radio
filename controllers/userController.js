const {
  checkIfUsernameExists,
  createUser,
  getUserByUsername,
  comparePasswords,
  updateSessionToken,
} = require("../model/userLite");

const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const signup = async (req, res) => {
  const { username, password } = req.body;
  try {
    // Verifica si el usuario ya existe
    const usernameExists = await checkIfUsernameExists(username);
    if (usernameExists) {
      console.log("El nombre de usuario ya está en uso");
      return res.redirect("/signup");
    }

    // Crea un nuevo usuario
    await createUser(username, password);
    res.redirect("/");
  } catch (error) {
    console.log(`Error que se está presentando es ${error}`);
    return res.redirect("/signup");
  }
};

// Consulta de datos de usuario
const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await getUserByUsername(username);

    if (!user) {
      console.log("El nombre de usuario es incorrecto");
      return res.redirect("/");
    }

    const isPasswordCorrect = await comparePasswords(
      password,
      user[0].password
    );

    if (!isPasswordCorrect) {
      console.log("La contraseña es incorrecto");
      return res.redirect("/");
    }

    // Generar token de sesión único e invalidar sesiones anteriores
    const sessionToken = crypto.randomUUID();
    await updateSessionToken(user[0].id, sessionToken);

    const token = jwt.sign(
      { username: username, sessionToken },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", token);

    res.redirect("/canciones");
  } catch (error) {
    console.log(`Error que se está presentando en el usuario es: ${error}`);
    return res.redirect("/");
  }
};

module.exports = {
  signup,
  login,
};
