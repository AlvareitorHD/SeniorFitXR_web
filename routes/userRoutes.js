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
  res.render("users", { users: req.users });
});

router.get("/api/usuarios", (req, res) => res.json(req.users));

// Registro de usuario
router.post("/register", upload.single("photo"), (req, res) => {
  const { name, height } = req.body;
  const users = req.users;

  if (!name?.trim()) return res.status(400).json({ error: "Nombre vacío" });
  if (!height?.trim()) return res.status(400).json({ error: "Altura vacía" });

  const heightNum = parseInt(height, 10);
  if (isNaN(heightNum) || heightNum <= 0 || heightNum >= 250) {
    return res.status(400).json({ error: "Altura no válida" });
  }

  if (req.file) {
    const { mimetype, size, originalname } = req.file;
    const ext = path.extname(originalname).toLowerCase();
    const validExtensions = [".jpg", ".jpeg", ".png", ".gif"];
    if (!mimetype.startsWith("image/") || size > 5 * 1024 * 1024 || !validExtensions.includes(ext)) {
      return res.status(400).json({ error: "Imagen no válida" });
    }
  }

  const newId = users.length > 0 ? users[users.length - 1].id + 1 : 1;
  const photoUrl = req.file ? `/uploads/${req.file.filename}` : "/uploads/default.png";

  users.push({ id: newId, name: name.trim(), height: heightNum, photoUrl });
  saveUsers(users);
  res.redirect("/usuarios");
});

module.exports = router;
