const connection = require('../db'); // Agora a conexão é importada do db.js
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const JWT_SECRET = "troque_essa_chave_para_uma_secreta_e_complexa";

// CADASTRO - POST /usuario
const cadastrarUsuario = (req, res) => {
  console.log('[usuarioController] cadastrarUsuario called', { body: req.body });
  const { email, nome_usuario, senha } = req.body;
  if (!email || !nome_usuario || !senha) return res.status(400).json({ erro: "Informe email, nome e senha." });

  // Verificar existência por email ou nome de usuário
  const checkSql = "SELECT id FROM usuario WHERE email = ? OR nome_usuario = ?";
  connection.query(checkSql, [email, nome_usuario], (err, results) => {
    if (err) return res.status(500).json({ erro: "Erro interno" });
    if (results.length > 0) return res.status(409).json({ erro: "Email ou nome de usuário já cadastrado" });

    const insertSql = "INSERT INTO usuario (email, nome_usuario, senha) VALUES (?, ?, ?)";
    connection.query(insertSql, [email, nome_usuario, senha], (insertErr, insertResult) => {
      if (insertErr) return res.status(500).json({ erro: "Erro ao cadastrar usuário" });

      const selectSql = "SELECT id, email, nome_usuario FROM usuario WHERE id = ?";
      connection.query(selectSql, [insertResult.insertId], (selectErr, newUser) => {
        if (selectErr) return res.status(500).json({ erro: "Erro ao buscar usuário criado" });
        res.status(201).json(newUser[0]);
      });
    });
  });
};

// AUTENTICAÇÃO - POST /login
const loginUsuario = (req, res) => {
  console.log('[usuarioController] loginUsuario called', { body: req.body });
  const { email, nome_usuario, senha } = req.body;
  // Preferir login por email; caso cliente envie nome_usuario, aceitar também para compatibilidade
  if ((!email && !nome_usuario) || !senha) return res.status(400).json({ erro: "Informe email/nome e senha." });

  const lookupField = email ? 'email' : 'nome_usuario';
  const lookupValue = email ? email : nome_usuario;

  const sql = `SELECT id, email, nome_usuario, senha FROM usuario WHERE ${lookupField} = ?`;
  connection.query(sql, [lookupValue], (err, results) => {
    if (err) return res.status(500).json({ erro: "Erro no login" });
    if (!results || results.length === 0) return res.status(401).json({ erro: "Credenciais inválidas" });

    const user = results[0];
    if (senha !== user.senha) return res.status(401).json({ erro: "Credenciais inválidas" });

    // Não enviar a senha no retorno
    const safeUser = { id: user.id, email: user.email, nome_usuario: user.nome_usuario };
    const token = jwt.sign({ id: user.id, nome_usuario: user.nome_usuario }, JWT_SECRET, { expiresIn: "2h" });
    res.json({ token, user: safeUser });
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
  console.log('[usuarioController] excluirUsuario called', { params: req.params, body: req.body });
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

// ATUALIZAR USUÁRIO - PUT /usuario/:id
const atualizarUsuario = (req, res) => {
  console.log('[usuarioController] atualizarUsuario called', { params: req.params, body: req.body });
  const { id } = req.params;
  const { nome_usuario, email, senha_atual, nova_senha } = req.body;

  // Se estiver trocando nome de usuário
  const tasks = [];

  if (nome_usuario) {
    // Verificar se já existe outro usuário com esse nome
    const checkSql = "SELECT id FROM usuario WHERE nome_usuario = ? AND id <> ?";
    tasks.push(new Promise((resolve, reject) => {
      connection.query(checkSql, [nome_usuario, id], (err, results) => {
        if (err) return reject({ status: 500, erro: 'Erro ao verificar nome de usuário' });
        if (results.length > 0) return reject({ status: 409, erro: 'Nome de usuário já em uso' });
        const upd = "UPDATE usuario SET nome_usuario = ? WHERE id = ?";
        connection.query(upd, [nome_usuario, id], (uErr) => {
          if (uErr) return reject({ status: 500, erro: 'Erro ao atualizar nome' });
          resolve();
        });
      });
    }));
  }

  // Se estiver trocando email
  if (email) {
    tasks.push(new Promise((resolve, reject) => {
      const checkSql = "SELECT id FROM usuario WHERE email = ? AND id <> ?";
      connection.query(checkSql, [email, id], (err, results) => {
        if (err) return reject({ status: 500, erro: 'Erro ao verificar email' });
        if (results.length > 0) return reject({ status: 409, erro: 'Email já em uso' });
        const upd = "UPDATE usuario SET email = ? WHERE id = ?";
        connection.query(upd, [email, id], (uErr) => {
          if (uErr) return reject({ status: 500, erro: 'Erro ao atualizar email' });
          resolve();
        });
      });
    }));
  }

  // Se estiver trocando senha
  if (senha_atual && nova_senha) {
    tasks.push(new Promise((resolve, reject) => {
      const sel = "SELECT senha FROM usuario WHERE id = ?";
      connection.query(sel, [id], (err, results) => {
        if (err) return reject({ status: 500, erro: 'Erro ao verificar senha atual' });
        if (!results || results.length === 0) return reject({ status: 404, erro: 'Usuário não encontrado' });
        const current = results[0].senha;
        if (current !== senha_atual) return reject({ status: 401, erro: 'Senha atual incorreta' });
        const upd = "UPDATE usuario SET senha = ? WHERE id = ?";
        connection.query(upd, [nova_senha, id], (uErr) => {
          if (uErr) return reject({ status: 500, erro: 'Erro ao atualizar senha' });
          resolve();
        });
      });
    }));
  }

  if (tasks.length === 0) {
    return res.status(400).json({ erro: 'Nenhum campo para atualizar' });
  }

  Promise.all(tasks).then(() => {
    // Retornar usuário atualizado
    const sel = "SELECT id, email, nome_usuario FROM usuario WHERE id = ?";
    connection.query(sel, [id], (err, results) => {
      if (err) return res.status(500).json({ erro: 'Erro ao buscar usuário atualizado' });
      if (!results || results.length === 0) return res.status(404).json({ erro: 'Usuário não encontrado' });
      res.json(results[0]);
    });
  }).catch(e => {
    const status = e.status || 500;
    res.status(status).json({ erro: e.erro || 'Erro ao atualizar usuário' });
  });
};



// ATUALIZAR FOTO DE PERFIL - POST /usuario/:id/foto (multipart)
const atualizarFotoPerfil = (req, res) => {
  console.log('[usuarioController] atualizarFotoPerfil called', { params: req.params, file: req.file && req.file.path });
  const { id } = req.params;
  if (!req.file) return res.status(400).json({ erro: 'Nenhum arquivo enviado' });

  // Compute a public-relative path (relative to project root) for serving
  const absPath = req.file.path || '';
  const rel = path.relative(path.resolve(__dirname, '..'), absPath).replace(/\\/g, '/');
  const filePath = rel.startsWith('/') ? rel : `/${rel}`;

  // First, fetch current foto_perfil to remove old file if exists
  const selOld = 'SELECT foto_perfil FROM usuario WHERE id = ?';
  connection.query(selOld, [id], (selErr, selRes) => {
    if (selErr) {
      console.error('[atualizarFotoPerfil] Erro ao buscar foto antiga', selErr);
      // continue anyway
    }

    const oldFoto = selRes && selRes[0] ? selRes[0].foto_perfil : null;

    const sql = 'UPDATE usuario SET foto_perfil = ? WHERE id = ?';
    connection.query(sql, [filePath, id], (err) => {
      if (err) {
        console.error('[atualizarFotoPerfil] Erro ao atualizar DB', err);
        return res.status(500).json({ erro: 'Erro ao salvar foto de perfil' });
      }

      // Try to remove old file from disk if it existed and is different
      if (oldFoto && oldFoto !== filePath) {
        try {
          const oldRel = oldFoto.startsWith('/') ? oldFoto.slice(1) : oldFoto;
          const absOld = path.resolve(__dirname, '..', oldRel);
          fs.unlink(absOld, (uErr) => {
            if (uErr && uErr.code !== 'ENOENT') console.warn('[atualizarFotoPerfil] falha ao remover foto antiga', uErr);
          });
        } catch (e) {
          console.warn('[atualizarFotoPerfil] erro ao remover foto antiga (sync)', e);
        }
      }

      const sel = 'SELECT id, email, nome_usuario, foto_perfil FROM usuario WHERE id = ?';
      connection.query(sel, [id], (sErr, results) => {
        if (sErr) return res.status(500).json({ erro: 'Erro ao buscar usuário atualizado' });
        if (!results || results.length === 0) return res.status(404).json({ erro: 'Usuário não encontrado' });
        res.json(results[0]);
      });
    });
  });
};

// DELETAR FOTO DE PERFIL - DELETE /usuario/:id/foto
const deletarFotoPerfil = (req, res) => {
  const { id } = req.params;
  const sel = 'SELECT foto_perfil FROM usuario WHERE id = ?';
  connection.query(sel, [id], (err, results) => {
    if (err) return res.status(500).json({ erro: 'Erro ao buscar usuário' });
    if (!results || results.length === 0) return res.status(404).json({ erro: 'Usuário não encontrado' });

    const foto = results[0].foto_perfil;
    if (!foto) return res.status(400).json({ erro: 'Usuário não possui foto de perfil' });

    const fotoRel = foto.startsWith('/') ? foto.slice(1) : foto;
    const abs = path.resolve(__dirname, '..', fotoRel);
    fs.unlink(abs, (uErr) => {
      if (uErr && uErr.code !== 'ENOENT') {
        console.warn('[deletarFotoPerfil] falha ao remover arquivo', uErr);
        // proceed to clear DB anyway
      }

      const upd = 'UPDATE usuario SET foto_perfil = NULL WHERE id = ?';
      connection.query(upd, [id], (uErr2) => {
        if (uErr2) return res.status(500).json({ erro: 'Erro ao atualizar usuário' });
        return res.json({ mensagem: 'Foto de perfil removida' });
      });
    });
  });
};

// OBTER USUÁRIO - GET /usuario/:id (retorna foto_perfil também)
const obterUsuario = (req, res) => {
  const { id } = req.params;
  const sel = 'SELECT id, email, nome_usuario, foto_perfil FROM usuario WHERE id = ?';
  connection.query(sel, [id], (err, results) => {
    if (err) return res.status(500).json({ erro: 'Erro ao buscar usuário' });
    if (!results || results.length === 0) return res.status(404).json({ erro: 'Usuário não encontrado' });
    res.json(results[0]);
  });
};

// Export all controller functions
module.exports = {
  cadastrarUsuario,
  loginUsuario,
  listarUsuarios,
  excluirUsuario,
  atualizarUsuario,
  atualizarFotoPerfil,
  deletarFotoPerfil,
  obterUsuario
};