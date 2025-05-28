const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const https = require("https");

const app = express();

// Leer certificados SSL (ajusta las rutas si están en otro lugar)
const privateKey = fs.readFileSync("ssl/key.pem", "utf8");
const certificate = fs.readFileSync("ssl/cert.pem", "utf8");
const credentials = { key: privateKey, cert: certificate };

// Configurar EJS como motor de plantillas
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware de archivos estáticos
app.use(express.static("public"));
app.use('/styles', express.static(path.join(__dirname, 'styles')));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.urlencoded({ extended: true }));

// Ruta del archivo de usuarios
const USERS_FILE = path.join(__dirname, 'data/users.json');

// Leer usuarios desde archivo al iniciar
let users = [];
function readUsersFromFile() {
  if (fs.existsSync(USERS_FILE)) {
    try {
      const raw = fs.readFileSync(USERS_FILE, 'utf-8');
      return JSON.parse(raw);
    } catch (err) {
      console.error("Error leyendo users.json:", err);
      return [];
    }
  }
  return [];
}
users = readUsersFromFile();

// Llamar a la función para leer usuarios al recibir una solicitud
app.use((req, res, next) => {
  users = readUsersFromFile();
  next();
});

// Guardar usuarios en archivo
function saveUsersToFile() {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// Configurar almacenamiento de fotos con multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// Rutas
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/registro", (req, res) => {
  res.render("register");
});

app.get("/usuarios", (req, res) => {
  res.render("users", { users });
});

// API para obtener usuarios
app.get("/api/usuarios", (req, res) => {
  res.json(users);
});

app.post("/register", upload.single('photo'), (req, res) => {
  const { name, height } = req.body;

  // Validaciones básicas
  if (!name || !name.trim()) {
    return res.status(400).json({ error: "El nombre no puede estar vacío" });
  }

  if (!height || !height.trim()) {
    return res.status(400).json({ error: "La altura no puede estar vacía" });
  }

  // altura debe ser un número entero positivo
  const heightNum  = parseInt(height, 10);

  if (isNaN(heightNum) || heightNum <= 0 || heightNum >= 250) {
    return res.status(400).json({ error: "La altura debe ser un número realista positivo" });
  }

  // Validación de archivo (si se subió uno)
  if (req.file) {
    const { mimetype, size, originalname } = req.file;

    if (!mimetype.startsWith("image/")) {
      return res.status(400).json({ error: "El archivo debe ser una imagen" });
    }

    if (size > 5 * 1024 * 1024) { // 5MB
      return res.status(400).json({ error: "La imagen no puede exceder los 5MB" });
    }

    const validExtensions = [".jpg", ".jpeg", ".png", ".gif"];
    const ext = path.extname(originalname).toLowerCase();

    if (!validExtensions.includes(ext)) {
      return res.status(400).json({ error: "La imagen debe tener una extensión válida (.jpg, .jpeg, .png, .gif)" });
    }
  }

  // Generar ID automáticamente
  const newId = users.length > 0 ? users[users.length - 1].id + 1 : 1;

  // Construir ruta de imagen
  const photoUrl = req.file ? `/uploads/${req.file.filename}` : "/uploads/default.png";

  // Crear y guardar usuario
  const newUser = {
    id: newId,
    name: name.trim(),
    height: heightNum,
    photoUrl
  };

  users.push(newUser);
  saveUsersToFile();

  // Redirigir a la página de usuarios
  res.redirect("/usuarios");
});




// Iniciar servidor HTTPS
https.createServer(credentials, app).listen(3000, '0.0.0.0', () => {
  console.log("Servidor HTTPS en https://192.168.1.252:3000");
});
