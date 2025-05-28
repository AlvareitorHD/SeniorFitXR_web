// server.js
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();

// Configurar EJS y archivos estáticos
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static("public"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/styles", express.static(path.join(__dirname, "styles")));
app.use(express.urlencoded({ extended: true }));

// Rutas
const userRoutes = require("./routes/userRoutes");
app.use("/", userRoutes);

module.exports = app;
