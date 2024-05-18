const validateForm = () => {
  const username = document.getElementById("usernameInput").value;
  const password = document.getElementById("passwordInput").value;

  if (username === "" || password === "") {
    Swal.fire({
      title: "Por favor, completa todos los campos.",
      icon: "error",
      confirmButtonText: "Aceptar",
    });
    return false;
  }

  return true;
};
