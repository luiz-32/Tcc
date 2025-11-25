const multer = require("multer");
const path = require("path");
const connection = require('../db');  

// ====== CONFIGURAÇÃO DE ARMAZENAMENTO ======
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');  
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);  
    cb(null, Date.now() + ext); 
  }
});

const upload = multer({ storage: storage });

// ====== UPLOAD DE ARQUIVO ======
const uploadFile = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ erro: "Nenhum arquivo enviado." });
  }

  res.status(200).json({ message: "Arquivo enviado com sucesso!", path: req.file.path });
};

// ====== BUSCAR TODOS OS ALIMENTOS ======
const getAlimentos = (req, res) => {
  const sql = "SELECT * FROM alimentos";
  connection.query(sql, (err, results) => {
    if (err) return res.status(500).json({ erro: "Erro ao buscar alimentos" });
    res.json(results);
  });
};

// ====== BUSCAR ALIMENTO POR ID ======
const getDescricaoPorId = (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM descricao WHERE id_alimento = ?";

  connection.query(sql, [id], (err, results) => {
    if (err) {
      console.error("Erro ao buscar descrição:", err);
      return res.status(500).json({ erro: "Erro no servidor" });
    }

    if (results.length === 0) {
      return res.status(404).json({ erro: "Descrição não encontrada" });
    }

    res.json(results[0]);
  });
};
// ===== BUSCAR CATEGORIAS =====
const getCategorias = (req, res) => {
  const sql = "SELECT * FROM categorias";
  connection.query(sql, (err, results) => {
    if (err) return res.status(500).json({ erro: "Erro ao buscar categorias" });
    res.json(results);
  });
};

// ===== BUSCAR ALIMENTOS POR CATEGORIA =====
const getAlimentosPorCategoria = (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM alimentos WHERE id_categoria = ?";
  connection.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ erro: "Erro ao buscar alimentos da categoria" });
    res.json(results);
  });
};

module.exports = {
  uploadFile,
  getAlimentos,
  upload,
  getDescricaoPorId,
  getCategorias,
  getAlimentosPorCategoria
};

