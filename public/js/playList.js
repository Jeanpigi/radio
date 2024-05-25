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

// Función para obtener las playlists desde la API

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

// Eliminar canción de la playlist
function removeFromPlaylist(index) {
  playlist.splice(index, 1); // Eliminar la canción del array playlist
  updatePlaylist(); // Actualizar la lista de reproducción en el HTML
}

// Actualizar la lista de reproducción en el HTML
function updatePlaylist() {
  const playlistContainer = document.getElementById("playlist");
  if (playlistContainer) {
    playlistContainer.innerHTML = ""; // Limpiar la lista
    playlist.forEach((cancion, index) => {
      const songElement = document.createElement("li");
      songElement.textContent = cancion.filename;

      // Crear el botón de eliminación
      const removeButton = document.createElement("button");
      removeButton.textContent = "X";
      removeButton.style.marginLeft = "10px";
      removeButton.onclick = () => removeFromPlaylist(index);

      songElement.appendChild(removeButton);
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
      // Aquí envías la solicitud POST al servidor
      sendPlaylistToServer(playlistData);
    }
  });
}

// Función para enviar la playlist al servidor
function sendPlaylistToServer(playlistData) {
  fetch("http://localhost:3000/api/playlist", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(playlistData),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      console.log("Playlist guardada exitosamente:", data);
      Swal.fire({
        icon: "success",
        title: "Playlist creada",
        text: "Tu playlist ha sido guardada exitosamente.",
        timer: 3000,
        showConfirmButton: false,
      });
    })
    .catch((error) => {
      console.error("Error al guardar la playlist:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un problema al guardar tu playlist. Intenta de nuevo.",
        timer: 3000,
        showConfirmButton: false,
      });
    });
}

document
  .getElementById("show-playlist")
  .addEventListener("click", showPlaylistModal);

loadSongsFromAPI();

// Función para obtener las playlists desde la API// Función para obtener las playlists desde la API
const loadPlaylistsFromAPI = () => {
  fetch("http://localhost:3000/api/playlists")
    .then((response) => response.json())
    .then((data) => {
      lista(data);
    })
    .catch((error) => console.error("Error al cargar las playlists:", error));
};

// Función para actualizar la interfaz con las playlists
const lista = (playlists) => {
  const playlistContainer = document.querySelector(".lista");
  if (playlistContainer) {
    playlistContainer.innerHTML = `<h3>Lista de reproducción</h3>`; // Limpiar la lista
    const fragment = document.createDocumentFragment();
    playlists.forEach((playlist) => {
      const playlistElement = document.createElement("div");
      playlistElement.className = "playlist-item";

      const playlistNameElement = document.createElement("span");
      playlistNameElement.className = "playlist-name";
      playlistNameElement.textContent = playlist.name;

      const deleteButton = document.createElement("button");
      deleteButton.className = "delete-button";
      deleteButton.textContent = "Eliminar";
      deleteButton.onclick = () => deletePlaylist(playlist.id);

      playlistElement.appendChild(playlistNameElement);
      playlistElement.appendChild(deleteButton);
      fragment.appendChild(playlistElement);
    });
    playlistContainer.appendChild(fragment);
  }
};

// Función para eliminar una playlist
const deletePlaylist = (playlistId) => {
  fetch(`http://localhost:3000/api/playlist/${playlistId}`, {
    method: "DELETE",
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      console.log("Playlist eliminada exitosamente:", data);
      loadPlaylistsFromAPI(); // Volver a cargar las playlists después de eliminar una
    })
    .catch((error) => {
      console.error("Error al eliminar la playlist:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un problema al eliminar tu playlist. Intenta de nuevo.",
        timer: 3000,
        showConfirmButton: false,
      });
    });
};

// Cargar las playlists al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  loadPlaylistsFromAPI();
});
