const express = require("express");
const cors = require("cors");
const path = require("path");
// We'll require route modules lazily inside try/catch so errors during
// route parsing are easier to identify and log.
let usuarioRoutes;
let alimentosRoutes;
let favoritosRoutes;

const app = express();
const port = 3000;

// Enable CORS for all routes and support preflight for PUT/PATCH/DELETE
try {
  console.log('[index] Applying CORS middleware');
  app.use(cors({ origin: '*', allowedHeaders: ['Content-Type', 'Authorization'], methods: ['GET','HEAD','PUT','PATCH','POST','DELETE','OPTIONS'] }));
  console.log('[index] CORS middleware applied (no app.options)');
} catch (e) {
  console.error('[index] Error while setting up CORS', e);
  throw e;
}

try {
  console.log('[index] Applying express.json() middleware');
  app.use(express.json());
} catch (e) {
  console.error('[index] Error while setting up express.json()', e);
  throw e;
}

// Serve static files from uploads directory
const uploadsPath = path.join(__dirname, 'uploads');
console.log(`[Static Files] Servindo arquivos estáticos de: ${uploadsPath}`);
try {
  console.log('[index] Applying express.static for uploadsPath');
  app.use(express.static(uploadsPath));
} catch (e) {
  console.error('[index] Error while applying express.static(uploadsPath)', e);
  throw e;
}

// Also serve with /uploads prefix
try {
  console.log('[index] Applying express.static for /uploads');
  app.use('/uploads', express.static(uploadsPath));
} catch (e) {
  console.error('[index] Error while applying /uploads static', e);
  throw e;
}

try {
  console.log('[Routes] Requiring alimentosRoutes');
  alimentosRoutes = require('./routes/alimentosRoutes');
  app.use(alimentosRoutes);
  console.log('[Routes] Mounted alimentosRoutes');
} catch (e) {
  console.error('[Routes] Error requiring/mounting alimentosRoutes', e);
  throw e;
}

try {
  console.log('[Routes] Requiring usuarioRoutes');
  usuarioRoutes = require('./routes/usuarioRoutes');
  app.use(usuarioRoutes);
  console.log('[Routes] Mounted usuarioRoutes');
} catch (e) {
  console.error('[Routes] Error requiring/mounting usuarioRoutes', e);
  throw e;
}

try {
  console.log('[Routes] Requiring favoritosRoutes');
  favoritosRoutes = require('./routes/favoritosRoutes');
  app.use(favoritosRoutes);
  console.log('[Routes] Mounted favoritosRoutes');
} catch (e) {
  console.error('[Routes] Error requiring/mounting favoritosRoutes', e);
  throw e;
}

try {
  console.log('[Routes] Requiring administradorRoutes');
  const administradorRoutes = require('./routes/administradorRoutes');
  app.use(administradorRoutes);
  console.log('[Routes] Mounted administradorRoutes');
} catch (e) {
  console.error('[Routes] Error requiring/mounting administradorRoutes', e);
  throw e;
}

// Test route for debugging
app.get('/test-image', (req, res) => {
  console.log("[TEST-IMAGE] Rota de teste de imagem");
  res.sendFile(path.join(uploadsPath, 'img/soja.jpg'));
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});