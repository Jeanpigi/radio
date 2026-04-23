const clients = new Set();
let initChunk = null; // primer chunk contiene el encabezado EBML — necesario para decodificar

const push = (chunk) => {
  if (!initChunk) initChunk = chunk;
  const dead = [];
  clients.forEach((res) => {
    try { res.write(chunk); } catch { dead.push(res); }
  });
  dead.forEach((res) => clients.delete(res));
};

const addClient = (res) => {
  // enviar encabezado de inicialización al cliente que se conecta tarde
  if (initChunk) res.write(initChunk);
  clients.add(res);
};

const removeClient = (res) => {
  clients.delete(res);
};

const reset = () => {
  initChunk = null;
  clients.forEach((res) => { try { res.end(); } catch {} });
  clients.clear();
};

module.exports = { push, addClient, removeClient, reset };
