const express = require('express');
const multer = require('multer');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Configuração do Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads'); // pasta onde os vídeos serão salvos
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // nome único
  }
});
const upload = multer({ storage });

// Serve arquivos estáticos
app.use(express.static(__dirname));
app.use('/uploads', express.static('uploads'));

// Rota para upload
app.post('/upload', upload.single('video'), (req, res) => {
  if (!req.file) return res.status(400).send('Nenhum vídeo enviado.');

  const title = req.body.title || 'Sem título';
  const author = req.body.author || 'Desconhecido';

  res.send(`Vídeo enviado com sucesso!<br>Título: ${title}<br>Autor: ${author}`);
});

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));

