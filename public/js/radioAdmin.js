const wsUrl = `ws://${window.location.host}`;
const socket = new WebSocket(wsUrl);

const elements = {
  listenersCount: document.getElementById("listeners-count"),
  listenersList: document.getElementById("listeners-list"),
  nowPlayingTitle: document.getElementById("now-playing-title"),
  btnPauseResume: document.getElementById("btn-pause-resume"),
  pauseResumeIcon: document.getElementById("pause-resume-icon"),
  pauseResumeText: document.getElementById("pause-resume-text"),
  btnNext: document.getElementById("btn-next"),
  btnAd: document.getElementById("btn-ad"),
  adminAudio: document.getElementById("admin-audio"),
  playlistsContainer: document.getElementById("playlists-container"),
  inputSelect: document.getElementById("audio-input-select"),
  btnDetect: document.getElementById("btn-detect-devices"),
  detectIcon: document.getElementById("detect-icon"),
  btnToggleMixer: document.getElementById("btn-toggle-mixer"),
  volumeSlider: document.getElementById("global-volume"),
  volumeValue: document.getElementById("volume-value"),
  mixerLiveBadge: document.getElementById("mixer-live-badge"),
  deviceHint: document.getElementById("device-hint"),
  mixerGainRow: document.getElementById("mixer-gain-row"),
  mixerGainSlider: document.getElementById("mixer-gain"),
  mixerGainValue: document.getElementById("mixer-gain-value"),
};

let isPaused = false;

// Entrada de audio seleccionada (micrófono, mixer USB, etc.)
let selectedInputId = null;

// Estado del modo mixer
let mixerMode = false;
let mixerRecorder = null;
let mixerStream = null;

// Pipeline de audio
let audioCtx   = null;
let gainNode   = null;
let analyser   = null;
let levelRaf   = null; // requestAnimationFrame para el medidor de nivel

// ── Lista de oyentes ──────────────────────────────────────────────────────────

const deviceIcons = {
  "Móvil": "fa-mobile-alt",
  "Windows": "fa-desktop",
  "Mac": "fa-laptop",
  "Linux": "fa-desktop",
  "Otro": "fa-globe",
  "Desconocido": "fa-question-circle",
};

const renderListenersList = (list) => {
  if (!elements.listenersList) return;
  if (!list || list.length === 0) {
    elements.listenersList.innerHTML = '<p class="radio__empty">Sin oyentes conectados</p>';
    return;
  }
  elements.listenersList.innerHTML = "";
  list.forEach((l) => {
    const icon = deviceIcons[l.device] || "fa-globe";
    const time = new Date(l.connectedAt).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
    const shortId = l.clientId.substring(0, 8);
    const item = document.createElement("div");
    item.className = "radio__listener-item";
    item.innerHTML =
      `<span class="radio__listener-device"><i class="fas ${icon}"></i> ${l.device}</span>` +
      `<span class="radio__listener-ip">${l.ip}</span>` +
      `<span class="radio__listener-id" title="${l.clientId}">${shortId}</span>` +
      `<span class="radio__listener-time"><i class="fas fa-clock"></i> ${time}</span>`;
    elements.listenersList.appendChild(item);
  });
};

// ── WebSocket ─────────────────────────────────────────────────────────────────

socket.addEventListener("open", () => {
  socket.send(JSON.stringify({ type: "adminConnect" }));
});

socket.addEventListener("message", (event) => {
  const data = JSON.parse(event.data);
  if (data.type === "djLocked") {
    const banner = document.getElementById("dj-locked-banner");
    const text = document.getElementById("dj-locked-text");
    if (banner) banner.style.display = "flex";
    if (text) text.textContent = `${data.dj} está controlando la radio en este momento`;
    elements.btnPauseResume.disabled = true;
    elements.btnNext.disabled = true;
    elements.btnAd.disabled = true;
    if (elements.btnToggleMixer) elements.btnToggleMixer.disabled = true;
    if (elements.btnDetect) elements.btnDetect.disabled = true;
    if (elements.volumeSlider) elements.volumeSlider.disabled = true;
    document.querySelectorAll(".btn-play-song, .btn-play-ad, .btn-play-playlist").forEach((b) => {
      b.disabled = true;
    });
  } else if (data.type === "nowPlaying") {
    updateNowPlaying(data);
    if (data.mixerMode && !mixerMode) {
      updateMixerUI(true);
      showHint("El mixer estaba al aire. Detecta los dispositivos y actívalo de nuevo.");
    }
  } else if (data.type === "listenersList") {
    elements.listenersCount.textContent = data.count;
    renderListenersList(data.listeners);
  } else if (data.type === "radioState") {
    isPaused = data.paused;
    updatePauseResumeButton();
    if (isPaused) {
      elements.adminAudio.pause();
    } else if (elements.adminAudio.src) {
      elements.adminAudio.play().catch(() => {});
    }
  } else if (data.type === "mixerState") {
    updateMixerUI(data.active);
  }
});

// ── Reproductor / Now Playing ─────────────────────────────────────────────────

const updateNowPlaying = (data) => {
  const { path, kind, paused, playlistMode, playlistName, playlistIndex, playlistTotal } = data;

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

    const selector = kind === "ad" ? ".radio__ad-item" : ".radio__song-item:not(.radio__ad-item)";
    document.querySelectorAll(selector).forEach((item) => {
      if (item.dataset.path === path) item.classList.add("radio__song-item--active");
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

// Buscador de canciones
const songsSearch = document.getElementById("songs-search");
if (songsSearch) {
  songsSearch.addEventListener("input", () => {
    const q = songsSearch.value.toLowerCase().trim();
    document.querySelectorAll(".radio__song-item:not(.radio__ad-item)").forEach((item) => {
      const name = item.querySelector(".radio__song-filename").textContent.toLowerCase();
      item.style.display = name.includes(q) ? "" : "none";
    });
  });
}

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

// ── Volumen global ────────────────────────────────────────────────────────────

elements.volumeSlider.addEventListener("input", () => {
  const vol = Number(elements.volumeSlider.value) / 100;
  elements.volumeValue.textContent = elements.volumeSlider.value + "%";
  socket.send(JSON.stringify({ type: "adminVolume", value: vol }));
});

// ── Detección de dispositivos ─────────────────────────────────────────────────

const populateDevices = async () => {
  const devices = await navigator.mediaDevices.enumerateDevices();
  const inputs = devices.filter((d) => d.kind === "audioinput");

  const savedId = localStorage.getItem("radio_mixer_inputId");

  elements.inputSelect.innerHTML = '<option value="">— Selecciona una entrada —</option>';
  inputs.forEach((d) => {
    if (d.deviceId === "default" || d.deviceId === "communications") return;
    const opt = document.createElement("option");
    opt.value = d.deviceId;
    opt.textContent = d.label || `Entrada de audio ${elements.inputSelect.options.length}`;
    elements.inputSelect.appendChild(opt);
  });
  elements.inputSelect.disabled = false;

  // Restaurar el último dispositivo usado o auto-seleccionar el primero disponible
  const saved = savedId ? inputs.find((d) => d.deviceId === savedId) : null;
  const first = inputs.find((d) => d.deviceId !== "default" && d.deviceId !== "communications");
  const toSelect = saved || first;

  if (toSelect) {
    elements.inputSelect.value = toSelect.deviceId;
    selectedInputId = toSelect.deviceId;
    hideHint();
  } else {
    showHint("No se encontraron entradas de audio. Conecta el dispositivo y presiona Detectar.");
  }

  updateToggleButton();
};

elements.inputSelect.addEventListener("change", () => {
  const newId = elements.inputSelect.value || null;
  if (newId !== selectedInputId && mixerMode) stopMixerMode();
  selectedInputId = newId;
  if (selectedInputId) {
    localStorage.setItem("radio_mixer_inputId", selectedInputId);
    hideHint();
  } else {
    localStorage.removeItem("radio_mixer_inputId");
  }
  updateToggleButton();
});

elements.btnDetect.addEventListener("click", async () => {
  elements.detectIcon.classList.add("fa-spin");
  elements.btnDetect.disabled = true;
  try {
    // getUserMedia es necesario para que el navegador revele los labels de los dispositivos
    const tempStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    tempStream.getTracks().forEach((t) => t.stop());
    await populateDevices();
  } catch (err) {
    showHint("No se pudo acceder al audio: " + err.message);
  } finally {
    elements.detectIcon.classList.remove("fa-spin");
    elements.btnDetect.disabled = false;
  }
});

// Auto-detectar al cargar si el navegador ya tiene permisos de sesiones previas
navigator.mediaDevices.enumerateDevices().then((devices) => {
  if (devices.some((d) => d.kind === "audioinput" && d.label)) {
    populateDevices();
  }
}).catch(() => {});

// ── Modo Mixer ────────────────────────────────────────────────────────────────
// Cuando está activo: los oyentes reciben la entrada de audio seleccionada (micrófono/mixer/USB).
// El adminAudio sigue reproduciendo canciones localmente para que el admin escuche.
// Cuando está inactivo: los oyentes reciben las canciones del reproductor normalmente.

const startMixerMode = async () => {
  if (mixerMode) return;
  if (!selectedInputId) return;
  try {
    mixerStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        deviceId: { exact: selectedInputId },
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
      video: false,
    });

    audioCtx = new AudioContext();
    gainNode = audioCtx.createGain();
    gainNode.gain.value = Number(elements.mixerGainSlider.value) / 100;

    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.6;

    const streamSource = audioCtx.createMediaStreamSource(mixerStream);
    const destination = audioCtx.createMediaStreamDestination();
    streamSource.connect(gainNode);
    gainNode.connect(analyser);
    gainNode.connect(destination);

    startLevelMeter();

    const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus"
      : "audio/webm";

    mixerRecorder = new MediaRecorder(destination.stream, {
      mimeType,
      audioBitsPerSecond: 192000,
    });

    mixerRecorder.ondataavailable = (e) => {
      if (e.data.size > 0 && socket.readyState === WebSocket.OPEN) {
        socket.send(e.data);
      }
    };

    // Notificar primero para que el servidor entre en mixerMode antes de recibir datos binarios
    socket.send(JSON.stringify({ type: "adminMixerStart" }));
    // Asegurar que el AudioContext está corriendo (Chrome puede iniciarlo suspendido)
    await audioCtx.resume();
    mixerRecorder.start(100);
    mixerMode = true;
    updateMixerUI(true);

  } catch (err) {
    showHint("Error al acceder al dispositivo: " + err.message);
  }
};

const stopMixerMode = () => {
  if (!mixerMode) return;
  mixerMode = false;

  if (mixerRecorder) {
    mixerRecorder.stop();
    mixerRecorder = null;
  }
  if (mixerStream) {
    mixerStream.getTracks().forEach((t) => t.stop());
    mixerStream = null;
  }
  stopLevelMeter();

  if (audioCtx) {
    audioCtx.close();
    audioCtx = null;
    gainNode = null;
    analyser = null;
  }

  socket.send(JSON.stringify({ type: "adminMixerStop" }));
  updateMixerUI(false);
};

elements.btnToggleMixer.addEventListener("click", () => {
  if (mixerMode) {
    stopMixerMode();
  } else {
    startMixerMode();
  }
});

// ── Medidor de nivel de entrada ───────────────────────────────────────────────

const startLevelMeter = () => {
  const levelRow  = document.getElementById("mixer-level-row");
  const levelBar  = document.getElementById("mixer-level-bar");
  const levelMeter = document.getElementById("mixer-level-meter");
  if (!analyser || !levelBar) return;
  if (levelRow) levelRow.style.display = "";

  const data = new Uint8Array(analyser.frequencyBinCount);

  const tick = () => {
    analyser.getByteFrequencyData(data);
    const avg = data.reduce((a, b) => a + b, 0) / data.length;
    const pct = Math.min(100, avg * 2.5);
    levelBar.style.width = pct + "%";
    if (levelMeter) levelMeter.classList.toggle("vad-active", pct > 3);
    levelRaf = requestAnimationFrame(tick);
  };
  levelRaf = requestAnimationFrame(tick);
};

const stopLevelMeter = () => {
  if (levelRaf) { cancelAnimationFrame(levelRaf); levelRaf = null; }
  const levelRow  = document.getElementById("mixer-level-row");
  const levelBar  = document.getElementById("mixer-level-bar");
  const levelMeter = document.getElementById("mixer-level-meter");
  if (levelBar)  levelBar.style.width = "0%";
  if (levelMeter) levelMeter.classList.remove("vad-active");
  if (levelRow)  levelRow.style.display = "none";
};

// ── UI del mixer ──────────────────────────────────────────────────────────────

const updateToggleButton = () => {
  if (!elements.btnToggleMixer) return;
  if (mixerMode) {
    elements.btnToggleMixer.innerHTML = '<i class="fas fa-stop-circle"></i> Desactivar Mixer';
    elements.btnToggleMixer.classList.add("radio__btn--mixer-active");
    elements.btnToggleMixer.disabled = false;
  } else {
    elements.btnToggleMixer.innerHTML = '<i class="fas fa-broadcast-tower"></i> Activar Mixer';
    elements.btnToggleMixer.classList.remove("radio__btn--mixer-active");
    elements.btnToggleMixer.disabled = !selectedInputId;
  }
};

const updateMixerUI = (active) => {
  if (active) {
    if (elements.mixerLiveBadge) elements.mixerLiveBadge.style.display = "inline-flex";
    if (elements.mixerGainRow) elements.mixerGainRow.style.display = "";
    elements.inputSelect.classList.add("radio__select--active");
  } else {
    if (elements.mixerLiveBadge) elements.mixerLiveBadge.style.display = "none";
    if (elements.mixerGainRow) elements.mixerGainRow.style.display = "none";
    elements.inputSelect.classList.remove("radio__select--active");
  }
  updateToggleButton();
};

function showHint(msg) {
  if (!elements.deviceHint) return;
  elements.deviceHint.textContent = msg;
  elements.deviceHint.style.display = "";
}

function hideHint() {
  if (!elements.deviceHint) return;
  elements.deviceHint.style.display = "none";
}

elements.mixerGainSlider.addEventListener("input", () => {
  const pct = Number(elements.mixerGainSlider.value);
  elements.mixerGainValue.textContent = pct + "%";
  if (gainNode) gainNode.gain.value = pct / 100;
});

// ── Playlists ─────────────────────────────────────────────────────────────────

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

// ── Toggle oyentes (colapsar/expandir) ──────────────���────────────────────────

const listenersToggle = document.getElementById("listeners-toggle");
const toggleIcon = document.getElementById("listeners-toggle-icon");

if (listenersToggle) {
  listenersToggle.addEventListener("click", () => {
    elements.listenersList.classList.toggle("radio__listeners-list--collapsed");
    if (toggleIcon) {
      toggleIcon.classList.toggle("fa-chevron-down");
      toggleIcon.classList.toggle("fa-chevron-up");
    }
  });
}
