const express = require("express");
const alimentosController = require('../controllers/alimentosController');

const router = express.Router();


router.post("/upload", alimentosController.upload.single('file'), alimentosController.uploadFile);

router.get("/alimentos", alimentosController.getAlimentos);

module.exports = router;
