const { obtenerDiaActualEnColombia } = require("./getDay");

const obtenerAudioAleatoria = (array) => {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
};

const obtenerAudioAleatoriaSinRepetir = (array, recentlyPlayed) => {
  const availableOptions = array.filter((item) => {
    return !recentlyPlayed.some(
      (playedItem) => playedItem.filename === item.filename
    );
  });

  if (availableOptions.length === 0) {
    recentlyPlayed.length = 0;
    return obtenerAudioAleatoriaSinRepetir(array, recentlyPlayed);
  }

  const randomItem = obtenerAudioAleatoria(availableOptions);
  recentlyPlayed.push(randomItem);

  const maxRecent = Math.max(1, array.length - 1);
  while (recentlyPlayed.length > maxRecent) {
    recentlyPlayed.shift();
  }

  return randomItem;
};

const obtenerAnuncioAleatorioConPrioridad = (array, recentlyPlayedAds) => {
  const diaActual = obtenerDiaActualEnColombia();
  const opcionesPrioridad = array.filter(
    (item) => item.dia === diaActual || item.dia === "T"
  );

  if (opcionesPrioridad.length === 0) return null;

  const opcionesDisponibles = opcionesPrioridad.filter((item) => {
    return !recentlyPlayedAds.some(
      (playedItem) => playedItem.filename === item.filename
    );
  });

  if (opcionesDisponibles.length === 0) {
    recentlyPlayedAds.length = 0;
    return obtenerAnuncioAleatorioConPrioridad(array, recentlyPlayedAds);
  }

  const randomItem = obtenerAudioAleatoria(opcionesDisponibles);
  recentlyPlayedAds.push(randomItem);

  const maxRecent = Math.max(1, opcionesPrioridad.length - 1);
  while (recentlyPlayedAds.length > maxRecent) {
    recentlyPlayedAds.shift();
  }

  return randomItem;
};

module.exports = {
  obtenerAudioAleatoriaSinRepetir,
  obtenerAnuncioAleatorioConPrioridad,
};
