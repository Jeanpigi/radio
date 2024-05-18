// Middleware de control de inactividad y cierre de sesión automático
const controlInactividad = (req, res, next) => {
  req.session.touch();

  const tiempoInactividad = 600000;
  const { temporizador } = req.session;

  clearTimeout(temporizador);

  req.session.temporizador = setTimeout(() => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Error al cerrar la sesión:", err);
        return res
          .status(500)
          .send("Error al cerrar la sesión automáticamente.");
      }

      console.log(
        "La sesión se cerró automáticamente debido a la inactividad."
      );
      return res.redirect("/");
    });
  }, tiempoInactividad);

  next();
};

module.exports = {
  controlInactividad,
};
