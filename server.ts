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
app.use(express.static(path.join(__dirname, 'public')));

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

// IP & Users Management
const USERS_FILE = path.join(__dirname, 'data', 'users.json');
const BANNED_IPS_FILE = path.join(__dirname, 'data', 'banned_ips.json');

function getClientIp(req: express.Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  let ip = '';
  if (typeof forwarded === 'string') {
    ip = forwarded.split(',')[0].trim();
  } else if (Array.isArray(forwarded) && forwarded.length > 0) {
    ip = forwarded[0].trim();
  } else {
    ip = req.socket.remoteAddress || '127.0.0.1';
  }
  if (ip.startsWith('::ffff:')) {
    ip = ip.replace('::ffff:', '');
  }
  return ip;
}

function readBannedIps(): any[] {
  try {
    if (!fs.existsSync(BANNED_IPS_FILE)) {
      writeBannedIps([]);
      return [];
    }
    const raw = fs.readFileSync(BANNED_IPS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Error reading banned_ips.json:', error);
    return [];
  }
}

function writeBannedIps(data: any[]): void {
  try {
    const dir = path.dirname(BANNED_IPS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(BANNED_IPS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing banned_ips.json:', error);
  }
}

function readUsersData(): any[] {
  try {
    if (!fs.existsSync(USERS_FILE)) {
      writeUsersData([]);
      return [];
    }
    const raw = fs.readFileSync(USERS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Error reading users.json:', error);
    return [];
  }
}

function writeUsersData(data: any[]): void {
  try {
    const dir = path.dirname(USERS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing users.json:', error);
  }
}

function isIpBanned(ip: string): boolean {
  if (!ip) return false;
  const banned = readBannedIps();
  return banned.some((b: any) => b.ip === ip);
}

function recordUser(
  user: { uid: string; email?: string | null; displayName?: string | null },
  ip: string,
  incrementCheckin = false
) {
  if (!user || !user.uid) return;
  const users = readUsersData();
  const bannedList = readBannedIps();
  const isBanned = bannedList.some((b: any) => b.ip === ip || (b.userId && b.userId === user.uid) || (b.userEmail && b.userEmail === user.email));
  const existingIndex = users.findIndex((u: any) => u.uid === user.uid);
  const now = new Date().toISOString();

  if (existingIndex >= 0) {
    users[existingIndex].lastActive = now;
    users[existingIndex].ipAddress = ip;
    if (user.email) users[existingIndex].email = user.email;
    if (user.displayName) users[existingIndex].displayName = user.displayName;
    if (incrementCheckin) users[existingIndex].checkInsCount = (users[existingIndex].checkInsCount || 0) + 1;
    users[existingIndex].isBanned = isBanned;
  } else {
    users.unshift({
      uid: user.uid,
      email: user.email || null,
      displayName: user.displayName || user.email?.split('@')[0] || 'Companheiro(a)',
      ipAddress: ip,
      lastActive: now,
      createdAt: now,
      checkInsCount: incrementCheckin ? 1 : 0,
      isBanned
    });
  }
  writeUsersData(users);
}

// Banned IP enforcement middleware for write operations
app.use((req, res, next) => {
  const ip = getClientIp(req);
  // Exempt curator routes, read-only GET routes, version, robots, etc.
  if (req.method !== 'GET' && !req.path.startsWith('/api/curator') && isIpBanned(ip)) {
    return res.status(403).json({
      error: 'Seu endereço IP foi suspenso por violação dos termos de uso da rede Sabor & Luta.',
      banned: true,
      ip
    });
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

// SEO & AI Crawlers Routes
app.get('/robots.txt', (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  res.send(`User-agent: *
Allow: /

# AI Agent Crawlers & Search Engines Allowed
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Bytespider
Allow: /

User-agent: Google-Extended
Allow: /

Sitemap: https://saboreluta.com.br/sitemap.xml
LLM-Info: https://saboreluta.com.br/llms.txt
`);
});

app.get('/sitemap.xml', (req, res) => {
  const items = readEstablishmentsData().filter((item: any) => item.status === 'approved' || !item.status);
  const baseUrl = 'https://saboreluta.com.br';
  const currentDate = new Date().toISOString().split('T')[0];

  const urls = [
    `  <url>\n    <loc>${baseUrl}/</loc>\n    <lastmod>${currentDate}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>`,
    `  <url>\n    <loc>${baseUrl}/llms.txt</loc>\n    <lastmod>${currentDate}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`,
    `  <url>\n    <loc>${baseUrl}/llms-full.txt</loc>\n    <lastmod>${currentDate}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>`
  ];

  items.forEach((item: any) => {
    if (item.id) {
      urls.push(`  <url>\n    <loc>${baseUrl}/#establishment-${item.id}</loc>\n    <lastmod>${currentDate}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.6</priority>\n  </url>`);
    }
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

  res.setHeader('Content-Type', 'application/xml');
  res.send(xml);
});

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

// Owner Claim & Edit Endpoints
app.post('/api/establishments/:id/claim', (req, res) => {
  const { id } = req.params;
  const { userId, userEmail, userName, message } = req.body || {};

  if (!userId || !userEmail) {
    return res.status(400).json({ error: 'Usuário e e-mail são obrigatórios para reivindicar o espaço.' });
  }

  const current = readEstablishmentsData();
  const index = current.findIndex((e) => e.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Estabelecimento não encontrado.' });
  }

  current[index].ownerUid = userId;
  current[index].ownerEmail = userEmail;
  current[index].ownerName = userName || userEmail.split('@')[0];
  current[index].claimStatus = 'pending';
  current[index].claimMessage = message || '';
  current[index].claimedAt = new Date().toISOString();

  writeEstablishmentsData(current);
  res.json({ success: true, item: current[index], items: current });
});

app.post('/api/establishments/:id/submit-edit', (req, res) => {
  const { id } = req.params;
  const { userId, userEmail, editData, notes } = req.body || {};

  if (!userId || !editData) {
    return res.status(400).json({ error: 'Dados da edição ou identificador do usuário ausentes.' });
  }

  const current = readEstablishmentsData();
  const index = current.findIndex((e) => e.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Estabelecimento não encontrado.' });
  }

  const item = current[index];
  // Verify ownership permission
  if (item.ownerUid !== userId && item.ownerEmail !== userEmail) {
    return res.status(403).json({ error: 'Você não tem permissão para editar este estabelecimento.' });
  }

  // Create pending edit proposal (never overwrites published version directly)
  item.pendingEdit = {
    ...editData,
    submittedAt: new Date().toISOString(),
    submittedByUid: userId,
    submittedByEmail: userEmail || item.ownerEmail,
    notes: notes || '',
  };
  item.updatedAt = new Date().toISOString();

  writeEstablishmentsData(current);
  res.json({ success: true, item, items: current });
});

// Curator Review & Approval of Space Edits
app.get('/api/curator/pending-edits', (req, res) => {
  const current = readEstablishmentsData();
  const pendingEdits = current.filter((e) => e.pendingEdit || e.claimStatus === 'pending');
  res.json(pendingEdits);
});

app.put('/api/curator/establishments/:id/approve-edit', (req, res) => {
  const { id } = req.params;
  const current = readEstablishmentsData();
  const index = current.findIndex((e) => e.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Estabelecimento não encontrado.' });
  }

  const item = current[index];
  if (!item.pendingEdit) {
    return res.status(400).json({ error: 'Não há edição pendente para aprovação neste espaço.' });
  }

  const { submittedAt, submittedByUid, submittedByEmail, notes, ...fieldsToApply } = item.pendingEdit;

  // Apply changes to live establishment
  current[index] = {
    ...item,
    ...fieldsToApply,
    updatedAt: new Date().toISOString(),
    updatedBy: `Owner: ${submittedByEmail || submittedByUid}`,
    pendingEdit: undefined,
  };

  writeEstablishmentsData(current);
  res.json({ success: true, item: current[index], items: current });
});

app.put('/api/curator/establishments/:id/reject-edit', (req, res) => {
  const { id } = req.params;
  const current = readEstablishmentsData();
  const index = current.findIndex((e) => e.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Estabelecimento não encontrado.' });
  }

  current[index].pendingEdit = undefined;
  current[index].updatedAt = new Date().toISOString();

  writeEstablishmentsData(current);
  res.json({ success: true, item: current[index], items: current });
});

app.put('/api/curator/establishments/:id/manage-claim', (req, res) => {
  const { id } = req.params;
  const { action, ownerUid, ownerEmail, ownerName } = req.body || {};

  const current = readEstablishmentsData();
  const index = current.findIndex((e) => e.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Estabelecimento não encontrado.' });
  }

  if (action === 'approve') {
    current[index].claimStatus = 'approved';
    if (ownerUid) current[index].ownerUid = ownerUid;
    if (ownerEmail) current[index].ownerEmail = ownerEmail;
    if (ownerName) current[index].ownerName = ownerName;
  } else if (action === 'revoke' || action === 'reject') {
    current[index].claimStatus = 'none';
    current[index].ownerUid = undefined;
    current[index].ownerEmail = undefined;
    current[index].ownerName = undefined;
    current[index].claimMessage = undefined;
  }

  current[index].updatedAt = new Date().toISOString();
  writeEstablishmentsData(current);
  res.json({ success: true, item: current[index], items: current });
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

// Check-ins Persistence and API Routes
const CHECKINS_FILE = path.join(__dirname, 'data', 'checkins.json');

function readCheckinsData(): any[] {
  try {
    if (!fs.existsSync(CHECKINS_FILE)) {
      writeCheckinsData([]);
      return [];
    }
    const raw = fs.readFileSync(CHECKINS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Error reading checkins data file:', error);
    return [];
  }
}

function writeCheckinsData(data: any[]): void {
  try {
    const dir = path.dirname(CHECKINS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CHECKINS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing checkins data file:', error);
  }
}

app.get('/api/ip/status', (req, res) => {
  const ip = getClientIp(req);
  const banned = readBannedIps();
  const record = banned.find((b: any) => b.ip === ip);
  res.json({ ip, isBanned: !!record, record: record || null });
});

app.post('/api/users/heartbeat', (req, res) => {
  const { uid, email, displayName } = req.body || {};
  const ip = getClientIp(req);
  if (uid) {
    recordUser({ uid, email, displayName }, ip, false);
  }
  res.json({ success: true, ip });
});

app.get('/api/checkins', (req, res) => {
  const { userId } = req.query;
  const items = readCheckinsData();
  if (userId) {
    return res.json(items.filter((item: any) => item.userId === userId));
  }
  res.json(items);
});

app.post('/api/checkins', (req, res) => {
  const newItem = req.body;
  if (!newItem || !newItem.id || !newItem.userId || !newItem.establishmentId) {
    return res.status(400).json({ error: 'Check-in inválido.' });
  }

  const clientIp = getClientIp(req);
  if (isIpBanned(clientIp)) {
    return res.status(403).json({ error: 'Endereço IP suspenso por violação de termos.', banned: true });
  }

  // Record author IP
  newItem.authorIp = newItem.authorIp || clientIp;

  const current = readCheckinsData();
  const existingIndex = current.findIndex((c) => c.id === newItem.id);

  if (existingIndex >= 0) {
    current[existingIndex] = { ...current[existingIndex], ...newItem };
  } else {
    current.unshift(newItem);
  }

  writeCheckinsData(current);

  // Record user activity and check-in count
  recordUser(
    {
      uid: newItem.userId,
      email: newItem.userEmail || null,
      displayName: newItem.authorName || (newItem.userEmail ? newItem.userEmail.split('@')[0] : 'Companheiro(a)'),
    },
    clientIp,
    existingIndex < 0
  );

  res.json({ success: true, items: current.filter((item: any) => item.userId === newItem.userId) });
});

app.delete('/api/checkins/:id', (req, res) => {
  const { id } = req.params;
  const current = readCheckinsData();
  const filtered = current.filter((c) => c.id !== id);

  writeCheckinsData(filtered);
  res.json({ success: true, items: filtered });
});

// Curator Management Endpoints
app.get('/api/curator/checkins', (req, res) => {
  const checkins = readCheckinsData();
  const establishments = readEstablishmentsData();
  const establishmentsMap = new Map(establishments.map((e: any) => [e.id, e]));

  const enriched = checkins.map((c: any) => ({
    ...c,
    establishmentName: establishmentsMap.get(c.establishmentId)?.name || 'Espaço cultural/gastronômico',
    establishmentCity: establishmentsMap.get(c.establishmentId)?.city || '',
    establishmentState: establishmentsMap.get(c.establishmentId)?.state || '',
  }));

  res.json(enriched);
});

app.put('/api/curator/checkins/:id/moderate', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (status !== 'approved' && status !== 'rejected' && status !== 'pending') {
    return res.status(400).json({ error: 'Status de moderação inválido.' });
  }

  const current = readCheckinsData();
  const index = current.findIndex((c) => c.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Relato de visita não encontrado.' });
  }

  current[index].status = status;
  current[index].moderatedAt = new Date().toISOString();
  writeCheckinsData(current);

  res.json({ success: true, checkIn: current[index] });
});

app.get('/api/curator/users', (req, res) => {
  const users = readUsersData();
  const checkins = readCheckinsData();
  const bannedList = readBannedIps();
  const bannedIpsSet = new Set(bannedList.map((b: any) => b.ip));

  const userMap = new Map<string, any>();
  for (const u of users) {
    userMap.set(u.uid, {
      ...u,
      isBanned: u.ipAddress ? bannedIpsSet.has(u.ipAddress) : !!u.isBanned,
    });
  }

  // Cross-reference any checkins
  for (const c of checkins) {
    if (c.userId && !userMap.has(c.userId)) {
      const email = c.userEmail || null;
      userMap.set(c.userId, {
        uid: c.userId,
        email,
        displayName: c.authorName || (email ? email.split('@')[0] : 'Companheiro(a)'),
        ipAddress: c.authorIp || '',
        lastActive: c.createdAt || new Date().toISOString(),
        createdAt: c.createdAt || new Date().toISOString(),
        checkInsCount: 0,
        isBanned: c.authorIp ? bannedIpsSet.has(c.authorIp) : false,
      });
    }
  }

  // Calculate accurate check-in counts
  const checkinCounts = new Map<string, number>();
  for (const c of checkins) {
    if (c.userId) {
      checkinCounts.set(c.userId, (checkinCounts.get(c.userId) || 0) + 1);
    }
  }

  const result = Array.from(userMap.values()).map((usr: any) => ({
    ...usr,
    checkInsCount: checkinCounts.get(usr.uid) || usr.checkInsCount || 0,
    isBanned: usr.ipAddress ? bannedIpsSet.has(usr.ipAddress) : !!usr.isBanned,
  }));

  res.json(result);
});

app.get('/api/curator/banned-ips', (req, res) => {
  const banned = readBannedIps();
  res.json(banned);
});

app.post('/api/curator/ban-ip', (req, res) => {
  const { ip, reason, userId, userEmail } = req.body || {};
  if (!ip || typeof ip !== 'string' || !ip.trim()) {
    return res.status(400).json({ error: 'Endereço IP inválido para banimento.' });
  }

  const cleanIp = ip.trim();
  const banned = readBannedIps();
  const existing = banned.find((b: any) => b.ip === cleanIp);

  if (!existing) {
    banned.unshift({
      ip: cleanIp,
      reason: reason || 'Violação das diretrizes e termos de uso da rede Sabor & Luta.',
      bannedAt: new Date().toISOString(),
      userId: userId || null,
      userEmail: userEmail || null,
    });
    writeBannedIps(banned);
  }

  // Update user records
  const users = readUsersData();
  let modifiedUsers = false;
  for (const u of users) {
    if (u.ipAddress === cleanIp || (userId && u.uid === userId) || (userEmail && u.email === userEmail)) {
      u.isBanned = true;
      modifiedUsers = true;
    }
  }
  if (modifiedUsers) {
    writeUsersData(users);
  }

  res.json({ success: true, banned });
});

app.post('/api/curator/unban-ip', (req, res) => {
  const { ip } = req.body || {};
  if (!ip || typeof ip !== 'string') {
    return res.status(400).json({ error: 'IP não informado.' });
  }

  const cleanIp = ip.trim();
  const banned = readBannedIps();
  const filtered = banned.filter((b: any) => b.ip !== cleanIp);
  writeBannedIps(filtered);

  // Update user records
  const users = readUsersData();
  let modifiedUsers = false;
  for (const u of users) {
    if (u.ipAddress === cleanIp) {
      u.isBanned = false;
      modifiedUsers = true;
    }
  }
  if (modifiedUsers) {
    writeUsersData(users);
  }

  res.json({ success: true, banned: filtered });
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
