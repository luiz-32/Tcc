const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const jwt = require("jsonwebtoken");
// const bcrypt = require("bcrypt"); // Opcional: use depois para hash de senha

const app = express();
const port = 3000;
const JWT_SECRET = "troque_essa_chave_para_uma_secreta_e_complexa";

app.use(cors({ origin: "*", allowedHeaders: ["Content-Type", "Authorization"] }));
app.use(express.json());

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "banco_dados",
  port: 3306
});

connection.connect(err => {
  if (err) {
    console.error("Erro ao conectar no banco:", err);
    return;
  }
  console.log("Conectado ao MariaDB!");
});

// ============================
// ROTAS DE USUÁRIO (CRUD + CADASTRO)
// ============================

// POST /usuario - CADASTRO
app.post("/usuario", (req, res) => {
  const { nome_usuario, senha } = req.body;
  if (!nome_usuario || !senha) return res.status(400).json({ erro: "Informe nome e senha." });

  const checkSql = "SELECT id FROM usuario WHERE nome_usuario = ?";
  connection.query(checkSql, [nome_usuario], (err, results) => {
    if (err) return res.status(500).json({ erro: "Erro interno" });
    if (results.length > 0) return res.status(409).json({ erro: "Usuário já existe" });

    const insertSql = "INSERT INTO usuario (nome_usuario, senha) VALUES (?, ?)";
    connection.query(insertSql, [nome_usuario, senha], (insertErr, insertResult) => {
      if (insertErr) return res.status(500).json({ erro: "Erro ao cadastrar usuário" });

      const selectSql = "SELECT id, nome_usuario FROM usuario WHERE id = ?";
      connection.query(selectSql, [insertResult.insertId], (selectErr, newUser) => {
        if (selectErr) return res.status(500).json({ erro: "Erro ao buscar usuário criado" });
        res.status(201).json(newUser[0]);
      });
    });
  });
});

// POST /login - AUTENTICAÇÃO
app.post("/login", (req, res) => {
  const { nome_usuario, senha } = req.body;
  if (!nome_usuario || !senha) return res.status(400).json({ erro: "Informe nome e senha." });

  const sql = "SELECT id, nome_usuario, senha FROM usuario WHERE nome_usuario = ?";
  connection.query(sql, [nome_usuario], (err, results) => {
    if (err) return res.status(500).json({ erro: "Erro no login" });
    if (!results || results.length === 0) return res.status(401).json({ erro: "Credenciais inválidas" });

    const user = results[0];
    if (senha !== user.senha) return res.status(401).json({ erro: "Credenciais inválidas" });

    delete user.senha;
    const token = jwt.sign({ id: user.id, nome_usuario: user.nome_usuario }, JWT_SECRET, { expiresIn: "2h" });
    res.json({ token, user });
  });
});

// GET /usuario - Listar todos usuários
app.get("/usuario", (req, res) => {
  const sql = "SELECT id, nome_usuario FROM usuario";
  connection.query(sql, (err, results) => {
    if (err) return res.status(500).json({ erro: "Erro ao buscar usuários" });
    res.json(results);
  });
});

// GET /usuario/:id - Buscar por ID
// DELETE /usuario/:id - Com verificação de senha e logs
app.delete("/usuario/:id", (req, res) => {
  const { id } = req.params;
  const { senha } = req.body;
  console.log(`Tentando excluir usuário com ID: ${id} e senha fornecida: ${senha}`);  // Log para depuração
  
  if (!senha) {
    console.log("Erro: Senha não fornecida");
    return res.status(400).json({ erro: "Senha é obrigatória para exclusão." });
  }

  const selectSql = "SELECT senha FROM usuario WHERE id = ?";
  connection.query(selectSql, [id], (err, results) => {
    if (err) {
      console.error("Erro ao buscar usuário para exclusão:", err);
      return res.status(500).json({ erro: "Erro interno no servidor" });
    }
    if (results.length === 0) {
      console.log(`Usuário com ID ${id} não encontrado`);
      return res.status(404).json({ erro: "Usuário não encontrado" });
    }
    const user = results[0];
    console.log(`Senha no banco: ${user.senha}, Senha fornecida: ${senha}`);
    if (senha !== user.senha) {  // Use bcrypt.compare em produção
      console.log("Senha incorreta para o usuário");
      return res.status(401).json({ erro: "Senha incorreta" });
    }

    const deleteSql = "DELETE FROM usuario WHERE id = ?";
    connection.query(deleteSql, [id], (deleteErr, deleteResult) => {
      if (deleteErr) {
        console.error("Erro ao deletar usuário:", deleteErr);
        return res.status(500).json({ erro: "Erro ao deletar usuário" });
      }
      console.log(`Usuário com ID ${id} excluído com sucesso`);
      res.json({ mensagem: "Usuário excluído com sucesso", id });
    });
  });
});

// PATCH /usuario/:id - Alterar nome
app.patch("/usuario/:id", (req, res) => {
  const { id } = req.params;
  const { nome_usuario } = req.body;
  if (!nome_usuario) return res.status(400).json({ erro: "Informe o novo nome" });

  const checkSql = "SELECT id FROM usuario WHERE nome_usuario = ? AND id != ?";
  connection.query(checkSql, [nome_usuario, id], (checkErr, checkResults) => {
    if (checkErr) return res.status(500).json({ erro: "Erro ao verificar nome" });
    if (checkResults.length > 0) return res.status(409).json({ erro: "Nome de usuário já existe" });

    const sql = "UPDATE usuario SET nome_usuario = ? WHERE id = ?";
    connection.query(sql, [nome_usuario, id], (err, result) => {
      if (err) return res.status(500).json({ erro: "Erro ao atualizar usuário" });
      res.json({ id, nome_usuario });
    });
  });
});

// PATCH /usuario/:id/senha - Alterar senha
app.patch("/usuario/:id/senha", (req, res) => {
  const { id } = req.params;
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) return res.status(400).json({ erro: "Informe senha antiga e nova" });

  const sql = "SELECT senha FROM usuario WHERE id = ?";
  connection.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ erro: "Erro interno" });
    if (!results || results.length === 0) return res.status(404).json({ erro: "Usuário não encontrado" });

    if (oldPassword !== results[0].senha) return res.status(401).json({ erro: "Senha antiga incorreta" });

    const updateSql = "UPDATE usuario SET senha = ? WHERE id = ?";
    connection.query(updateSql, [newPassword, id], (updateErr) => {
      if (updateErr) return res.status(500).json({ erro: "Erro ao atualizar senha" });
      res.json({ mensagem: "Senha alterada com sucesso" });
    });
  });
});

// ============================
// ROTAS PROTEGIDAS
// ============================

function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ erro: "Token não fornecido" });

  const parts = authHeader.split(' ');
  const token = parts.length === 2 ? parts[1] : null;
  if (!token) return res.status(401).json({ erro: "Formato do token inválido" });

  jwt.verify(token, JWT_SECRET, (err, payload) => {
    if (err) return res.status(401).json({ erro: "Token inválido" });
    req.user = payload;
    next();
  });
}

app.get("/perfil", verifyToken, (req, res) => {
  res.json({ user: req.user });
});

// ============================
// INÍCIO DO SERVIDOR
// ============================
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
