const express = require("express");
const router = express.Router();

const { signup, login } = require("../controllers/userController");
const { updateSessionToken, getUserByUsername } = require("../model/userLite");
// Middlewares
const { verificarSesion } = require("../middleware/verificacion");
const jwt = require("jsonwebtoken");

// Ruta de registro y inicio de sesión de usuario
router.get("/signup", verificarSesion, (req, res) => {
  res.render("signup");
});

router.post("/signup", verificarSesion, signup);

router.get("/login", (req, res) => {
  res.render("login");
});

router.post("/login", login);

// Ruta para el cierre de sesión
router.get("/logout", async (req, res) => {
  try {
    const token = req.cookies.token;
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const users = await getUserByUsername(decoded.username);
      if (users.length > 0) {
        await updateSessionToken(users[0].id, null);
      }
    }
  } catch (_) {}
  res.clearCookie("token");
  res.redirect("/");
});

module.exports = router;
