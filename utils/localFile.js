const path = require("path");
const fs = require("fs").promises;
const basePublicDir = path.join(__dirname, "../public");

async function getLocalSongs() {
  const carpetaMusica = path.join(basePublicDir, "music");
  const archivos = await fs.readdir(carpetaMusica, { withFileTypes: true });
  return archivos
    .filter((dirent) => dirent.isFile())
    .map((dirent) => path.join(carpetaMusica, dirent.name))
    .map((archivo) => path.relative(__dirname, archivo));
}

async function getLocalAds() {
  const carpetaAnuncios = path.join(basePublicDir, "audios");
  return (await fs.readdir(carpetaAnuncios, { withFileTypes: true }))
    .filter((dirent) => dirent.isFile())
    .map((dirent) => path.join(carpetaAnuncios, dirent.name))
    .map((archivo) => path.relative(__dirname, archivo));
}

module.exports = {
  getLocalSongs,
  getLocalAds,
};
