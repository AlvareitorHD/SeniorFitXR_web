## 🔐 Certificados SSL para entorno local

Este proyecto utiliza HTTPS en el entorno de desarrollo. Para eso, debes generar un par de certificados autofirmados. **Nunca subas estos certificados al repositorio.**

### 🛠 Cómo generar los certificados

Abre una terminal en la raíz del proyecto y ejecuta:

```bash
mkdir ssl
openssl req -x509 -newkey rsa:4096 -keyout ssl/key.pem -out ssl/cert.pem -days 365 -nodes
