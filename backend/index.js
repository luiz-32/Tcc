   const express = require("express");
   const cors = require("cors");
   const mysql = require("mysql2");
   const jwt = require("jsonwebtoken");
   // const bcrypt = require("bcrypt"); // Comentado: Sem hash por enquanto (instale depois!)

   const app = express();
   const port = 3000;
   const JWT_SECRET = "troque_essa_chave_para_uma_secreta_e_complexa"; // Mude em produção!

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

   // ========================================
   // ROTAS DE USUÁRIO (CRUD + CADASTRO)
   // ========================================

   // POST /usuario - CADASTRO (novo usuário) - SEM HASH POR AGORA
   app.post("/usuario", (req, res) => {
     const { nome_usuario, senha } = req.body;
     
     if (!nome_usuario || !senha) {
       return res.status(400).json({ erro: "Informe nome de usuário e senha." });
     }

     // Verifica se usuário já existe
     const checkSql = "SELECT id FROM usuario WHERE nome_usuario = ?";
     connection.query(checkSql, [nome_usuario], (err, results) => {
       if (err) {
         console.error("Erro ao verificar usuário:", err);
         return res.status(500).json({ erro: "Erro interno no servidor" });
       }
       if (results.length > 0) {
         return res.status(409).json({ erro: "Nome de usuário já existe. Escolha outro!" });
       }

       // INSERT novo usuário (senha em texto plano - MUDE PARA HASH DEPOIS!)
       const insertSql = "INSERT INTO usuario (nome_usuario, senha) VALUES (?, ?)";
       connection.query(insertSql, [nome_usuario, senha], (insertErr, insertResult) => {
         if (insertErr) {
           console.error("Erro ao cadastrar:", insertErr);
           return res.status(500).json({ erro: "Erro ao cadastrar usuário" });
         }

         // Busca o usuário criado (sem senha no response)
         const selectNewSql = "SELECT id, nome_usuario FROM usuario WHERE id = ?";
         connection.query(selectNewSql, [insertResult.insertId], (selectErr, newUser ) => {
           if (selectErr) {
             return res.status(500).json({ erro: "Erro ao buscar usuário criado" });
           }
           res.status(201).json(newUser [0]); // Retorna { id, nome_usuario }
         });
       });
     });
   });

   // POST /login - AUTENTICAÇÃO (JWT) - SEM HASH POR AGORA
   app.post("/login", (req, res) => {
     const { nome_usuario, senha } = req.body;
     if (!nome_usuario || !senha) {
       return res.status(400).json({ erro: "Informe nome de usuário e senha." });
     }

     // Busca usuário
     const sql = "SELECT id, nome_usuario, senha FROM usuario WHERE nome_usuario = ?";
     connection.query(sql, [nome_usuario], (err, results) => {
       if (err) {
         console.error("Erro no login:", err);
         return res.status(500).json({ erro: "Erro no login" });
       }
       if (!results || results.length === 0) {
         return res.status(401).json({ erro: "Credenciais inválidas" });
       }

       const user = results[0];

       // Verifica senha (texto plano por agora - MUDE PARA HASH DEPOIS!)
       // const senhaCheck = bcrypt ? bcrypt.compareSync(senha, user.senha) : (senha === user.senha);
       if (senha !== user.senha) {
         return res.status(401).json({ erro: "Credenciais inválidas" });
       }

       // Remove senha do user response
       delete user.senha;

       const token = jwt.sign({ id: user.id, nome_usuario: user.nome_usuario }, JWT_SECRET, { expiresIn: "2h" });

       return res.json({ token, user });
     });
   });

   // GET /usuario - Listar todos (sem senha)
   app.get("/usuario", (req, res) => {
     const sql = "SELECT id, nome_usuario FROM usuario";
     connection.query(sql, (err, results) => {
       if (err) {
         console.error("Erro ao buscar usuários:", err);
         return res.status(500).json({ erro: "Erro ao buscar usuários" });
       }
       res.json(results);
     });
   });

   // GET /usuario/:id - Buscar por ID (sem senha)
   app.get("/usuario/:id", (req, res) => {
     const { id } = req.params;
     const sql = "SELECT id, nome_usuario FROM usuario WHERE id = ?";
     connection.query(sql, [id], (err, results) => {
       if (err) {
         console.error("Erro ao buscar usuário:", err);
         return res.status(500).json({ erro: "Erro ao buscar usuário" });
       }
       if (!results || results.length === 0) {
         return res.status(404).json({ erro: "Usuário não encontrado" });
       }
       res.json(results[0]);
     });
   });

   // DELETE /usuario/:id
   app.delete("/usuario/:id", (req, res) => {
     const { id } = req.params;
     const sql = "DELETE FROM usuario WHERE id = ?";
     connection.query(sql, [id], (err, result) => {
       if (err) {
         console.error("Erro ao deletar:", err);
         return res.status(500).json({ erro: "Erro ao deletar usuário" });
       }
       if (result.affectedRows === 0) return res.status(404).json({ erro: "Usuário não encontrado" });
       res.json({ mensagem: "Usuário excluído com sucesso", id });
     });
   });

   // PATCH /usuario/:id - Atualizar nome (não altera senha)
   app.patch("/usuario/:id", (req, res) => {
     const { id } = req.params;
     const { nome_usuario } = req.body;
     if (!nome_usuario) return res.status(400).json({ erro: "Informe o novo nome" });

     // Verifica duplicata
     const checkSql = "SELECT id FROM usuario WHERE nome_usuario = ? AND id != ?";
     connection.query(checkSql, [nome_usuario, id], (checkErr, checkResults) => {
       if (checkErr) return res.status(500).json({ erro: "Erro ao verificar nome" });
       if (checkResults.length > 0) return res.status(409).json({ erro: "Nome de usuário já existe" });

       const sql = "UPDATE usuario SET nome_usuario = ? WHERE id = ?";
       connection.query(sql, [nome_usuario, id], (err, result) => {
         if (err) {
           console.error("Erro ao atualizar:", err);
           return res.status(500).json({ erro: "Erro ao atualizar usuário" });
         }
         if (result.affectedRows === 0) return res.status(404).json({ erro: "Usuário não encontrado" });
         res.json({ id, nome_usuario });
       });
     });
   });

   // ========================================
   // ROTAS PROTEGIDAS (JWT)
   // ========================================

   // Middleware para verificar token
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

   // GET /perfil - Perfil protegido
   app.get("/perfil", verifyToken, (req, res) => {
     res.json({ user: req.user });
   });

   // Inicia o servidor
   app.listen(port, () => {
     console.log(`Servidor rodando em http://localhost:${port}`);
   });
   