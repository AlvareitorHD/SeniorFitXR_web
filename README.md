# 🚀 Servidor Node.js con Express + Docker + Ngrok

Este proyecto es un servidor web Node.js construido con Express. Permite manejar usuarios, actualizar datos y visualizar estadísticas con Chart.js y Socket.io. Incluye instrucciones para exponerlo mediante Ngrok.

---

## 📁 Estructura del proyecto

```
├── index.js
├── routes/
├── views/
├── public/
├── package.json
├── Dockerfile
├── .dockerignore
└── README.md
```

---

## 📦 Requisitos previos

* [Node.js](https://nodejs.org/) >= 18
* [npm](https://www.npmjs.com/)
* [Ngrok](https://ngrok.com/)

---

## 🚀 Cómo ejecutar localmente

1. Instala dependencias:

   ```bash
   npm install
   ```

2. Ejecuta el servidor:

   ```bash
   node index.js
   ```

   El servidor se iniciará en [http://localhost:3000](http://localhost:3000).

3. Exponer con Ngrok:

   En otra terminal:

   ```bash
   ngrok http --url=pegasus-powerful-imp.ngrok-free.app 3000
   ```

   Este dominio sólo lo puedo levantar con mi usuario Ngrok, por lo que si quieres exponerlo tendrás que registrarte en Ngrok, adquirir tu dominio estático y cambiar en el código de Unity la URL para poder usar el servidor con la app.

---

## ✅ Funcionalidades principales

* CRUD de usuarios (crear, actualizar nombre, altura, foto, eliminar)
* Actualización de estadísticas en tiempo real con Socket.io
* Visualización de estadísticas con Chart.js
* Soporte para archivos estáticos y subida de imágenes

---

## ⚙️ Scripts npm

```json
"scripts": {
  "start": "node index.js"
}
```

Ejecutar:

```bash
npm start
```

---

## 🧩 Tecnologías

* **Node.js**
* **Express**
* **EJS** (templates)
* **Chart.js** (gráficas)
* **Socket.io** (actualización en tiempo real)
* **Multer** (subida de archivos)
* **Ngrok** (exposición pública)

---

## 📝 Notas

* Por seguridad, guarda tus credenciales y variables sensibles en un archivo `.env` (no lo subas a GitHub).
* Se recomienda usar [ngrok authtoken](https://ngrok.com/docs) para URLs estables.

---
## 👨‍🦳🤸‍♀️ Proyecto App Unity SeniorFitXR

Este proyecto no incluye la app, ya que está en otro repositorio de GitHub:

* LINK: https://github.com/AlvareitorHD/SeniorFitXR.git

---

¡Contribuciones y sugerencias son bienvenidas! 🎉✨
