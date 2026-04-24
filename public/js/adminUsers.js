const loadUsers = async () => {
  const container = document.getElementById("users-list");
  const countEl = document.getElementById("users-count");
  try {
    const res = await fetch("/api/admin/users");
    if (!res.ok) throw new Error();
    const users = await res.json();
    countEl.textContent = `${users.length} usuario${users.length !== 1 ? "s" : ""}`;
    renderUsers(users, container);
  } catch {
    container.innerHTML = '<p class="adm__empty">Error al cargar usuarios.</p>';
  }
};

const renderUsers = (users, container) => {
  if (!users.length) {
    container.innerHTML = '<p class="adm__empty">No hay usuarios registrados.</p>';
    return;
  }
  container.innerHTML = "";
  const fragment = document.createDocumentFragment();
  users.forEach((user) => {
    const item = document.createElement("div");
    item.className = "adm__user-item";
    const adminBadge = user.is_admin
      ? '<span class="adm__badge adm__badge--admin"><i class="fas fa-shield-alt"></i> Admin</span>'
      : '<span class="adm__badge"><i class="fas fa-user"></i> Usuario</span>';
    item.innerHTML = `
      <div class="adm__user-info">
        <span class="adm__user-name">${user.username}</span>
        ${adminBadge}
      </div>
      ${
        user.is_admin
          ? ""
          : `<button class="adm__delete-btn" data-id="${user.id}" data-name="${user.username}">
               <i class="fas fa-trash"></i> Eliminar
             </button>`
      }
    `;
    fragment.appendChild(item);
  });
  container.appendChild(fragment);

  container.querySelectorAll(".adm__delete-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const name = btn.dataset.name;
      Swal.fire({
        title: `¿Eliminar a ${name}?`,
        text: "Esta acción no se puede deshacer.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Eliminar",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#e74c3c",
      }).then(async (result) => {
        if (!result.isConfirmed) return;
        try {
          const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || "Error");
          }
          Swal.fire({
            icon: "success",
            title: "Eliminado",
            text: `${name} ha sido eliminado.`,
            timer: 1500,
            showConfirmButton: false,
          });
          loadUsers();
        } catch (err) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: err.message || "No se pudo eliminar el usuario.",
          });
        }
      });
    });
  });
};

loadUsers();
