const moment = require("moment-timezone");
function obtenerDiaActualEnColombia() {
  return moment().tz("America/Bogota").locale("es").format("ddd");
}

module.exports = { obtenerDiaActualEnColombia };
