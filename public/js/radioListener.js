const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
const wsUrl = `${wsProtocol}://${window.location.host}`;

const audio     = document.getElementById("listener-audio");
const btnPlay   = document.getElementById("btn-play");
const playIcon  = document.getElementById("play-icon");
const songName  = document.getElementById("song-name");
const statusText = document.getElementById("status-text");
const hintText  = document.getElementById("hint-text");
const equalizer = document.getElementById("equalizer");
const talkBanner = document.getElementById("talk-banner");

let socket;
let reconnectDelay = 1000;
let currentPath = null;
let isPlaying   = false;
let baseVolume  = 1;
let inMixerMode = false;
let retryTimer  = null;

// ── Eventos de buffering del audio ────────────────────────────────────────────

audio.preload = "auto";

audio.addEventListener("waiting", () => {
  if (isPlaying) hintText.textContent = "Cargando...";
});

audio.addEventListener("playing", () => {
  setPlaying(true);
});

audio.addEventListener("stalled", () => {
  if (isPlaying && !inMixerMode) hintText.textContent = "Conexión lenta, cargando...";
});

audio.addEventListener("error", () => {
  if (!currentPath || inMixerMode) return;
  hintText.textContent = "Error de carga, reintentando...";
  clearTimeout(retryTimer);
  retryTimer = setTimeout(() => {
    if (currentPath) {
      audio.src = "/" + currentPath;
      audio.load();
    }
  }, 3000);
});

audio.addEventListener("ended", () => {
  if (!inMixerMode) hintText.textContent = "Esperando siguiente canción...";
});

// ── WebSocket con reconexión automática ───────────────────────────────────────

const connectWebSocket = () => {
  socket = new WebSocket(wsUrl);

  socket.addEventListener("open", () => {
    reconnectDelay = 1000;
    let clientId = localStorage.getItem("radio_client_id");
    if (!clientId) {
      const arr = new Uint8Array(16);
      (window.crypto || window.msCrypto).getRandomValues(arr);
      clientId = Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
      localStorage.setItem("radio_client_id", clientId);
    }
    socket.send(JSON.stringify({ type: "listenerConnect", clientId }));
    statusText.textContent = "En vivo";
    hintText.textContent = "Presiona play para escuchar";
  });

  socket.addEventListener("close", () => {
    statusText.textContent = "Sin conexión";
    hintText.textContent = "Reconectando...";
    setPlaying(false);
    setTimeout(() => {
      reconnectDelay = Math.min(reconnectDelay * 2, 30000);
      connectWebSocket();
    }, reconnectDelay);
  });

  socket.addEventListener("message", (event) => {
    const data = JSON.parse(event.data);

    if (data.type === "himno") {
      if (inMixerMode) {
        inMixerMode = false;
        talkBanner.classList.remove("talk-banner--active");
      }
      loadTrack(data.path, data.currentTime || 0);

    } else if (data.type === "play" || data.type === "playAd") {
      if (!inMixerMode) loadTrack(data.path, data.currentTime || 0);

    } else if (data.type === "pause") {
      audio.pause();
      setPlaying(false);
      hintText.textContent = "La radio está en pausa";

    } else if (data.type === "mixerStart") {
      inMixerMode = true;
      currentPath = null;
      btnPlay.disabled = false;
      songName.textContent = "Radio Online";
      talkBanner.classList.add("talk-banner--active");
      audio.src = "/stream/mixer";
      audio.volume = baseVolume;
      hintText.textContent = "Conectando al mixer...";
      tryPlay();

    } else if (data.type === "mixerStop") {
      inMixerMode = false;
      talkBanner.classList.remove("talk-banner--active");
      audio.pause();
      audio.src = "";
      setPlaying(false);
      hintText.textContent = "Reconectando...";

    } else if (data.type === "setVolume") {
      baseVolume = data.value;
      audio.volume = data.value;
    }
  });
};

connectWebSocket();

// ── Reproducción con buffering adecuado ───────────────────────────────────────

const tryPlay = () => {
  audio.play().then(() => {
    setPlaying(true);
  }).catch(() => {
    setPlaying(false);
    hintText.textContent = "Presiona play para continuar escuchando";
  });
};

const loadTrack = (path, currentTime) => {
  currentPath = path;
  const filename = path.split(/[\\/]/).pop().replace(/\.[^.]+$/, "");
  songName.textContent = filename;
  btnPlay.disabled = false;
  hintText.textContent = "Cargando...";

  audio.src = "/" + path;

  const onCanPlay = () => {
    audio.removeEventListener("canplay", onCanPlay);
    if (currentTime > 1) audio.currentTime = currentTime;
    audio.volume = baseVolume;
    if (isPlaying) {
      tryPlay();
    } else {
      hintText.textContent = "Presiona play para escuchar";
    }
  };

  audio.addEventListener("canplay", onCanPlay);
  audio.load();
};

btnPlay.addEventListener("click", () => {
  if (isPlaying) {
    audio.pause();
    setPlaying(false);
    return;
  }
  tryPlay();
});

const setPlaying = (playing) => {
  isPlaying = playing;
  if (playing) {
    playIcon.className = "fas fa-pause";
    equalizer.classList.add("listener__equalizer--active");
    hintText.textContent = "Escuchando en vivo";
  } else {
    playIcon.className = "fas fa-play";
    equalizer.classList.remove("listener__equalizer--active");
  }
};
