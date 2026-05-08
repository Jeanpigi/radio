const deviceIcons = {
  "Móvil": "fa-mobile-alt",
  "Windows": "fa-desktop",
  "Mac": "fa-laptop",
  "Linux": "fa-desktop",
  "Otro": "fa-globe",
  "Desconocido": "fa-question-circle",
};

const listenersList = document.getElementById("dash-listeners-list");
const listenersCount = document.getElementById("dash-listeners-count");

const fetchListeners = async () => {
  try {
    const res = await fetch("/api/listeners");
    if (!res.ok) return;
    const data = await res.json();

    listenersCount.textContent = data.count;

    if (!data.listeners || data.listeners.length === 0) {
      listenersList.innerHTML =
        '<div class="dash__item"><span class="dash__item-name" style="color:var(--text-3)">Sin oyentes conectados</span></div>';
      return;
    }

    listenersList.innerHTML = "";
    data.listeners.forEach((l) => {
      const icon = deviceIcons[l.device] || "fa-globe";
      const time = new Date(l.connectedAt).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
      const shortId = l.clientId.substring(0, 8);
      const item = document.createElement("div");
      item.className = "dash__item dash__listener-item";
      item.innerHTML =
        `<span class="dash__listener-device"><i class="fas ${icon}"></i> ${l.device}</span>` +
        `<span class="dash__listener-ip">${l.ip}</span>` +
        `<span class="dash__listener-id" title="${l.clientId}">${shortId}</span>` +
        `<span class="dash__listener-time"><i class="fas fa-clock"></i> ${time}</span>`;
      listenersList.appendChild(item);
    });
  } catch {
    // silently ignore fetch errors
  }
};

fetchListeners();
setInterval(fetchListeners, 15000);
