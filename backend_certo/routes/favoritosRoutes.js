const express = require("express");
const router = express.Router();
const favoritosController = require('../controllers/favoritosController');

// Rotas de favoritos - rotas mais específicas primeiro
router.get("/favoritos/check/:id_usuario/:id_alimento", favoritosController.verificarFavorito);
router.post("/favoritos", favoritosController.adicionarFavorito);
router.get("/favoritos/:id_usuario", favoritosController.listarFavoritos);
router.delete("/favoritos/:id_favorito", favoritosController.deletarFavorito);

module.exports = router;
