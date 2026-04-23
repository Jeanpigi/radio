const wsUrl = `ws://${window.location.host}`;
const socket = new WebSocket(wsUrl);

const audio     = document.getElementById("listener-audio");
const btnPlay   = document.getElementById("btn-play");
const playIcon  = document.getElementById("play-icon");
const songName  = document.getElementById("song-name");
const statusText = document.getElementById("status-text");
const hintText  = document.getElementById("hint-text");
const equalizer = document.getElementById("equalizer");
const talkBanner = document.getElementById("talk-banner");

let currentPath = null;
let isPlaying   = false;
let baseVolume  = 1;
let inMixerMode = false;

// ── WebSocket ─────────────────────────────────────────────────────────────────

socket.addEventListener("open", () => {
  socket.send(JSON.stringify({ type: "listenerConnect" }));
  statusText.textContent = "En vivo";
  hintText.textContent = "Presiona play para escuchar";
});

socket.addEventListener("close", () => {
  statusText.textContent = "Sin conexión";
  hintText.textContent = "Intentando reconectar...";
  setPlaying(false);
  setTimeout(() => location.reload(), 5000);
});

socket.addEventListener("message", (event) => {
  const data = JSON.parse(event.data);

  if (data.type === "play" || data.type === "playAd" || data.type === "himno") {
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
    // Conectar al stream HTTP — el browser lo reproduce como cualquier audio
    audio.src = "/stream/mixer";
    audio.volume = baseVolume;
    audio.load();
    audio.play().catch(() => {});
    setPlaying(true);

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

// ── Reproducción de archivos (modo normal) ────────────────────────────────────

const loadTrack = (path, currentTime) => {
  currentPath = path;
  const filename = path.split(/[\\/]/).pop().replace(/\.[^.]+$/, "");
  songName.textContent = filename;
  hintText.textContent = "Presiona play para escuchar";

  audio.src = "/" + path;
  audio.load();
  audio.currentTime = currentTime;
  audio.volume = baseVolume;
  btnPlay.disabled = false;

  if (isPlaying) audio.play().catch(() => {});
};

btnPlay.addEventListener("click", () => {
  if (isPlaying) {
    audio.pause();
    setPlaying(false);
    return;
  }
  setPlaying(true);
  audio.play().catch(() => {});
});

audio.addEventListener("ended", () => {
  if (!inMixerMode) {
    setPlaying(false);
    hintText.textContent = "Esperando siguiente canción...";
  }
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
