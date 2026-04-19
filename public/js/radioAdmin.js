const wsUrl = `ws://${window.location.host}`;
const socket = new WebSocket(wsUrl);

const elements = {
  nowPlayingTitle: document.getElementById("now-playing-title"),
  btnPauseResume: document.getElementById("btn-pause-resume"),
  pauseResumeIcon: document.getElementById("pause-resume-icon"),
  pauseResumeText: document.getElementById("pause-resume-text"),
  btnNext: document.getElementById("btn-next"),
  btnAd: document.getElementById("btn-ad"),
  btnTalk: document.getElementById("btn-talk"),
  talkText: document.getElementById("talk-text"),
  adminAudio: document.getElementById("admin-audio"),
  playlistsContainer: document.getElementById("playlists-container"),
};

let isPaused = false;
let isTalking = false;
let mediaRecorder = null;

socket.addEventListener("open", () => {
  socket.send(JSON.stringify({ type: "adminConnect" }));
});

socket.addEventListener("message", (event) => {
  const data = JSON.parse(event.data);
  if (data.type === "nowPlaying") {
    updateNowPlaying(data);
  } else if (data.type === "radioState") {
    isPaused = data.paused;
    updatePauseResumeButton();
    if (isPaused) {
      elements.adminAudio.pause();
    } else if (elements.adminAudio.src) {
      elements.adminAudio.play().catch(() => {});
    }
  }
});

const updateNowPlaying = (data) => {
  const { path, kind, paused, playlistMode, playlistName, playlistIndex, playlistTotal } = data;

  // Limpiar highlights previos
  document.querySelectorAll(".radio__song-item--active").forEach((el) => {
    el.classList.remove("radio__song-item--active");
  });

  if (path) {
    const filename = path.split(/[\\/]/).pop();
    if (playlistMode) {
      elements.nowPlayingTitle.textContent =
        `[${playlistName}  ${playlistIndex + 1}/${playlistTotal}]  ${filename}`;
    } else {
      elements.nowPlayingTitle.textContent = filename;
    }
    elements.btnPauseResume.disabled = false;
    elements.adminAudio.src = path;
    elements.adminAudio.load();
    if (!paused) elements.adminAudio.play().catch(() => {});

    // Highlight el elemento activo (canción o anuncio)
    const selector = kind === "ad" ? ".radio__ad-item" : ".radio__song-item:not(.radio__ad-item)";
    document.querySelectorAll(selector).forEach((item) => {
      if (item.dataset.path === path) {
        item.classList.add("radio__song-item--active");
      }
    });
  } else {
    elements.nowPlayingTitle.textContent = "— Sin reproducir —";
    elements.btnPauseResume.disabled = true;
    elements.adminAudio.src = "";
  }
  isPaused = !!paused;
  updatePauseResumeButton();
};

const updatePauseResumeButton = () => {
  if (isPaused) {
    elements.pauseResumeIcon.className = "fas fa-play";
    elements.pauseResumeText.textContent = "Reanudar";
  } else {
    elements.pauseResumeIcon.className = "fas fa-pause";
    elements.pauseResumeText.textContent = "Pausar";
  }
};

elements.btnPauseResume.addEventListener("click", () => {
  socket.send(JSON.stringify({ type: isPaused ? "adminResume" : "adminPause" }));
});

elements.btnNext.addEventListener("click", () => {
  socket.send(JSON.stringify({ type: "adminNext" }));
});

elements.btnAd.addEventListener("click", () => {
  socket.send(JSON.stringify({ type: "adminAd" }));
});

elements.adminAudio.addEventListener("ended", () => {
  socket.send(JSON.stringify({ type: "adminNext" }));
});

// Canciones individuales
document.querySelectorAll(".btn-play-song").forEach((btn) => {
  btn.addEventListener("click", () => {
    const path = btn.dataset.path;
    socket.send(JSON.stringify({ type: "adminPlay", path }));

    document.querySelectorAll(".radio__song-item").forEach((item) => {
      item.classList.remove("radio__song-item--active");
    });
    btn.closest(".radio__song-item").classList.add("radio__song-item--active");
  });
});

// Anuncios individuales
document.querySelectorAll(".btn-play-ad").forEach((btn) => {
  btn.addEventListener("click", () => {
    const path = btn.dataset.path;
    socket.send(JSON.stringify({ type: "adminPlayAd", path }));

    document.querySelectorAll(".radio__song-item").forEach((item) => {
      item.classList.remove("radio__song-item--active");
    });
    btn.closest(".radio__ad-item").classList.add("radio__song-item--active");
  });
});

// Micrófono / DJ Talk
const startTalking = async () => {
  if (isTalking) return;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus"
      : "audio/webm";
    mediaRecorder = new MediaRecorder(stream, { mimeType });
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0 && socket.readyState === WebSocket.OPEN) {
        socket.send(e.data);
      }
    };
    mediaRecorder.start(250);
    isTalking = true;
    elements.adminAudio.volume = 0.15;
    elements.btnTalk.classList.add("radio__btn--talking");
    elements.talkText.textContent = "Al aire...";
    socket.send(JSON.stringify({ type: "adminTalkStart" }));
  } catch (err) {
    alert("No se pudo acceder al micrófono: " + err.message);
  }
};

const stopTalking = () => {
  if (!isTalking) return;
  isTalking = false;
  if (mediaRecorder) {
    mediaRecorder.stop();
    mediaRecorder.stream.getTracks().forEach((t) => t.stop());
    mediaRecorder = null;
  }
  socket.send(JSON.stringify({ type: "adminTalkStop" }));
  elements.adminAudio.volume = 1;
  elements.btnTalk.classList.remove("radio__btn--talking");
  elements.talkText.textContent = "Hablar";
};

elements.btnTalk.addEventListener("mousedown", startTalking);
elements.btnTalk.addEventListener("mouseup", stopTalking);
elements.btnTalk.addEventListener("mouseleave", stopTalking);
elements.btnTalk.addEventListener("touchstart", (e) => { e.preventDefault(); startTalking(); });
elements.btnTalk.addEventListener("touchend", stopTalking);

// Playlists
const loadPlaylists = async () => {
  try {
    const res = await fetch("/api/playlists");
    const playlists = await res.json();
    renderPlaylists(playlists);
  } catch {
    elements.playlistsContainer.innerHTML =
      '<p class="radio__empty">Error al cargar playlists.</p>';
  }
};

const renderPlaylists = (playlists) => {
  if (!playlists.length) {
    elements.playlistsContainer.innerHTML =
      '<p class="radio__empty">No hay playlists. <a href="/player">Crea una desde Playlists.</a></p>';
    return;
  }
  elements.playlistsContainer.innerHTML = "";
  playlists.forEach((playlist) => {
    const item = document.createElement("div");
    item.className = "radio__playlist-item";
    item.dataset.id = playlist.id;
    item.innerHTML = `
      <div class="radio__playlist-info">
        <span class="radio__playlist-name">${playlist.name}</span>
        <span class="radio__playlist-count">${playlist.songs.length} canciones</span>
      </div>
      <div class="radio__playlist-actions">
        <button class="radio__btn radio__btn--play btn-play-playlist" data-id="${playlist.id}">
          <i class="fas fa-play"></i>
        </button>
        <button class="radio__btn radio__btn--delete btn-delete-playlist" data-id="${playlist.id}">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;
    elements.playlistsContainer.appendChild(item);
  });

  document.querySelectorAll(".btn-play-playlist").forEach((btn) => {
    btn.addEventListener("click", () => {
      const playlistId = Number(btn.dataset.id);
      socket.send(JSON.stringify({ type: "adminPlaylist", playlistId }));

      document.querySelectorAll(".radio__playlist-item").forEach((item) => {
        item.classList.remove("radio__playlist-item--active");
      });
      btn.closest(".radio__playlist-item").classList.add("radio__playlist-item--active");
    });
  });

  document.querySelectorAll(".btn-delete-playlist").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      if (!confirm("¿Eliminar esta playlist?")) return;
      try {
        const res = await fetch(`/api/playlist/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error();
        loadPlaylists();
      } catch {
        alert("Error al eliminar la playlist.");
      }
    });
  });
};

loadPlaylists();
