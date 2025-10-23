const mysql = require("mysql2");

// Configuração da conexão com o banco de dados
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "banco_dados",
  port: 3306
});

// Conectando ao banco de dados
connection.connect(err => {
  if (err) {
    console.error("Erro ao conectar no banco:", err);
    return;
  }
  console.log("Conectado ao MariaDB!");
});

module.exports = connection; // Exportando a conexão
