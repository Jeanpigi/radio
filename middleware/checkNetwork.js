const checkNetworkConnectivity = async (req, res, next) => {
  try {
    await fetch("https://www.google.com", { method: "head" });
    next();
  } catch (error) {
    console.error("Error de conectividad de red:", error);
    res.redirect("/canciones?error=" + encodeURIComponent("Sin conexión a internet. Verifique su red e intente de nuevo."));
  }
};

module.exports = { checkNetworkConnectivity };
