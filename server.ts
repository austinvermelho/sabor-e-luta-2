import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const DATA_FILE = path.join(__dirname, 'data', 'establishments.json');

const BUILD_TIME = Date.now();

app.use(express.json());

// Set Cache-Control headers to ensure HTML entry point and all API routes are never cached
app.use((req, res, next) => {
  if (req.path.startsWith('/api') || req.path === '/' || req.path === '/index.html') {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
  }
  next();
});

// Helper to read persistent establishments
function readEstablishmentsData(): any[] {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      writeEstablishmentsData([]);
      return [];
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Error reading establishments data file:', error);
    return [];
  }
}

// Helper to write persistent establishments
function writeEstablishmentsData(data: any[]): void {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing establishments data file:', error);
  }
}

// API Routes
app.get('/api/version', (req, res) => {
  res.json({ version: BUILD_TIME, timestamp: new Date(BUILD_TIME).toISOString() });
});

app.get('/api/establishments', (req, res) => {
  const items = readEstablishmentsData();
  res.json(items);
});

app.post('/api/establishments', (req, res) => {
  const newItem = req.body;
  if (!newItem || !newItem.id || !newItem.name) {
    return res.status(400).json({ error: 'Item de estabelecimento inválido.' });
  }

  const current = readEstablishmentsData();
  const existingIndex = current.findIndex((e) => e.id === newItem.id);

  if (existingIndex >= 0) {
    current[existingIndex] = newItem;
  } else {
    current.unshift(newItem);
  }

  writeEstablishmentsData(current);
  res.json({ success: true, items: current });
});

app.post('/api/establishments/bulk', (req, res) => {
  const items = req.body;
  if (!Array.isArray(items)) {
    return res.status(400).json({ error: 'Payload deve ser uma lista.' });
  }
  writeEstablishmentsData(items);
  res.json({ success: true, count: items.length });
});

app.put('/api/establishments/:id', (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;

  const current = readEstablishmentsData();
  const index = current.findIndex((e) => e.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Estabelecimento não encontrado.' });
  }

  current[index] = { ...current[index], ...updatedData };
  writeEstablishmentsData(current);

  res.json({ success: true, item: current[index], items: current });
});

app.delete('/api/establishments/:id', (req, res) => {
  const { id } = req.params;
  const current = readEstablishmentsData();
  const filtered = current.filter((e) => e.id !== id);

  writeEstablishmentsData(filtered);
  res.json({ success: true, items: filtered });
});

// Volunteers Persistence and API Routes
const VOLUNTEERS_FILE = path.join(__dirname, 'data', 'volunteers.json');

function readVolunteersData(): any[] {
  try {
    if (!fs.existsSync(VOLUNTEERS_FILE)) {
      writeVolunteersData([]);
      return [];
    }
    const raw = fs.readFileSync(VOLUNTEERS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Error reading volunteers data file:', error);
    return [];
  }
}

function writeVolunteersData(data: any[]): void {
  try {
    const dir = path.dirname(VOLUNTEERS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(VOLUNTEERS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing volunteers data file:', error);
  }
}

app.get('/api/volunteers', (req, res) => {
  const items = readVolunteersData();
  res.json(items);
});

app.post('/api/volunteers', (req, res) => {
  const newItem = req.body;
  if (!newItem || !newItem.id || !newItem.name || !newItem.email) {
    return res.status(400).json({ error: 'Cadastro de voluntário inválido.' });
  }

  const current = readVolunteersData();
  const existingIndex = current.findIndex((v) => v.id === newItem.id);

  if (existingIndex >= 0) {
    current[existingIndex] = newItem;
  } else {
    current.unshift(newItem);
  }

  writeVolunteersData(current);
  res.json({ success: true, items: current });
});

app.put('/api/volunteers/:id', (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;

  const current = readVolunteersData();
  const index = current.findIndex((v) => v.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Voluntário não encontrado.' });
  }

  current[index] = { ...current[index], ...updatedData };
  writeVolunteersData(current);

  res.json({ success: true, item: current[index], items: current });
});

app.delete('/api/volunteers/:id', (req, res) => {
  const { id } = req.params;
  const current = readVolunteersData();
  const filtered = current.filter((v) => v.id !== id);

  writeVolunteersData(filtered);
  res.json({ success: true, items: filtered });
});


// Mount Vite in development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Sabor & Luta server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
