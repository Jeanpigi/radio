const elements = {
  fileTypeSelect: document.getElementById("fileTypeSelect"),
  filePathInput: document.getElementById("filePath"),
  uploadForm: document.getElementById("uploadForm"),
  uploadLabel: document.querySelector(".upload-label"),
  uploadButton: document.getElementById("uploadButton"),
  diaContainer: document.getElementById("diaContainer"),
  diaSelected: document.getElementById("dia"),
  loadingContainer: document.getElementById("loading-container"),
};

const actions = {
  cancion: {
    action: "/canciones",
    name: "canciones",
    label: "Selecciona la canción:",
    placeholder: "Archivo de canción",
  },
  anuncio: {
    action: "/audios",
    name: "audios",
    label: "Selecciona el anuncio:",
    placeholder: "Archivo de anuncio",
  },
};

const enableUploadButton = () => {
  const { fileTypeSelect, filePathInput, uploadButton } = elements;
  const selectedOption = fileTypeSelect.value;

  if (selectedOption) {
    uploadButton.disabled = !filePathInput.files.length;
  } else {
    showAlert();
  }
};

const changeFormAction = (selectedOption) => {
  const { uploadForm, filePathInput, uploadLabel, diaContainer } = elements;

  // Verifica si selectedOption existe en el objeto actions
  if (actions[selectedOption]) {
    const { action, name, label, placeholder } = actions[selectedOption];

    uploadForm.action = action;
    filePathInput.name = name;
    uploadLabel.textContent = label;
    filePathInput.placeholder = placeholder;
    // Si se selecciona "Anuncio," puedes obtener el valor de la selección de día
    if (selectedOption === "anuncio") {
      let selectedDia = elements.diaSelected.value;
      console.log(selectedDia);
    }
  } else {
    // Maneja el caso en el que selectedOption no existe en actions
    console.error(`Opción desconocida: ${selectedOption}`);
    uploadForm.action = "";
    filePathInput.name = "";
    uploadLabel.textContent = "";
    filePathInput.placeholder = "";
  }

  // Muestra u oculta el campo de día según la opción seleccionada
  diaContainer.style.display = selectedOption === "anuncio" ? "block" : "none";
};

elements.fileTypeSelect.addEventListener("change", () => {
  const selectedOption = elements.fileTypeSelect.value;
  if (selectedOption in actions) {
    changeFormAction(selectedOption);
  }
});

const showAlert = () => {
  Swal.fire({
    title: "Oops...",
    text: "Debes seleccionar una canción o anuncio",
    icon: "error",
    confirmButtonText: "Aceptar",
  }).then(() => {
    elements.filePathInput.value = "";
  });
};

const showSpinner = () => {
  elements.loadingContainer.style.display = "block";
};

const hideSpinner = () => {
  elements.loadingContainer.style.display = "none";
};

elements.uploadForm.addEventListener("submit", () => {
  showSpinner(); // Muestra el spinner al enviar el formulario de carga
});

const handleSuccessfulUpload = () => {
  hideSpinner(); // Oculta el spinner cuando la carga se completa con éxito
};

const searchCanciones = () => {
  const searchBar = document.getElementById("canciones-search");
  const searchQuery = searchBar.value.toLowerCase();

  const cancionesContent = document.getElementById("canciones-content");
  const songTitles = cancionesContent.querySelectorAll(".song-title");

  songTitles.forEach((title) => {
    const songTitle = title.textContent.toLowerCase();

    if (songTitle.includes(searchQuery)) {
      title.parentElement.style.display = "block";
    } else {
      title.parentElement.style.display = "none";
    }
  });
};

const searchAnuncios = () => {
  const searchBar = document.getElementById("anuncios-search");
  const searchQuery = searchBar.value.toLowerCase();

  const anunciosContent = document.getElementById("anuncios-content");
  const anuncioTitles = anunciosContent.querySelectorAll(".song-title");

  anuncioTitles.forEach((title) => {
    const anuncioTitle = title.textContent.toLowerCase();

    if (anuncioTitle.includes(searchQuery)) {
      title.parentElement.style.display = "block";
    } else {
      title.parentElement.style.display = "none";
    }
  });
};

// Attach the search functionality to the input elements' input events
const cancionesSearchBar = document.getElementById("canciones-search");
cancionesSearchBar.addEventListener("input", searchCanciones);

const anunciosSearchBar = document.getElementById("anuncios-search");
anunciosSearchBar.addEventListener("input", searchAnuncios);

document.addEventListener("DOMContentLoaded", () => {
  const logoutButton = document.querySelector(".logout-button");
  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      const keysToRemove = ["playlist"];
      keysToRemove.forEach((key) => {
        localStorage.removeItem(key);
      });
    });
  }
});
