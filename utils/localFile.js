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

async function getDecemberSongs() {
  const decemberMusicFolder = path.join(basePublicDir, "diciembre");
  const files = await fs.readdir(decemberMusicFolder, { withFileTypes: true });
  return files
    .filter((dirent) => dirent.isFile())
    .map((dirent) => path.join(decemberMusicFolder, dirent.name))
    .map((file) => path.relative(__dirname, file));
}

module.exports = {
  getLocalSongs,
  getLocalAds,
  getDecemberSongs,
};
