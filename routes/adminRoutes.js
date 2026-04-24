const express = require("express");
const router = express.Router();
const { verificarAdmin } = require("../middleware/verificacion");
const { getUsersPage, getUsers, deleteUser } = require("../controllers/adminController");

router.get("/admin/users", verificarAdmin, getUsersPage);
router.get("/api/admin/users", verificarAdmin, getUsers);
router.delete("/api/admin/users/:id", verificarAdmin, deleteUser);

module.exports = router;
