const express = require("express");
const router = express.Router();
const alimentosController = require("../controllers/alimentosController");

router.get("/alimentos", alimentosController.getAlimentos);
router.get("/descricao/:id", alimentosController.getDescricaoPorId);
router.post("/upload", alimentosController.upload.single("imagem"), alimentosController.uploadFile);


module.exports = router;
