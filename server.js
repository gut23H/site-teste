const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs/promises');
const fsSync = require('fs');
const cors = require('cors');

const UPLOAD_DIR = path.join(__dirname, 'uploads');
const METADATA_FILE = path.join(__dirname, 'videos.json');
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

// cria pastas se não existirem
if (!fsSync.existsSync(UPLOAD_DIR)) fsSync.mkdirSync(UPLOAD_DIR, { recursive: true });
if (!fsSync.existsSync(METADATA_FILE)) fsSync.writeFileSync(METADATA_FILE, '[]', 'utf8');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const safe = Date.now() + '-' + file.originalname.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\-._]/g, '');
    cb(null, safe);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.includes('video')) return cb(new Error('Apenas vídeos MP4.'));
    cb(null, true);
  }
});

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 👇 serve todos os arquivos da pasta atual (tiktok.html, etc)
app.use(express.static(__dirname));

// 👇 serve os vídeos enviados
app.use('/uploads', express.static(UPLOAD_DIR));

// rota para listar vídeos
app.get('/api/videos', async (req, res) => {
  try {
    const data = await fs.readFile(METADATA_FILE, 'utf8');
    const list = JSON.parse(data || '[]');
    list.sort((a, b) => b.uploadedAt - a.uploadedAt);
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao listar vídeos.' });
  }
});

// rota de upload
app.post('/api/upload', upload.single('videoFile'), async (req, res) => {
  try {
    const newItem = {
      id: Date.now().toString(),
      filename: req.file.filename,
      url: `/uploads/${req.file.filename}`,
      title: req.body.title || 'Sem título',
      author: req.body.author || 'Anônimo',
      size: req.file.size,
      uploadedAt: Date.now()
    };

    const content = await fs.readFile(METADATA_FILE, 'utf8');
    const list = JSON.parse(content || '[]');
    list.push(newItem);
    await fs.writeFile(METADATA_FILE, JSON.stringify(list, null, 2), 'utf8');

    res.json({ success: true, video: newItem });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao enviar vídeo.' });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando em http://localhost:${PORT}`));
