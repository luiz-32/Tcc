const express = require("express");
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const alimentosController = require('../controllers/alimentosController');

// Rotas de usuário
router.post("/usuario", usuarioController.cadastrarUsuario);
router.post("/login", usuarioController.loginUsuario);
router.get("/usuario", usuarioController.listarUsuarios);
router.delete("/usuario/:id", usuarioController.excluirUsuario);
router.put("/usuario/:id", usuarioController.atualizarUsuario);
// Allow PATCH as an alias to update (some clients use PATCH)
router.patch("/usuario/:id", usuarioController.atualizarUsuario);

// Upload foto de perfil (campo 'foto_perfil')
router.post('/usuario/:id/foto', alimentosController.upload.single('foto_perfil'), usuarioController.atualizarFotoPerfil);

module.exports = router;
