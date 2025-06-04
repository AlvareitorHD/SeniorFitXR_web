// server.js
const express = require("express");
const path = require("path");
const multer = require("multer");
const fs = require("fs");

const app = express();

// Usuarios conectados
const usuariosConectados = new Set();

// Hacemos que esté accesible desde las rutas:
app.locals.usuariosConectados = usuariosConectados;

// Configuración (igual que antes)
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static("public"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/styles", express.static(path.join(__dirname, "styles")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const userRoutes = require("./routes/userRoutes");
app.use("/", userRoutes);

module.exports = app;
