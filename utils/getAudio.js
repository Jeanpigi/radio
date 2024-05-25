const { obtenerDiaActualEnColombia } = require("./getDay");
const { getNumberMusic, getNumberAds } = require("./getMaxRecent");

const MAX_RECENT_ITEMS = getNumberMusic();
const MAX_RECENT_ITEMS_ADS = getNumberAds();

const obtenerAudioAleatoria = (array) => {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
};

const obtenerAudioAleatoriaSinRepetir = (array, recentlyPlayed) => {
  const availableOptions = array.filter((item) => {
    const fileName = item.filename;
    // Compara el nombre del archivo con los nombres de archivos reproducidos recientemente
    return !recentlyPlayed.some(
      (playedItem) => playedItem.filename === fileName
    );
  });

  if (availableOptions.length === 0) {
    // Si ya se han reproducido todas las opciones, reiniciar el registro
    recentlyPlayed.length = 0;
    return obtenerAudioAleatoriaSinRepetir(array, recentlyPlayed);
  }

  const randomItem = obtenerAudioAleatoria(availableOptions);
  recentlyPlayed.push(randomItem);

  if (recentlyPlayed.length > MAX_RECENT_ITEMS) {
    recentlyPlayed.shift();
  }

  console.log("-----------------------------------------------------------");
  console.log("count of recently songs played:", recentlyPlayed.length);
  console.log("-----------------------------------------------------------");

  return randomItem;
};

const obtenerAnuncioAleatorioConPrioridad = (array, recentlyPlayedAds) => {
  const diaActual = obtenerDiaActualEnColombia();
  let opcionesPrioridad = array.filter(
    (item) => item.dia === diaActual || item.dia === "T"
  );

  // Asegurarse de que opcionesPrioridad sea un arreglo
  if (!Array.isArray(opcionesPrioridad)) {
    opcionesPrioridad = [opcionesPrioridad];
  }

  // Filtra las opciones disponibles que no se han reproducido recientemente
  const opcionesDisponibles = opcionesPrioridad.filter((item) => {
    const fileName = item.filename;
    // Compara el nombre del archivo con los nombres de archivos reproducidos recientemente
    return !recentlyPlayedAds.some(
      (playedItem) => playedItem.filename === fileName
    );
  });

  if (opcionesDisponibles.length === 0) {
    // Si no hay opciones disponibles que no se hayan reproducido recientemente, reiniciar el registro
    recentlyPlayedAds.length = 0;
    return obtenerAnuncioAleatorioConPrioridad(array, recentlyPlayedAds);
  }

  const randomItem = obtenerAudioAleatoria(opcionesDisponibles);
  recentlyPlayedAds.push(randomItem);

  if (recentlyPlayedAds.length > MAX_RECENT_ITEMS_ADS) {
    recentlyPlayedAds.shift();
  }

  console.log("-----------------------------------------------------------");
  console.log("Recently Played Ads:", recentlyPlayedAds);
  console.log("-----------------------------------------------------------");
  console.log("count of recently Ads played:", recentlyPlayedAds.length);
  console.log("-----------------------------------------------------------");

  return randomItem;
};

module.exports = {
  obtenerAudioAleatoriaSinRepetir,
  obtenerAnuncioAleatorioConPrioridad,
};
