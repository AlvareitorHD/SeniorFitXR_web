const app = require("./server");
const http = require("http");
const { Server } = require("socket.io");

const PORT = 3000;

// Crear servidor HTTP con Express
const server = http.createServer(app);

// Crear instancia de Socket.IO
const io = new Server(server);

// Guardar io en app.locals para usarlo en rutas o controladores
app.locals.io = io;

// Configurar eventos Socket.IO
io.on("connection", (socket) => {
  console.log("Cliente conectado:", socket.id);

  socket.emit("estadoInicialConexiones", Array.from(app.locals.usuariosConectados));

  socket.on("suscribirseUsuario", (userId) => {
    socket.join(`usuario-${userId}`);
    console.log(`Socket ${socket.id} se unió a la sala usuario-${userId}`);
  });

  socket.on("disconnect", () => {
    console.log("Cliente desconectado:", socket.id);
  });
});

// Levantar servidor HTTP + WebSocket
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor HTTP activo en http://0.0.0.0:${PORT}`);
});
