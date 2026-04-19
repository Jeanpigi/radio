const wsUrl = `ws://${window.location.host}`;
const socket = new WebSocket(wsUrl);

const audio = document.getElementById("listener-audio");
const btnPlay = document.getElementById("btn-play");
const playIcon = document.getElementById("play-icon");
const songName = document.getElementById("song-name");
const statusText = document.getElementById("status-text");
const hintText = document.getElementById("hint-text");
const equalizer = document.getElementById("equalizer");
const talkBanner = document.getElementById("talk-banner");

let currentPath = null;
let isPlaying = false;

// MSE para voz del DJ
let talkAudio = null;
let talkMediaSource = null;
let talkSourceBuffer = null;
let talkQueue = [];

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

socket.addEventListener("message", async (event) => {
  if (event.data instanceof Blob) {
    const buf = await event.data.arrayBuffer();
    talkQueue.push(buf);
    flushTalkQueue();
    return;
  }

  const data = JSON.parse(event.data);

  if (data.type === "play" || data.type === "playAd" || data.type === "himno") {
    loadTrack(data.path, data.currentTime || 0);
  } else if (data.type === "pause") {
    audio.pause();
    setPlaying(false);
    hintText.textContent = "La radio está en pausa";
  } else if (data.type === "talkStart") {
    audio.volume = 0.15;
    talkBanner.classList.add("talk-banner--active");
    setupTalkStream();
  } else if (data.type === "talkStop") {
    audio.volume = 1;
    talkBanner.classList.remove("talk-banner--active");
    teardownTalkStream();
  }
});

const loadTrack = (path, currentTime) => {
  currentPath = path;
  const filename = path.split(/[\\/]/).pop().replace(/\.[^.]+$/, "");
  songName.textContent = filename;
  hintText.textContent = "Presiona play para escuchar";

  audio.src = "/" + path;
  audio.load();
  audio.currentTime = currentTime;
  btnPlay.disabled = false;

  if (isPlaying) {
    audio.play().catch(() => {});
  }
};

btnPlay.addEventListener("click", () => {
  if (!currentPath) return;
  if (audio.paused) {
    audio.play().then(() => setPlaying(true)).catch(() => {});
  } else {
    audio.pause();
    setPlaying(false);
  }
});

audio.addEventListener("ended", () => {
  setPlaying(false);
  hintText.textContent = "Esperando siguiente canción...";
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

// MSE — reproducción de voz del DJ en streaming
const setupTalkStream = () => {
  talkAudio = new Audio();
  talkAudio.autoplay = true;
  talkMediaSource = new MediaSource();
  talkAudio.src = URL.createObjectURL(talkMediaSource);
  talkMediaSource.addEventListener("sourceopen", () => {
    try {
      const mimeType = MediaSource.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";
      talkSourceBuffer = talkMediaSource.addSourceBuffer(mimeType);
      talkSourceBuffer.mode = "sequence";
      talkSourceBuffer.addEventListener("updateend", flushTalkQueue);
      flushTalkQueue();
    } catch (e) {
      console.error("MSE error:", e);
    }
  });
};

const flushTalkQueue = () => {
  if (!talkSourceBuffer || talkSourceBuffer.updating || talkQueue.length === 0) return;
  talkSourceBuffer.appendBuffer(talkQueue.shift());
};

const teardownTalkStream = () => {
  talkQueue = [];
  if (talkMediaSource && talkMediaSource.readyState === "open") {
    try { talkMediaSource.endOfStream(); } catch (_) {}
  }
  if (talkAudio) {
    talkAudio.src = "";
    talkAudio = null;
  }
  talkMediaSource = null;
  talkSourceBuffer = null;
};
