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
    fechaRegistro: new Date().toISOString(),
    numeroSesiones: 0,
    tiempoTotalEjercicio: 0
  };

  users.push(nuevoUsuario);
  saveUsers(users);

  res.redirect("/usuarios");
});

module.exports = router;
