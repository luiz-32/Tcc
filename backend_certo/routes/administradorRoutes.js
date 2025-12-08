const express = require('express');
const router = express.Router();
const adminController = require('../controllers/administradorController');

// Login admin
router.post('/admin/login', adminController.loginAdmin);

// Admin: listar usuários
router.get('/admin/usuarios', adminController.listarUsuariosAdmin);

// Admin: listar alimentos
router.get('/admin/alimentos', adminController.listarAlimentosAdmin);

// Admin: criar alimento
router.post('/admin/alimentos', adminController.criarAlimento);
router.put('/admin/alimentos/:id', adminController.atualizarAlimento);
router.delete('/admin/alimentos/:id', adminController.deletarAlimento);

module.exports = router;
