const express = require("express");
const router = express.Router();
const { verificarSesion } = require("../middleware/verificacion");
const { getRadioPanel } = require("../controllers/radioController");

router.get("/radio", verificarSesion, getRadioPanel);

module.exports = router;
