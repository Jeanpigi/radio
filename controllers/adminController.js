const { getAllUsers, deleteUserById } = require("../model/userLite");

const getUsersPage = async (req, res) => {
  res.render("admin", { isAdmin: true, username: req.user.username });
};

const getUsers = async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const users = await getAllUsers();
    const userToDelete = users.find((u) => u.id === Number(id));

    if (!userToDelete) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    if (userToDelete.username === req.user.username) {
      return res.status(400).json({ error: "No puedes eliminarte a ti mismo" });
    }

    await deleteUserById(Number(id));
    res.json({ message: "Usuario eliminado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar usuario" });
  }
};

module.exports = { getUsersPage, getUsers, deleteUser };
