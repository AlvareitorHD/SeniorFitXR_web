// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const USERS_FILE = path.join(__dirname, "..", "data", "users.json");

// Leer usuarios
function readUsers() {
  if (fs.existsSync(USERS_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
    } catch {
      return [];
    }
  }
  return [];
}

// Guardar usuarios
function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// Configuración de multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// Middleware para refrescar usuarios
router.use((req, res, next) => {
  req.users = readUsers();
  next();
});

// Rutas principales
router.get("/", (req, res) => res.render("index"));

router.get("/registro", (req, res) => res.render("register"));

router.get("/usuarios", (req, res) => {
  // Renderiza la vista de usuarios con la lista de usuarios (nombre, altura y fotoURL)
  res.render("users", { users: req.users });
});

// Obtener detalles de un usuario específico
// Mostrar expediente detallado con user.ejs
router.get("/usuarios/:id", (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const user = req.users.find(u => u.id === userId);

  if (!user) {
    return res.status(404).render("error", { message: "Usuario no encontrado" });
  }

  res.render("user", { user }); // user.ejs
});


router.get("/api/usuarios", (req, res) => {
  // Devuelve una lista de usuarios (nombre y fotoURL) en formato JSON
  const users = req.users.map(user => ({
    id: user.id,
    name: user.name,
    photoUrl: user.photoUrl
  }));
  res.json(users);
}
);

router.get("/api/usuarios/:id", (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const user = req.users.find(u => u.id === userId);

  if (!user) {
    return res.status(404).json({ error: "Usuario no encontrado" });
  }
  //Print
  console.log(`Detalles del usuario ${userId}:`, user);

  // Devuelve el usuario completo en formato JSON
  res.json(user);
});

// Registro de usuario
router.post("/register", upload.single("photo"), (req, res) => {
  const { name, height } = req.body;
  const users = req.users;

  if (!name?.trim()) return res.status(400).json({ error: "Nombre vacío" });
  if (!height?.trim()) return res.status(400).json({ error: "Altura vacía" });

  const heightNum = parseInt(height, 10);
  if (isNaN(heightNum) || heightNum <= 0 || heightNum >= 250) {
    return res.status(400).json({ error: "Altura no válida (en metros)" });
  }

  // Validación de la imagen
  let photoUrl = "/uploads/default.png";
  if (req.file) {
    const { mimetype, size, originalname } = req.file;
    const ext = path.extname(originalname).toLowerCase();
    const validExtensions = [".jpg", ".jpeg", ".png", ".gif"];
    if (
      !mimetype.startsWith("image/") ||
      size > 5 * 1024 * 1024 ||
      !validExtensions.includes(ext)
    ) {
      return res.status(400).json({ error: "Imagen no válida" });
    }

    photoUrl = `/uploads/${req.file.filename}`;
  }

  const newId = users.length > 0 ? users[users.length - 1].id + 1 : 1;

  const nuevoUsuario = {
    id: newId,
    name: name.trim(),
    height: heightNum,
    photoUrl: photoUrl,
    puntosTotales: 0,
    puntosSesion: 0,
    logros: [],
    retosCompletados: [],
    // Comprobar si hay fecha de registro en el cuerpo de la solicitud
    // Si no, usar la fecha actual
    fechaRegistro: req.body.fechaRegistro? new Date(req.body.fechaRegistro).toISOString() : new Date().toISOString(),
    numeroSesiones: 0,
    tiempoTotalEjercicio: 0
  };

  users.push(nuevoUsuario);
  saveUsers(users);

  res.redirect("/usuarios");
});

// Actualizar sólo los datos de un usuario que se han enviado
router.patch("/api/usuarios/:id", (req, res) => {
  const userId = parseInt(req.params.id, 10);
  if (isNaN(userId)) {
    return res.status(400).json({ error: "ID de usuario no válido" });
  }

  const users = readUsers();
  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex === -1) {
    return res.status(404).json({ error: "Usuario no encontrado" });
  }

  const user = users[userIndex];

  const camposActualizables = [
    "name",
    "height",
    "photoUrl",
    "puntosTotales",
    "puntosSesion",
    "logros",
    "retosCompletados",
    "numeroSesiones",
    "tiempoTotalEjercicio"
  ];

  for (const campo of camposActualizables) {
    if (req.body[campo] !== undefined) {
      if (campo === "height") {
        const heightNum = parseInt(req.body[campo], 10);
        if (isNaN(heightNum) || heightNum <= 0 || heightNum >= 250) {
          return res.status(400).json({ error: "Altura no válida (en centímetros)" });
        }
        user[campo] = heightNum;
      } else {
        user[campo] = req.body[campo];
      }
    }
  }

  users[userIndex] = user;
  saveUsers(users);

  // Emitir evento a la sala del usuario
  const io = req.app.locals.io;
  if (io) {
    io.to(`usuario-${userId}`).emit("usuarioActualizado", user);
  }

  res.json({ mensaje: "Usuario actualizado correctamente", usuario: user });
});

router.post("/api/usuarios/:id/connect", (req, res) => {
  const userId = parseInt(req.params.id, 10);
  if (isNaN(userId)) return res.status(400).json({ error: "ID inválido" });

  const usuariosConectados = req.app.locals.usuariosConectados;
  usuariosConectados.add(userId);

  const io = req.app.locals.io;
  if (io) {
    io.emit("usuarioConectado", { userId, conectado: true });
  }
  res.json({ mensaje: `Usuario ${userId} conectado.` });
});

router.post("/api/usuarios/:id/disconnect", (req, res) => {
  const userId = parseInt(req.params.id, 10);
  if (isNaN(userId)) return res.status(400).json({ error: "ID inválido" });

  const usuariosConectados = req.app.locals.usuariosConectados;
  usuariosConectados.delete(userId);

  const io = req.app.locals.io;
  if (io) {
    io.emit("usuarioConectado", { userId, conectado: false });
  }
  res.json({ mensaje: `Usuario ${userId} desconectado.` });
});

router.post('/api/usuarios/:id/rom', (req, res) => {
  const { id } = req.params;
  const { cabeza, manoIzquierda, manoDerecha } = req.body;

  // Validar datos
  if (
    typeof cabeza !== 'number' || cabeza < 0 || cabeza > 1 ||
    typeof manoIzquierda !== 'number' || manoIzquierda < 0 || manoIzquierda > 1 ||
    typeof manoDerecha !== 'number' || manoDerecha < 0 || manoDerecha > 1
  ) {
    return res.status(400).json({ error: 'Datos inválidos o fuera de rango (0-1)' });
  }

  // Buscar usuario
  const usuario = req.users.find(u => u.id === parseInt(id, 10));
  if (isNaN(parseInt(id, 10)) || !usuario) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }

  // Actualizar ROM (puedes guardar o no según necesites)
  usuario.rom = { cabeza, manoIzquierda, manoDerecha };

  // Emitir actualización solo a la sala del usuario con Socket.IO
  const io = req.app.locals.io;
  io.to(`usuario-${id}`).emit('romActualizado', { usuarioId: id, rom: usuario.rom });

  return res.json({ mensaje: 'Datos ROM recibidos y emitidos' });
});

router.post('/api/usuarios/:id/ejercicio', async (req, res) => {
  const userId = req.params.id;
  const { ejercicioActual } = req.body;

  // Aquí simplemente emitimos por Socket.IO
  const io = req.app.locals.io;
  if (io) {
    io.to(`usuario-${userId}`).emit('ejercicioActual', `Ejercicio Actual: ${ejercicioActual}`);
  }


  console.log(`Usuario ${userId} ahora está en: ${ejercicioActual}`);
  res.sendStatus(200);
});


module.exports = router;
