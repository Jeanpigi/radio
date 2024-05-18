const confirmDelete = (event) => {
  event.preventDefault();

  Swal.fire({
    title: "¿Estás seguro de que lo deseas eliminar?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Aceptar",
    cancelButtonText: "Cancelar",
  }).then((result) => {
    if (result.isConfirmed) {
      const form = event.target.closest("form");
      form.submit();
    }
  });
};
