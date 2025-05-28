const app = require("./server");
const http = require("http");

const PORT = 3000;

http.createServer(app).listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor HTTP activo en http://0.0.0.0:${PORT}`);
});
