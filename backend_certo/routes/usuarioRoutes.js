const express = require("express");
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');

// Rotas de usuário
router.post("/usuario", usuarioController.cadastrarUsuario);
router.post("/login", usuarioController.loginUsuario);
router.get("/usuario", usuarioController.listarUsuarios);
router.delete("/usuario/:id", usuarioController.excluirUsuario);

module.exports = router;
