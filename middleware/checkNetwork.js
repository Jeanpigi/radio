const checkNetworkConnectivity = async (req, res, next) => {
  try {
    await fetch("https://www.google.com", { method: "head" });
    next(); // Continúa con el siguiente middleware si la conexión es exitosa
  } catch (error) {
    console.error("Error de conectividad de red:", error);
    res
      .status(503)
      .send("Servicio no disponible. Verifique su conexión de red.");
  }
};

module.exports = { checkNetworkConnectivity };
