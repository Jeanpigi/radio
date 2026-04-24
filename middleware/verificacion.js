const jwt = require("jsonwebtoken");
const { getSessionTokenByUsername } = require("../model/userLite");

const verificarSesion = async (req, res, next) => {
  const token = req.cookies.token;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const storedToken = await getSessionTokenByUsername(decoded.username);
    if (!storedToken || storedToken !== decoded.sessionToken) {
      res.clearCookie("token");
      return res.redirect("/");
    }
    req.user = decoded;
    next();
  } catch (err) {
    res.clearCookie("token");
    return res.redirect("/");
  }
};

const verificarAdmin = async (req, res, next) => {
  const token = req.cookies.token;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const storedToken = await getSessionTokenByUsername(decoded.username);
    if (!storedToken || storedToken !== decoded.sessionToken) {
      res.clearCookie("token");
      return res.redirect("/");
    }
    if (!decoded.isAdmin) {
      return res.status(403).send("Acceso denegado");
    }
    req.user = decoded;
    next();
  } catch (err) {
    res.clearCookie("token");
    return res.redirect("/");
  }
};

module.exports = {
  verificarSesion,
  verificarAdmin,
};
