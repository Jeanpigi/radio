const NodeCache = require("node-cache");
const { getAllSongs } = require("../model/songLite");
const { getAllAds } = require("../model/adLite");
// Configura el tiempo de vida (TTL) de la caché en segundos, por ejemplo, 2 horas (7200 segundos)
const myCache = new NodeCache({ stdTTL: 7200 });

async function getCachedSongs() {
  const key = "allSongs";
  // Intenta obtener los datos de la caché
  const cachedSongs = myCache.get(key);
  if (cachedSongs) {
    // Si hay datos en caché, devuélvelos
    return cachedSongs;
  } else {
    // Si no hay datos en caché, consulta la base de datos
    const songs = await getAllSongs();
    // Almacena el resultado en caché para futuras solicitudes
    myCache.set(key, songs);
    return songs;
  }
}

async function getCachedAds() {
  const key = "allAds";
  const cachedAds = myCache.get(key);
  if (cachedAds) {
    return cachedAds;
  } else {
    const ads = await getAllAds();
    myCache.set(key, ads);
    return ads;
  }
}

// Exportar un objeto con todas las funciones
module.exports = {
  getCachedSongs,
  getCachedAds,
};
