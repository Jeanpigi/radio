let canciones = [];
let playlist = [];

const loadSongsFromAPI = () => {
  fetch("/api/canciones")
    .then((response) => response.json())
    .then((data) => {
      canciones = data;
      loadAvailableSongs();
    })
    .catch((error) => console.error("Error al cargar las canciones:", error));
};

function loadAvailableSongs() {
  const availableSongsContainer = document.getElementById("available-songs");
  if (availableSongsContainer) {
    availableSongsContainer.innerHTML = "";
    canciones.forEach((cancion, index) => {
      const songElement = document.createElement("li");
      songElement.textContent = cancion.filename;
      songElement.draggable = true;
      songElement.dataset.index = index;
      songElement.onclick = () => addToPlaylist(index);
      songElement.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/plain", index);
        e.dataTransfer.effectAllowed = "copy";
        songElement.classList.add("pl__dragging");
      });
      songElement.addEventListener("dragend", () => {
        songElement.classList.remove("pl__dragging");
      });
      availableSongsContainer.appendChild(songElement);
    });
  }
}

function addToPlaylist(index) {
  const selectedSong = canciones[index];
  if (!playlist.includes(selectedSong)) {
    playlist.push(selectedSong);
    updatePlaylist();
  }
}

function removeFromPlaylist(index) {
  playlist.splice(index, 1);
  updatePlaylist();
}

function updatePlaylist() {
  const playlistContainer = document.getElementById("playlist");
  if (playlistContainer) {
    playlistContainer.innerHTML = "";
    playlist.forEach((cancion, index) => {
      const songElement = document.createElement("li");
      songElement.textContent = cancion.filename;

      const removeButton = document.createElement("button");
      removeButton.textContent = "X";
      removeButton.style.marginLeft = "10px";
      removeButton.onclick = () => removeFromPlaylist(index);

      songElement.appendChild(removeButton);
      playlistContainer.appendChild(songElement);
    });
  }
}

function showPlaylistModal() {
  playlist = [];
  Swal.fire({
    title: "Crear Playlist",
    html: `
      <div class="container__list-player">
        <div>
          <h3>Canciones disponibles</h3>
          <input type="text" id="songs-filter" class="pl__search-input" placeholder="Buscar canción...">
          <ul id="available-songs"></ul>
        </div>
        <div>
          <h3>Mi Playlist</h3>
          <input type="text" id="playlist-name" placeholder="Nombre de la playlist">
          <ul id="playlist" class="pl__drop-zone"></ul>
          <p class="pl__drop-hint"><i class="fas fa-hand-pointer"></i> Haz clic o arrastra canciones aquí</p>
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
      const playlistName = document.getElementById("playlist-name").value.trim();
      if (!playlistName) {
        Swal.showValidationMessage("Ingresa un nombre para la playlist");
        return false;
      }
      if (playlist.length === 0) {
        Swal.showValidationMessage("Agrega al menos una canción");
        return false;
      }
      return { name: playlistName, songs: playlist };
    },
    didOpen: () => {
      loadAvailableSongs();
      updatePlaylist();

      const filterInput = document.getElementById("songs-filter");
      if (filterInput) {
        filterInput.addEventListener("input", () => {
          const q = filterInput.value.toLowerCase().trim();
          document.querySelectorAll("#available-songs li").forEach((item) => {
            item.style.display = item.textContent.toLowerCase().includes(q) ? "" : "none";
          });
        });
      }

      const dropZone = document.getElementById("playlist");
      if (dropZone) {
        dropZone.addEventListener("dragover", (e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = "copy";
          dropZone.classList.add("pl__drop-zone--active");
        });
        dropZone.addEventListener("dragleave", () => {
          dropZone.classList.remove("pl__drop-zone--active");
        });
        dropZone.addEventListener("drop", (e) => {
          e.preventDefault();
          dropZone.classList.remove("pl__drop-zone--active");
          const index = Number(e.dataTransfer.getData("text/plain"));
          if (!isNaN(index)) addToPlaylist(index);
        });
      }
    },
  }).then((result) => {
    if (result.isConfirmed) {
      sendPlaylistToServer(result.value);
    }
  });
}

function sendPlaylistToServer(playlistData) {
  fetch("/api/playlist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(playlistData),
  })
    .then((response) => {
      if (!response.ok) throw new Error("Error del servidor");
      return response.json();
    })
    .then(() => {
      Swal.fire({
        icon: "success",
        title: "Playlist creada",
        text: "Tu playlist ha sido guardada exitosamente.",
        timer: 2000,
        showConfirmButton: false,
      });
      loadPlaylistsFromAPI();
    })
    .catch(() => {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un problema al guardar la playlist. Intenta de nuevo.",
        timer: 3000,
        showConfirmButton: false,
      });
    });
}

const loadPlaylistsFromAPI = () => {
  fetch("/api/playlists")
    .then((response) => response.json())
    .then((data) => renderPlaylists(data))
    .catch((error) => console.error("Error al cargar las playlists:", error));
};

const renderPlaylists = (playlists) => {
  const container = document.getElementById("playlists-list");
  if (!container) return;

  if (!playlists.length) {
    container.innerHTML = '<p class="pl__empty">No hay playlists aún. Crea una con el botón de arriba.</p>';
    return;
  }

  container.innerHTML = "";
  const fragment = document.createDocumentFragment();
  playlists.forEach((pl) => {
    const item = document.createElement("div");
    item.className = "playlist-item";
    item.innerHTML = `
      <div class="playlist-item__info">
        <span class="playlist-item__name"><i class="fas fa-list"></i> ${pl.name}</span>
        <span class="playlist-item__count">${pl.songs.length} canción${pl.songs.length !== 1 ? "es" : ""}</span>
      </div>
      <button class="playlist-item__delete" onclick="deletePlaylist(${pl.id})">
        <i class="fas fa-trash"></i> Eliminar
      </button>
    `;
    fragment.appendChild(item);
  });
  container.appendChild(fragment);
};

const deletePlaylist = (playlistId) => {
  Swal.fire({
    title: "¿Eliminar playlist?",
    text: "Esta acción no se puede deshacer.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Eliminar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#e74c3c",
  }).then((result) => {
    if (!result.isConfirmed) return;
    fetch(`/api/playlist/${playlistId}`, { method: "DELETE" })
      .then((response) => {
        if (!response.ok) throw new Error("Error del servidor");
        return response.json();
      })
      .then(() => loadPlaylistsFromAPI())
      .catch(() => {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Hubo un problema al eliminar la playlist. Intenta de nuevo.",
          timer: 3000,
          showConfirmButton: false,
        });
      });
  });
};

document.getElementById("show-playlist").addEventListener("click", showPlaylistModal);

loadSongsFromAPI();
loadPlaylistsFromAPI();
