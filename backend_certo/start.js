console.log('[launcher] starting');
function safeRequire(name, path) {
  try {
    console.log(`[launcher] requiring ${name}`);
    const mod = require(path);
    console.log(`[launcher] ${name} required OK`);
    return mod;
  } catch (err) {
    console.error(`[launcher] error requiring ${name}`);
    console.error(err && err.stack ? err.stack : err);
    process.exit(1);
  }
}

safeRequire('express', 'express');
safeRequire('cors', 'cors');
safeRequire('path', 'path');

// controllers
safeRequire('alimentosController', './controllers/alimentosController');
safeRequire('usuarioController', './controllers/usuarioController');
safeRequire('favoritosController', './controllers/favoritosController');

// routes
safeRequire('alimentosRoutes', './routes/alimentosRoutes');
safeRequire('usuarioRoutes', './routes/usuarioRoutes');
safeRequire('favoritosRoutes', './routes/favoritosRoutes');

console.log('[launcher] now requiring index.js');
try {
  require('./index.js');
  console.log('[launcher] index.js required successfully');
} catch (err) {
  console.error('[launcher] error requiring index.js');
  console.error(err && err.stack ? err.stack : err);
  process.exit(1);
}
