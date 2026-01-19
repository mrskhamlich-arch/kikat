const express = require('express');
const fs = require('fs').promises;
const fsCb = require('fs');
const path = require('path');
const cors = require('cors');

const DATA_FILE = path.join(__dirname, 'data.json');
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'kitkat09';

const app = express();
const sseClients = [];

app.use(cors());
app.use(express.json());

// Simple request logger
app.use((req, res, next) => {
  console.log(new Date().toISOString(), req.method, req.url);
  next();
});

async function readData(){
  try{
    const txt = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(txt || '{}');
  } catch(e){
    return { problems: [] };
  }
}

async function writeData(data){
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function requireAuth(req, res, next){
  const pw = req.headers['x-admin-password'] || '';
  if(pw !== ADMIN_PASSWORD) return res.status(401).json({ error: 'Unauthorized' });
  next();
}

app.get('/api/problems', async (req, res) => {
  const data = await readData();
  res.json(data);
});

app.post('/api/problems', requireAuth, async (req, res) => {
  const data = await readData();
  const item = req.body || {};
  item.id = Date.now();
  if(!Array.isArray(data.problems)) data.problems = [];
  data.problems.push(item);
  await writeData(data);
  // notify SSE
  sseClients.forEach(c => c.write('data: update\n\n'));
  res.json(item);
});

app.put('/api/problems/:id', requireAuth, async (req, res) => {
  const data = await readData();
  const id = Number(req.params.id);
  const idx = (data.problems || []).findIndex(p => p.id === id);
  if(idx === -1) return res.status(404).json({ error: 'Not found' });
  data.problems[idx] = Object.assign({ id }, req.body);
  await writeData(data);
  sseClients.forEach(c => c.write('data: update\n\n'));
  res.json(data.problems[idx]);
});

app.delete('/api/problems/:id', requireAuth, async (req, res) => {
  const data = await readData();
  const id = Number(req.params.id);
  const idx = (data.problems || []).findIndex(p => p.id === id);
  if(idx === -1) return res.status(404).json({ error: 'Not found' });
  const removed = data.problems.splice(idx, 1)[0];
  await writeData(data);
  sseClients.forEach(c => c.write('data: update\n\n'));
  res.json(removed);
});

// For backward compatibility: a generic endpoint that returns full data.json
app.get('/api/data', async (req, res) => {
  const data = await readData();
  res.json(data);
});

// Settings endpoint to save site configuration
app.post('/api/settings', requireAuth, async (req, res) => {
  const data = await readData();
  const settings = req.body || {};
  
  // Merge settings into data
  data.settings = settings;
  
  await writeData(data);
  sseClients.forEach(c => c.write('data: update\n\n'));
  res.json(settings);
});

// Site data endpoint - saves the entire site configuration with links
app.get('/api/site-data', async (req, res) => {
  const data = await readData();
  // Return site-data from settings or problems as links for compatibility
  const siteData = data.settings || {
    title: '',
    tagline: '',
    about: '',
    contact: '',
    links: Array.isArray(data.problems) ? data.problems : [],
    colors: { primary: '#a855f7', secondary: '#f0f0f0' },
    font: 'Inter'
  };
  res.json(siteData);
});

app.post('/api/site-data', requireAuth, async (req, res) => {
  const data = await readData();
  const siteData = req.body || {};
  
  // Save as settings and also extract links to problems
  data.settings = siteData;
  if (siteData.links) {
    data.problems = siteData.links;
  }
  
  await writeData(data);
  sseClients.forEach(c => c.write('data: update\n\n'));
  res.json(siteData);
});

// Server-Sent Events endpoint for live updates
app.get('/events', (req, res) => {
  res.set({ 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
  res.flushHeaders && res.flushHeaders();
  res.write('retry: 10000\n\n');
  sseClients.push(res);
  req.on('close', () => {
    const idx = sseClients.indexOf(res);
    if(idx !== -1) sseClients.splice(idx, 1);
  });
});

// Expose admin page
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// Serve static files
app.use(express.static(path.join(__dirname)));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
