// discovery.js
const dgram = require("dgram");
const os = require("os");

const BROADCAST_PORT = 41234;
const BROADCAST_ADDR = "255.255.255.255";

function getLocalIPv4() {
  const interfaces = os.networkInterfaces();
  for (const name in interfaces) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "127.0.0.1";
}

function startBroadcasting(port = 3000) {
  const server = dgram.createSocket("udp4");

  server.bind(() => {
    server.setBroadcast(true);
    setInterval(() => {
      const ip = getLocalIPv4();
      const message = Buffer.from(JSON.stringify({ ip, port }));
      server.send(message, 0, message.length, BROADCAST_PORT, BROADCAST_ADDR);
      console.log(`[UDP] Broadcast enviado: ${message}`);
    }, 2000);
  });
}

module.exports = { startBroadcasting };
