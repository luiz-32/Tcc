const express = require("express");
const cors = require("cors");
const path = require("path");
const usuarioRoutes = require('./routes/usuarioRoutes'); 
const alimentosRoutes = require('./routes/alimentosRoutes'); 
const favoritosRoutes = require('./routes/favoritosRoutes'); 

const app = express();
const port = 3000;

app.use(cors({ origin: "*", allowedHeaders: ["Content-Type", "Authorization"] }));
app.use(express.json());

// Serve static files from uploads directory
const uploadsPath = path.join(__dirname, 'uploads');
console.log(`[Static Files] Servindo arquivos estáticos de: ${uploadsPath}`);
app.use(express.static(uploadsPath));

// Also serve with /uploads prefix
app.use('/uploads', express.static(uploadsPath));

app.use(alimentosRoutes);
app.use(usuarioRoutes);
app.use(favoritosRoutes);

// Test route for debugging
app.get('/test-image', (req, res) => {
  console.log("[TEST-IMAGE] Rota de teste de imagem");
  res.sendFile(path.join(uploadsPath, 'img/soja.jpg'));
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});