const WebSocket = require("ws");
const cron = require("node-cron");
const fs = require("fs");
const nodePath = require("path");
const { getAllSongs } = require("../model/songLite");
const { getAllAds } = require("../model/adLite");
const { getAllPlaylists } = require("../model/playlistLite");
const {
  obtenerAnuncioAleatorioConPrioridad,
  obtenerAudioAleatoriaSinRepetir,
} = require("./getAudio");
const mixerStream = require("./mixerStream");

module.exports = (server) => {
  const wss = new WebSocket.Server({ server });

  const listeners = new Set();
  let adminWs = null;

  const recentlyPlayedSongs = [];
  const recentlyPlayedAds = [];

  const playlistState = {
    active: false,
    name: "",
    songs: [],
    currentIndex: -1,
  };

  // Estado global de la radio
  const radioState = {
    path: null,
    type: null,       // 'song' | 'ad' | 'himno'
    startedAt: null,  // timestamp cuando empezó a sonar
    paused: false,
    pausedAt: null,   // timestamp cuando se pausó
    volume: 1,        // volumen global (0.0 - 1.0)
    mixerMode: false, // true cuando el mixer transmite directamente
  };

  // Timer de seguridad para avanzar automáticamente cuando termina un anuncio
  let adAutoAdvanceTimer = null;

  const clearAdTimer = () => {
    if (adAutoAdvanceTimer) {
      clearTimeout(adAutoAdvanceTimer);
      adAutoAdvanceTimer = null;
    }
  };

  const setAdTimer = (adPath) => {
    clearAdTimer();
    const fullPath = nodePath.join(__dirname, "..", "public", adPath);
    let durationMs = 180000;
    try {
      const stats = fs.statSync(fullPath);
      // Estimación ~128kbps CBR = 16KB/s + 8s de margen
      durationMs = Math.ceil(stats.size / 16000) * 1000 + 8000;
    } catch {}
    adAutoAdvanceTimer = setTimeout(() => {
      adAutoAdvanceTimer = null;
      advanceToNextSong();
    }, durationMs);
  };

  const advanceToNextSong = async () => {
    try {
      if (playlistState.active) {
        playlistState.currentIndex++;
        if (playlistState.currentIndex < playlistState.songs.length) {
          const song = playlistState.songs[playlistState.currentIndex];
          const songPath = decodeURIComponent(song.filepath).replace("public/", "");
          setRadioState(songPath, "song");
          broadcastToListeners({ type: "play", path: songPath, currentTime: 0 });
          notifyAdmin({
            type: "nowPlaying", path: songPath, kind: "song",
            playlistMode: true,
            playlistName: playlistState.name,
            playlistIndex: playlistState.currentIndex,
            playlistTotal: playlistState.songs.length,
          });
          return;
        }
        playlistState.active = false;
        playlistState.songs = [];
        playlistState.currentIndex = -1;
        playlistState.name = "";
      }
      const songs = await getAllSongs();
      const song = obtenerAudioAleatoriaSinRepetir(songs, recentlyPlayedSongs);
      if (song) {
        const songPath = decodeURIComponent(song.filepath).replace("public/", "");
        setRadioState(songPath, "song");
        broadcastToListeners({ type: "play", path: songPath, currentTime: 0 });
        notifyAdmin({ type: "nowPlaying", path: songPath, kind: "song" });
      }
    } catch (err) {
      console.error("Error al avanzar siguiente canción:", err);
    }
  };

  const horasHimno = ["0 6 * * *", "0 12 * * *", "0 18 * * *", "0 0 * * *"];
  for (const hora of horasHimno) {
    cron.schedule(hora, () => {
      const himnoPath = "himno/HimnoNacional.mp3";
      setRadioState(himnoPath, "himno");
      broadcastToListeners({ type: "himno", path: himnoPath, currentTime: 0 });
      notifyAdmin({ type: "nowPlaying", path: himnoPath, kind: "himno" });
    });
  }

  wss.on("connection", (ws) => {
    ws.once("message", async (message) => {
      let data;
      try {
        data = JSON.parse(message);
      } catch {
        ws.close();
        return;
      }

      if (data.type === "adminConnect") {
        adminWs = ws;
        console.log("Admin conectado al WebSocket");
        syncAdminState(ws);
        handleAdminMessages(ws);
      } else if (data.type === "listenerConnect") {
        listeners.add(ws);
        console.log(`Listener conectado. Total: ${listeners.size}`);
        syncListenerState(ws);
        ws.on("close", () => {
          listeners.delete(ws);
          console.log(`Listener desconectado. Total: ${listeners.size}`);
        });
      } else {
        ws.close();
      }
    });
  });

  const handleAdminMessages = (ws) => {
    ws.on("message", async (message, isBinary) => {
      if (isBinary) {
        if (radioState.mixerMode) {
          mixerStream.push(message);
        }
        return;
      }

      let data;
      try {
        data = JSON.parse(message);
      } catch {
        return;
      }

      if (data.type === "adminPlay") {
        playlistState.active = false;
        const songPath = data.path;
        setRadioState(songPath, "song");
        broadcastToListeners({ type: "play", path: songPath, currentTime: 0 });
        notifyAdmin({ type: "nowPlaying", path: songPath, kind: "song" });
      } else if (data.type === "adminPlaylist") {
        try {
          const playlists = await getAllPlaylists();
          const playlist = playlists.find((p) => p.id === data.playlistId);
          if (!playlist || playlist.songs.length === 0) return;
          playlistState.active = true;
          playlistState.name = playlist.name;
          playlistState.songs = playlist.songs;
          playlistState.currentIndex = 0;
          const song = playlist.songs[0];
          const songPath = decodeURIComponent(song.filepath).replace("public/", "");
          setRadioState(songPath, "song");
          broadcastToListeners({ type: "play", path: songPath, currentTime: 0 });
          notifyAdmin({
            type: "nowPlaying", path: songPath, kind: "song",
            playlistMode: true,
            playlistName: playlist.name,
            playlistIndex: 0,
            playlistTotal: playlist.songs.length,
          });
        } catch (err) {
          console.error("Error al iniciar playlist:", err);
        }
      } else if (data.type === "adminPause") {
        if (!radioState.paused && radioState.path) {
          radioState.paused = true;
          radioState.pausedAt = Date.now();
          broadcastToListeners({ type: "pause" });
          notifyAdmin({ type: "radioState", paused: true });
        }
      } else if (data.type === "adminResume") {
        if (radioState.paused && radioState.path) {
          const pausedDuration = Date.now() - radioState.pausedAt;
          radioState.startedAt += pausedDuration;
          radioState.paused = false;
          radioState.pausedAt = null;
          const currentTime = getElapsed();
          broadcastToListeners({ type: "play", path: radioState.path, currentTime });
          notifyAdmin({ type: "radioState", paused: false });
        }
      } else if (data.type === "adminNext") {
        await advanceToNextSong();
      } else if (data.type === "adminAd") {
        try {
          const ads = await getAllAds();
          const ad = obtenerAnuncioAleatorioConPrioridad(ads, recentlyPlayedAds);
          if (ad) {
            const adPath = decodeURIComponent(ad.filepath).replace("public/", "");
            setRadioState(adPath, "ad");
            broadcastToListeners({ type: "playAd", path: adPath, currentTime: 0 });
            notifyAdmin({ type: "nowPlaying", path: adPath, kind: "ad" });
            setAdTimer(adPath);
          }
        } catch (err) {
          console.error("Error al obtener anuncio:", err);
        }
      } else if (data.type === "adminPlayAd") {
        const adPath = data.path;
        setRadioState(adPath, "ad");
        broadcastToListeners({ type: "playAd", path: adPath, currentTime: 0 });
        notifyAdmin({ type: "nowPlaying", path: adPath, kind: "ad" });
        setAdTimer(adPath);
      } else if (data.type === "adminVolume") {
        const vol = Math.min(1, Math.max(0, Number(data.value) || 0));
        radioState.volume = vol;
        broadcastToListeners({ type: "setVolume", value: vol });
      } else if (data.type === "adminMixerStart") {
        radioState.mixerMode = true;
        broadcastToListeners({ type: "mixerStart" });
        notifyAdmin({ type: "mixerState", active: true });
        console.log("Modo mixer activado");
      } else if (data.type === "adminMixerStop") {
        radioState.mixerMode = false;
        mixerStream.reset();
        broadcastToListeners({ type: "mixerStop" });
        notifyAdmin({ type: "mixerState", active: false });
        console.log("Modo mixer desactivado");
        setTimeout(() => {
          listeners.forEach((client) => syncListenerState(client));
        }, 600);
      }
    });

    ws.on("close", () => {
      adminWs = null;
      if (radioState.mixerMode) {
        radioState.mixerMode = false;
        mixerStream.reset();
        broadcastToListeners({ type: "mixerStop" });
        setTimeout(() => {
          listeners.forEach((client) => syncListenerState(client));
        }, 600);
      }
      console.log("Admin desconectado");
    });
  };

  const setRadioState = (path, type) => {
    clearAdTimer();
    radioState.path = path;
    radioState.type = type;
    radioState.startedAt = Date.now();
    radioState.paused = false;
    radioState.pausedAt = null;
  };

  const getElapsed = () => {
    if (!radioState.startedAt) return 0;
    return (Date.now() - radioState.startedAt) / 1000;
  };

  const syncListenerState = (ws) => {
    if (radioState.volume !== 1) {
      send(ws, { type: "setVolume", value: radioState.volume });
    }
    // En modo mixer el listener espera el stream binario, no archivos
    if (radioState.mixerMode) {
      send(ws, { type: "mixerStart" });
      return;
    }
    if (!radioState.path || radioState.paused) return;
    const currentTime = getElapsed();
    const msgType = radioState.type === "himno" ? "himno" : radioState.type === "ad" ? "playAd" : "play";
    send(ws, { type: msgType, path: radioState.path, currentTime });
  };

  const syncAdminState = (ws) => {
    send(ws, {
      type: "nowPlaying",
      path: radioState.path,
      kind: radioState.type,
      paused: radioState.paused,
      playlistMode: playlistState.active,
      playlistName: playlistState.name,
      playlistIndex: playlistState.currentIndex,
      playlistTotal: playlistState.songs.length,
      mixerMode: radioState.mixerMode,
    });
  };

  const broadcastToListeners = (data) => {
    const msg = JSON.stringify(data);
    listeners.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(msg);
      }
    });
  };

  const notifyAdmin = (data) => {
    if (adminWs && adminWs.readyState === WebSocket.OPEN) {
      adminWs.send(JSON.stringify(data));
    }
  };

  const send = (ws, data) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  };
};
