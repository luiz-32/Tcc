const connection = require('../db'); // Agora a conexão é importada do db.js
const jwt = require('jsonwebtoken');
const JWT_SECRET = "troque_essa_chave_para_uma_secreta_e_complexa";

// CADASTRO - POST /usuario
const cadastrarUsuario = (req, res) => {
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
};

// AUTENTICAÇÃO - POST /login
const loginUsuario = (req, res) => {
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
};

// LISTAR USUÁRIOS - GET /usuario
const listarUsuarios = (req, res) => {
  const sql = "SELECT id, nome_usuario FROM usuario";
  connection.query(sql, (err, results) => {
    if (err) return res.status(500).json({ erro: "Erro ao buscar usuários" });
    res.json(results);
  });
};

// EXCLUIR USUÁRIO - DELETE /usuario/:id
const excluirUsuario = (req, res) => {
  const { id } = req.params;
  const { senha } = req.body;

  if (!senha) {
    return res.status(400).json({ erro: "Senha é obrigatória para exclusão." });
  }

  const selectSql = "SELECT senha FROM usuario WHERE id = ?";
  connection.query(selectSql, [id], (err, results) => {
    if (err) return res.status(500).json({ erro: "Erro interno no servidor" });
    if (results.length === 0) return res.status(404).json({ erro: "Usuário não encontrado" });

    const user = results[0];
    if (senha !== user.senha) {
      return res.status(401).json({ erro: "Senha incorreta" });
    }

    const deleteSql = "DELETE FROM usuario WHERE id = ?";
    connection.query(deleteSql, [id], (deleteErr) => {
      if (deleteErr) return res.status(500).json({ erro: "Erro ao deletar usuário" });
      res.json({ mensagem: "Usuário excluído com sucesso", id });
    });
  });
};

module.exports = {
  cadastrarUsuario,
  loginUsuario,
  listarUsuarios,
  excluirUsuario,
};
