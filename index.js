const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração do Multer para upload de vídeos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads'); // pasta onde os vídeos serão salvos
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // nome único
  }
});
const upload = multer({ storage });

// Serve arquivos estáticos (HTML, CSS, JS)
app.use(express.static(__dirname));
app.use('/uploads', express.static('uploads'));

// Rota para o index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Rota de upload de vídeo
app.post('/upload', upload.single('video'), (req, res) => {
  if (!req.file) return res.status(400).send('Nenhum vídeo enviado.');

  const title = req.body.title || 'Sem título';
  const author = req.body.author || 'Desconhecido';

  res.send(`Vídeo enviado com sucesso!<br>Título: ${title}<br>Autor: ${author}<br>
            <a href="/videos">Ver todos os vídeos</a>`);
});

// Rota para listar todos os vídeos enviados
app.get('/videos', (req, res) => {
  fs.readdir('uploads', (err, files) => {
    if (err) return res.status(500).send('Erro ao ler vídeos');

    let html = '<h1>Vídeos enviados:</h1>';
    files.forEach(file => {
      html += `<video width="320" height="240" controls>
                 <source src="/uploads/${file}" type="video/mp4">
               </video><br>`;
    });

    html += '<br><a href="/">Voltar para enviar vídeos</a>';
    res.send(html);
  });
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});


