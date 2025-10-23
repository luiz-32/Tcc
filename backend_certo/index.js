
const express = require("express");
const cors = require("cors");
const usuarioRoutes = require('./routes/usuarioRoutes'); 
const alimentosRoutes = require('./routes/alimentosRoutes'); 

const app = express();
const port = 3000;

app.use(cors({ origin: "*", allowedHeaders: ["Content-Type", "Authorization"] }));
app.use(express.json());
app.use(express.static('uploads')); 

app.use(alimentosRoutes);
app.use(usuarioRoutes)


app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
