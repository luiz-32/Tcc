const multer = require("multer");
const path = require("path");
const connection = require('../db');  


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


const uploadFile = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ erro: "Nenhum arquivo enviado." });
  }

  res.status(200).json({ message: "Arquivo enviado com sucesso!", path: req.file.path });
};

const getAlimentos = (req, res) => {
  const sql = "SELECT * FROM alimentos";
  connection.query(sql, (err, results) => {
    if (err) return res.status(500).json({ erro: "Erro ao buscar alimentos" });
    res.json(results);
  });
};

module.exports = {
  uploadFile,
  getAlimentos,
  upload
};
