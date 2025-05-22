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

app.post("/register", (req, res) => {
  const { name, height } = req.body;

  if (!name || !height) {
    return res.status(400).json({ error: "Faltan campos requeridos" });
  }

  // Ruta relativa a la imagen por defecto
  const defaultPhoto = "/uploads/default.png";

  const newUser = {
    name,
    height,
    photoUrl: defaultPhoto
  };

  users.push(newUser);
  saveUsersToFile();

  // Para uso desde Unity, devolvemos JSON
  res.status(201).json({ message: "Usuario registrado", user: newUser });
});


// Iniciar servidor HTTPS
https.createServer(credentials, app).listen(3000, '0.0.0.0', () => {
  console.log("Servidor HTTPS en https://192.168.1.252:3000");
});
