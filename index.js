const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve o index.html que está na raiz
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve os arquivos CSS e JS que estão na raiz
app.use(express.static(__dirname));

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
