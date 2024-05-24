let canciones = [];
let playlist = [];

// Función para cargar las canciones desde la API
const loadSongsFromAPI = () => {
  fetch("http://localhost:3000/api/canciones")
    .then((response) => response.json())
    .then((data) => {
      canciones = data;
      loadAvailableSongs();
    })
    .catch((error) => console.error("Error al cargar las canciones:", error));
};

// Cargar la lista de canciones disponibles
function loadAvailableSongs() {
  const availableSongsContainer = document.getElementById("available-songs");
  if (availableSongsContainer) {
    availableSongsContainer.innerHTML = ""; // Limpiar la lista
    canciones.forEach((cancion, index) => {
      const songElement = document.createElement("li");
      songElement.textContent = cancion.filename;
      songElement.onclick = () => addToPlaylist(index);
      availableSongsContainer.appendChild(songElement);
    });
  }
}

// Agregar canción a la playlist
function addToPlaylist(index) {
  const selectedSong = canciones[index];
  if (!playlist.includes(selectedSong)) {
    playlist.push(selectedSong);
    updatePlaylist();
  }
}

// Actualizar la lista de reproducción en el HTML
function updatePlaylist() {
  const playlistContainer = document.getElementById("playlist");
  if (playlistContainer) {
    playlistContainer.innerHTML = ""; // Limpiar la lista
    playlist.forEach((cancion) => {
      const songElement = document.createElement("li");
      songElement.textContent = cancion.filename;
      playlistContainer.appendChild(songElement);
    });
  }
}

// Mostrar el SweetAlert con la playlist
function showPlaylistModal() {
  Swal.fire({
    title: "Crear listas de reproducción",
    html: `
      <div class="container__list-player">
        <div>
          <h3>Canciones disponibles</h3>
          <ul id="available-songs"></ul>
        </div>
        <div>
          <h3>Playlist</h3>
          <input type="text" id="playlist-name" placeholder="Nombre de la Playlist">
          <ul id="playlist"></ul>
        </div>
      </div>
    `,
    showCloseButton: true,
    showCancelButton: true,
    confirmButtonText: "Crear",
    cancelButtonText: "Cancelar",
    focusConfirm: false,
    customClass: {
      confirmButton: "custom-confirm-button",
      cancelButton: "custom-cancel-button",
    },
    preConfirm: () => {
      const playlistName = document.getElementById("playlist-name").value;
      if (!playlistName) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Por favor, ingresa un nombre para la playlist.",
          timer: 3000,
          showConfirmButton: false,
        });
        return false;
      }
      if (playlist.length === 0) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "La playlist debe tener al menos una canción.",
          timer: 3000,
          showConfirmButton: false,
        });
        return false;
      }
      return {
        name: playlistName,
        songs: playlist,
      };
    },
    didOpen: () => {
      loadAvailableSongs();
      updatePlaylist();
    },
  }).then((result) => {
    if (result.isConfirmed) {
      const playlistData = result.value;
      console.log("Playlist creada:", playlistData);
      // Aquí puedes agregar el código para guardar la playlist en tu servidor o base de datos
    }
  });
}

document
  .getElementById("show-playlist")
  .addEventListener("click", showPlaylistModal);

loadSongsFromAPI();
