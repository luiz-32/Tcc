const connection = require('../db');

// ADICIONAR FAVORITO - POST /favoritos
const adicionarFavorito = (req, res) => {
  const { id_usuario, id_alimento } = req.body;

  console.log(`[INCOMING POST /favoritos] às ${new Date().toISOString()}`);
  console.log("req.body:", req.body);
  console.log("Adicionando favorito:", { id_usuario, id_alimento });

  if (!id_usuario || !id_alimento) {
    return res.status(400).json({ erro: "ID do usuário e do alimento são obrigatórios." });
  }

  // Verificar se o usuário existe
  const usuarioSql = "SELECT id FROM usuario WHERE id = ?";
  connection.query(usuarioSql, [id_usuario], (uErr, uResults) => {
    if (uErr) {
      console.error("Erro ao verificar usuário:", uErr);
      return res.status(500).json({ erro: "Erro ao verificar usuário: " + uErr.message });
    }

    if (!uResults || uResults.length === 0) {
      return res.status(404).json({ erro: "Usuário não encontrado" });
    }

    // Verificar se o alimento existe
    const alimentoSql = "SELECT id FROM alimentos WHERE id = ?";
    connection.query(alimentoSql, [id_alimento], (aErr, aResults) => {
      if (aErr) {
        console.error("Erro ao verificar alimento:", aErr);
        return res.status(500).json({ erro: "Erro ao verificar alimento: " + aErr.message });
      }

      if (!aResults || aResults.length === 0) {
        return res.status(404).json({ erro: "Alimento não encontrado" });
      }

      // Verificar se o favorito já existe
      const checkSql = "SELECT id FROM favoritos WHERE id_usuario = ? AND id_alimento = ?";
      connection.query(checkSql, [id_usuario, id_alimento], (err, results) => {
        if (err) {
          console.error("Erro ao verificar favorito:", err);
          return res.status(500).json({ erro: "Erro ao verificar favorito: " + err.message });
        }

        if (results.length > 0) {
          return res.status(409).json({ erro: "Este alimento já está nos favoritos" });
        }

        // Inserir novo favorito
        const insertSql = "INSERT INTO favoritos (id_usuario, id_alimento) VALUES (?, ?)";
        connection.query(insertSql, [id_usuario, id_alimento], (insertErr, insertResult) => {
          if (insertErr) {
            console.error("Erro ao inserir favorito:", insertErr);
            // If FK error still occurs, return a friendly message
            if (insertErr && insertErr.code === 'ER_NO_REFERENCED_ROW_2') {
              return res.status(400).json({ erro: "Referência inválida: usuário ou alimento não existe." });
            }
            return res.status(500).json({ erro: "Erro ao adicionar favorito: " + insertErr.message });
          }

          console.log("Favorito adicionado com sucesso, ID:", insertResult.insertId);

          const selectSql = `
            SELECT f.id, f.id_usuario, f.id_alimento, a.nome, a.imagem, a.descricao, a.vegetariano, a.vegano,
                   a.ovolacto, a.intolerante_lactose, a.intolerante_gluten, a.id_categoria, c.nome as categoria
            FROM favoritos f
            JOIN alimentos a ON f.id_alimento = a.id
            LEFT JOIN categorias c ON a.id_categoria = c.id
            WHERE f.id = ?
          `;
          connection.query(selectSql, [insertResult.insertId], (selectErr, favorito) => {
            if (selectErr) {
              console.error("Erro ao buscar favorito criado:", selectErr);
              return res.status(500).json({ erro: "Erro ao buscar favorito criado" });
            }
            res.status(201).json(favorito[0]);
          });
        });
      });
    });
  });
};

// LISTAR FAVORITOS DO USUÁRIO - GET /favoritos/:id_usuario
const listarFavoritos = (req, res) => {
  const { id_usuario } = req.params;

  console.log("Listando favoritos do usuário:", id_usuario);

  const sql = `
    SELECT f.id, f.id_usuario, f.id_alimento, a.nome, a.imagem, a.descricao, a.vegetariano, a.vegano, 
           a.ovolacto, a.intolerante_lactose, a.intolerante_gluten, a.id_categoria, c.nome as categoria
    FROM favoritos f
    JOIN alimentos a ON f.id_alimento = a.id
    LEFT JOIN categorias c ON a.id_categoria = c.id
    WHERE f.id_usuario = ?
    ORDER BY f.data_criacao DESC
  `;

  // Diagnostic logging: print SQL, params, timestamp
  console.log(`[favoritosController] Executando SQL listarFavoritos às ${new Date().toISOString()}`);
  console.log('[favoritosController] SQL:', sql.replace(/\s+/g, ' ').trim());
  console.log('[favoritosController] Params:', [id_usuario]);

  connection.query(sql, [id_usuario], (err, results) => {
    if (err) {
      console.error("Erro ao buscar favoritos:", err);
      return res.status(500).json({ erro: "Erro ao buscar favoritos: " + err.message });
    }

    try {
      console.log("Favoritos encontrados:", Array.isArray(results) ? results.length : 'n/a');
      console.log('[favoritosController] Results (first 2000 chars):', JSON.stringify(results).slice(0, 2000));
    } catch (logErr) {
      console.error('[favoritosController] Erro ao serializar resultados para log:', logErr);
    }

    res.json(results);
  });
};

// DELETAR FAVORITO - DELETE /favoritos/:id_favorito
const deletarFavorito = (req, res) => {
  const { id_favorito } = req.params;

  const sql = "DELETE FROM favoritos WHERE id = ?";
  connection.query(sql, [id_favorito], (err, result) => {
    if (err) return res.status(500).json({ erro: "Erro ao deletar favorito" });
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ erro: "Favorito não encontrado" });
    }

    res.json({ mensagem: "Favorito removido com sucesso", id: id_favorito });
  });
};

// VERIFICAR SE UM ALIMENTO É FAVORITO - GET /favoritos/check/:id_usuario/:id_alimento
const verificarFavorito = (req, res) => {
  const { id_usuario, id_alimento } = req.params;

  const sql = "SELECT id FROM favoritos WHERE id_usuario = ? AND id_alimento = ?";
  connection.query(sql, [id_usuario, id_alimento], (err, results) => {
    if (err) return res.status(500).json({ erro: "Erro ao verificar favorito" });
    
    res.json({ isFavorito: results.length > 0, id_favorito: results.length > 0 ? results[0].id : null });
  });
};

module.exports = {
  adicionarFavorito,
  listarFavoritos,
  deletarFavorito,
  verificarFavorito
};
