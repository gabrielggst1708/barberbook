import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';

const db = new Database('barber.db');

// Initialize database tables
db.exec(`
  CREATE TABLE IF NOT EXISTS servicos (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    category TEXT NOT NULL,
    imageUrl TEXT,
    duration INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS clientes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT
  );

  CREATE TABLE IF NOT EXISTS agendamentos (
    id TEXT PRIMARY KEY,
    cliente_id TEXT NOT NULL,
    servico_id TEXT NOT NULL,
    date TEXT NOT NULL,
    status TEXT NOT NULL,
    notes TEXT,
    price REAL NOT NULL,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id),
    FOREIGN KEY (servico_id) REFERENCES servicos(id)
  );
`);

// Seed data if empty
const serviceCount = db.prepare('SELECT count(*) as count FROM servicos').get() as { count: number };
if (serviceCount.count === 0) {
  const insertService = db.prepare('INSERT INTO servicos (id, name, description, price, category, imageUrl, duration) VALUES (?, ?, ?, ?, ?, ?, ?)');
  insertService.run('1', 'Corte Moderno', 'Corte degradê com finalização em pomada matte.', 45.00, 'corte', 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=800&auto=format&fit=crop', 40);
  insertService.run('2', 'Barba Completa', 'Modelagem de barba com toalha quente.', 35.00, 'barba', 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=800&auto=format&fit=crop', 30);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  
  // Servicos
  app.get('/api/servicos', (req, res) => {
    const servicos = db.prepare('SELECT * FROM servicos').all();
    res.json(servicos);
  });

  app.post('/api/servicos', (req, res) => {
    const { name, description, price, category, imageUrl, duration } = req.body;
    const id = Math.random().toString(36).substring(2, 9);
    db.prepare('INSERT INTO servicos (id, name, description, price, category, imageUrl, duration) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(id, name, description, price, category, imageUrl, duration);
    res.status(201).json({ id, name, description, price, category, imageUrl, duration });
  });

  // Clientes
  app.get('/api/clientes', (req, res) => {
    const clientes = db.prepare('SELECT * FROM clientes').all();
    res.json(clientes);
  });

  app.post('/api/clientes', (req, res) => {
    const { name, email, phone } = req.body;
    const id = Math.random().toString(36).substring(2, 9);
    try {
      db.prepare('INSERT INTO clientes (id, name, email, phone) VALUES (?, ?, ?, ?)')
        .run(id, name, email, phone);
      res.status(201).json({ id, name, email, phone });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Agendamentos
  app.get('/api/agendamentos', (req, res) => {
    const agendamentos = db.prepare(`
      SELECT 
        a.id, 
        a.cliente_id as customerId, 
        a.servico_id as serviceId, 
        a.date, 
        a.status, 
        a.notes, 
        a.price,
        c.name as customerName, 
        s.name as serviceName 
      FROM agendamentos a
      JOIN clientes c ON a.cliente_id = c.id
      JOIN servicos s ON a.servico_id = s.id
    `).all();
    res.json(agendamentos);
  });

  app.post('/api/agendamentos', (req, res) => {
    const { cliente_id, servico_id, date, status, notes, price } = req.body;
    const id = Math.random().toString(36).substring(2, 9);
    db.prepare('INSERT INTO agendamentos (id, cliente_id, servico_id, date, status, notes, price) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(id, cliente_id, servico_id, date, status, notes, price);
    res.status(201).json({ id, cliente_id, servico_id, date, status, notes, price });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
