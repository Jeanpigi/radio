const multer = require("multer");

// Función de almacenamiento genérica
const storage = (destination) =>
  multer.diskStorage({
    destination: (req, file, cb) => cb(null, destination),
    filename: (req, file, cb) => {
      cb(null, `${file.originalname}`);
    },
  });

// Función para filtrar extensiones
const fileFilter = (allowedExtensions) => (req, file, cb) => {
  const fileExtension = file.originalname.split(".").pop();
  if (allowedExtensions.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(
      new Error(`Solo se permiten archivos ${allowedExtensions.join(", ")}.`),
      false
    );
  }
};

// Configuración de Multer para archivos de música
const musicStorage = storage("public/music");
const musicUpload = multer({
  storage: musicStorage,
  fileFilter: fileFilter(["mp3", "m4a"]),
}).array("canciones", 150); // Permitir hasta 150 archivos de música

// Configuración de Multer para archivos de anuncios
const adsStorage = storage("public/audios");
const adsUpload = multer({
  storage: adsStorage,
  fileFilter: fileFilter(["mp3"]),
}).array("audios", 50); // Permitir hasta 50 archivos de anuncios

module.exports = {
  musicUpload,
  adsUpload,
};
