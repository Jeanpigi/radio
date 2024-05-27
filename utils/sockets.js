const WebSocket = require("ws");
const cron = require("node-cron");
const { getAllSongs } = require("../model/songLite");
const { getAllAds } = require("../model/adLite");
const { getAllPlaylists } = require("../model/playlistLite");
const {
  obtenerAnuncioAleatorioConPrioridad,
  obtenerAudioAleatoriaSinRepetir,
} = require("./getAudio");

module.exports = (server) => {
  const wss = new WebSocket.Server({ server });

  const clients = {};
  const recentlyPlayedSongs = [];
  const recentlyPlayedAds = [];

  let playlists = [];
  let songs = [];
  let currentPlaylistIndex = 0;
  let currentSongIndex = 0;

  const horasHimno = ["0 6 * * *", "0 12 * * *", "0 18 * * *", "0 0 * * *"];

  wss.on("connection", async (ws) => {
    console.log("Cliente conectado");

    clients[ws._socket.remoteAddress] = ws;
    const numClients = Object.keys(clients).length;
    console.log(`Número de clientes conectados: ${numClients}`);

    playlists = await getAllPlaylists();
    songs = await getAllSongs();

    const onTrackChange = (newTrack) => {
      broadcast({ type: "trackChange", track: newTrack });
    };

    const reproducirHimno = () => {
      const himnoPath = "himno/HimnoNacional.mp3";
      console.log(himnoPath);
      broadcast({ type: "himno", path: himnoPath });
      onTrackChange(himnoPath);
    };

    for (const hora of horasHimno) {
      cron.schedule(hora, () => {
        reproducirHimno();
      });
    }

    ws.on("message", async (message) => {
      const { type } = JSON.parse(message);
      if (type === "play") {
        try {
          if (playlists.length > 0) {
            playNextSongInPlaylist();
          } else {
            let songPath;
            const randomSong = obtenerAudioAleatoriaSinRepetir(
              songs,
              recentlyPlayedSongs
            );
            songPath = randomSong
              ? decodeURIComponent(randomSong.filepath).replace("public/", "")
              : null;

            if (songPath) {
              console.log("Ruta de la canción:", songPath);
              broadcast({ type: "play", path: songPath });
              onTrackChange(songPath);
            } else {
              console.error("La ruta de la canción es inválida o undefined");
            }
          }
        } catch (error) {
          console.error("Error al obtener la canción", error);
        }
      } else if (type === "pause") {
        broadcast({ type: "pause" });
      } else if (type === "ads") {
        try {
          const ads = await getAllAds();
          const randomAd = obtenerAnuncioAleatorioConPrioridad(
            ads,
            recentlyPlayedAds
          );
          const decodedPath = decodeURIComponent(randomAd.filepath);
          const adWithoutPublic = decodedPath.replace("public/", "");
          broadcast({ type: "playAd", path: adWithoutPublic });
          onTrackChange(adWithoutPublic);
        } catch (error) {
          console.error("Error al obtener el anuncio", error);
        }
      }
    });

    ws.on("close", () => {
      delete clients[ws._socket.remoteAddress];
    });
  });

  const playNextSongInPlaylist = () => {
    if (playlists.length === 0) return;

    const currentPlaylist = playlists[currentPlaylistIndex];
    const currentSong = currentPlaylist.songs[currentSongIndex];

    if (!currentSong) return;

    const songPath = decodeURIComponent(currentSong.filepath).replace(
      "public/",
      ""
    );

    console.log("Reproduciendo canción:", songPath);
    broadcast({ type: "play", path: songPath });

    currentSongIndex++;

    if (currentSongIndex >= currentPlaylist.songs.length) {
      currentSongIndex = 0;
      currentPlaylistIndex++;

      if (currentPlaylistIndex >= playlists.length) {
        currentPlaylistIndex = 0;
      }
    }
  };

  const broadcast = (data) => {
    Object.values(clients).forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  };
};
