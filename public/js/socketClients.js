const elements = {
  playButton: document.getElementById("play-button"),
  play: document.getElementById("play-btn"),
  audioPlayer: document.getElementById("audio-player"),
  playerImage: document.getElementById("player-image"),
  titulo: document.getElementById("titulo"),
  range: document.getElementById("duration__range"),
  forwardButton: document.getElementById("forward"),
  backwardButton: document.getElementById("backward"),
};

let settings = {
  isRotating: false,
  animationId: null,
  isDragging: false,
  currentPath: null,
};

let baseVolume = 1;
let inMixerMode = false;
let talkAudio = null;

const wsUrl = `ws://${window.location.host}`;
const socket = new WebSocket(wsUrl);

const init = () => {
  elements.range.disabled = true;
  bindEvents();
};

const bindEvents = () => {
  socket.addEventListener("open", () => {
    socket.send(JSON.stringify({ type: "listenerConnect" }));
    console.log("Conectado a la radio");
  });

  socket.addEventListener("message", (event) => {
    const data = JSON.parse(event.data);
    if (data.type === "play" || data.type === "playAd" || data.type === "himno") {
      if (!inMixerMode) handlePlay(data.path, data.currentTime || 0);
    } else if (data.type === "pause") {
      handleRadioPause();
    } else if (data.type === "mixerStart") {
      inMixerMode = true;
      elements.audioPlayer.pause();
      talkAudio = new Audio("/stream/mixer");
      talkAudio.volume = baseVolume;
      talkAudio.play().catch(() => {});
    } else if (data.type === "mixerStop") {
      inMixerMode = false;
      if (talkAudio) {
        talkAudio.pause();
        talkAudio.src = "";
        talkAudio = null;
      }
      elements.audioPlayer.volume = baseVolume;
    } else if (data.type === "setVolume") {
      baseVolume = data.value;
      elements.audioPlayer.volume = data.value;
      if (talkAudio) talkAudio.volume = data.value;
    }
  });

  socket.addEventListener("close", () => {
    console.log("Desconectado de la radio");
  });

  // Control local: silenciar/escuchar sin afectar la radio global
  elements.playButton.addEventListener("click", () => {
    if (elements.audioPlayer.paused) {
      elements.audioPlayer.play();
    } else {
      elements.audioPlayer.pause();
    }
    updateControls();
  });

  elements.range.addEventListener("input", updateProgress);
  elements.range.addEventListener("mousedown", () => { settings.isDragging = true; });
  elements.range.addEventListener("mouseup", () => { settings.isDragging = false; });
  elements.audioPlayer.addEventListener("loadedmetadata", updateProgress);
  elements.audioPlayer.addEventListener("timeupdate", debounce(updateProgress, 100));
  elements.audioPlayer.addEventListener("error", () => {
    console.error("Error reproduciendo audio");
  });
};

const handlePlay = (path, currentTime) => {
  if (!path) return;
  settings.currentPath = path;
  elements.audioPlayer.src = path;
  elements.audioPlayer.load();
  elements.audioPlayer.currentTime = currentTime;
  elements.audioPlayer.play();
  changeSongTitle(path);
  updateControls();
  if (!settings.isRotating) {
    rotateImage();
    settings.isRotating = true;
  }
};

const handleRadioPause = () => {
  elements.audioPlayer.pause();
  updateControls();
  stopRotation();
};

const rotateImage = () => {
  if (!elements.audioPlayer.paused) {
    elements.playerImage.style.transform += "rotate(1deg)";
    settings.animationId = requestAnimationFrame(rotateImage);
  } else {
    settings.isRotating = false;
  }
};

const stopRotation = () => {
  cancelAnimationFrame(settings.animationId);
  settings.isRotating = false;
};

const updateControls = () => {
  const isPaused = elements.audioPlayer.paused;
  if (isPaused) {
    elements.play.classList.replace("fa-pause", "fa-play");
    elements.playButton.classList.remove("orange");
  } else {
    elements.play.classList.replace("fa-play", "fa-pause");
    elements.playButton.classList.add("orange");
  }
};

const changeSongTitle = (path) => {
  elements.titulo.innerText = path.split(/[\\/]/).pop();
};

const updateProgress = () => {
  const { duration, currentTime } = elements.audioPlayer;
  if (!duration || isNaN(duration)) return;
  const percent = (currentTime / duration) * 100;
  elements.range.value = percent;
  elements.range.style.setProperty("--progress", percent);
  document.querySelector(".start").textContent = formatTime(currentTime);
  document.querySelector(".end").textContent = formatTime(duration);
};

const formatTime = (time) => {
  if (isNaN(time)) return "00:00";
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${padTime(minutes)}:${padTime(seconds)}`;
};

const padTime = (t) => (t < 10 ? `0${t}` : t);

const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

init();
