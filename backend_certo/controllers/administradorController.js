const connection = require('../db');
const jwt = require('jsonwebtoken');
const JWT_SECRET = "troque_essa_chave_para_uma_secreta_e_complexa";

// Login do administrador - POST /admin/login
const loginAdmin = (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) return res.status(400).json({ erro: 'Informe email e senha' });

  const sql = 'SELECT id, email FROM administrador WHERE email = ? AND senha = ?';
  connection.query(sql, [email, senha], (err, results) => {
    if (err) return res.status(500).json({ erro: 'Erro interno' });
    if (!results || results.length === 0) return res.status(401).json({ erro: 'Credenciais inválidas' });

    const admin = results[0];
    const token = jwt.sign({ id: admin.id, role: 'admin' }, JWT_SECRET, { expiresIn: '2h' });
    res.json({ token, admin: true, email: admin.email });
  });
};

// Listar todos os usuários - GET /admin/usuarios
const listarUsuariosAdmin = (req, res) => {
  const sql = 'SELECT id, email, nome_usuario FROM usuario';
  connection.query(sql, (err, results) => {
    if (err) return res.status(500).json({ erro: 'Erro ao buscar usuários' });
    res.json(results);
  });
};

// Listar todos os alimentos - GET /admin/alimentos
const listarAlimentosAdmin = (req, res) => {
  const sql = 'SELECT * FROM alimentos';
  connection.query(sql, (err, results) => {
    if (err) return res.status(500).json({ erro: 'Erro ao buscar alimentos' });
    res.json(results);
  });
};

// Criar novo alimento - POST /admin/alimentos
const criarAlimento = (req, res) => {
  const { nome, descricao, imagem, vegetariano, vegano, ovolacto, intolerante_lactose, intolerante_gluten, id_categoria } = req.body;
  if (!nome) return res.status(400).json({ erro: 'Nome é obrigatório' });

  const sql = `INSERT INTO alimentos (nome, descricao, imagem, vegetariano, vegano, ovolacto, intolerante_lactose, intolerante_gluten, id_categoria) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  connection.query(sql, [nome, descricao || null, imagem || null, !!vegetariano, !!vegano, !!ovolacto, !!intolerante_lactose, !!intolerante_gluten, id_categoria || null], (err, result) => {
    if (err) return res.status(500).json({ erro: 'Erro ao inserir alimento', detail: err.message });
    const id = result.insertId;
    connection.query('SELECT * FROM alimentos WHERE id = ?', [id], (e, rows) => {
      if (e) return res.status(500).json({ erro: 'Erro ao buscar alimento criado' });
      res.status(201).json(rows[0]);
    });
  });
};

// Atualizar alimento - PUT /admin/alimentos/:id
const atualizarAlimento = (req, res) => {
  const { id } = req.params;
  const fields = req.body;
  if (!id) return res.status(400).json({ erro: 'ID é obrigatório' });

  const allowed = ['nome','descricao','imagem','vegetariano','vegano','ovolacto','intolerante_lactose','intolerante_gluten','id_categoria'];
  const updates = [];
  const params = [];

  for (const key of allowed) {
    if (typeof fields[key] !== 'undefined') {
      updates.push(`${key} = ?`);
      params.push(fields[key]);
    }
  }

  if (updates.length === 0) return res.status(400).json({ erro: 'Nenhum campo para atualizar' });

  const sql = `UPDATE alimentos SET ${updates.join(', ')} WHERE id = ?`;
  params.push(id);
  connection.query(sql, params, (err, result) => {
    if (err) return res.status(500).json({ erro: 'Erro ao atualizar alimento', detail: err.message });
    connection.query('SELECT * FROM alimentos WHERE id = ?', [id], (e, rows) => {
      if (e) return res.status(500).json({ erro: 'Erro ao buscar alimento atualizado' });
      if (!rows || rows.length === 0) return res.status(404).json({ erro: 'Alimento não encontrado' });
      res.json(rows[0]);
    });
  });
};

// Deletar alimento - DELETE /admin/alimentos/:id
const deletarAlimento = (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ erro: 'ID é obrigatório' });

  connection.query('DELETE FROM alimentos WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ erro: 'Erro ao deletar alimento' });
    if (result.affectedRows === 0) return res.status(404).json({ erro: 'Alimento não encontrado' });
    res.json({ mensagem: 'Alimento removido com sucesso', id });
  });
};

module.exports = {
  loginAdmin,
  listarUsuariosAdmin,
  listarAlimentosAdmin,
  criarAlimento,
  atualizarAlimento,
  deletarAlimento
};

