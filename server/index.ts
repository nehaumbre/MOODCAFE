import express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { Server as SocketIOServer } from 'socket.io';
import { apiRouter } from './routes';
import { cafeRepo } from './db/repository';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// Use Google Cloud Run PORT or fallback to 8080
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 8080;

app.use(express.json());

// Enable CORS for frontend and API clients
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Setup Socket.IO Server for real-time order and queue updates
const io = new SocketIOServer(server, {
  path: '/socket.io',
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH'],
  },
});

app.set('io', io);

io.on('connection', async (socket) => {
  try {
    const [tables, orders, queue] = await Promise.all([
      cafeRepo.getTables(),
      cafeRepo.getOrders(),
      cafeRepo.getQueue(),
    ]);

    // Send initial snapshot on client connect
    socket.emit('INIT_STATE', { tables, orders, queue });
  } catch (err: any) {
    console.warn('Socket connect snapshot warning:', err.message);
  }

  socket.on('disconnect', () => {
    // client disconnected
  });
});

// Mount REST API routes
app.use('/api', apiRouter);

// Serve frontend in production or if static directory exists
const candidateDirs = [
  path.resolve(__dirname, 'public'),
  path.resolve(__dirname, '../public'),
  path.resolve(process.cwd(), 'dist/public'),
  path.resolve(process.cwd(), 'client/dist'),
];

const staticDir = candidateDirs.find(d => fs.existsSync(d));

if (staticDir) {
  console.log(`📂 Serving static client assets from: ${staticDir}`);
  app.use(express.static(staticDir));
  app.get('*', (req, res) => {
    res.sendFile(path.join(staticDir, 'index.html'));
  });
}

// Initialize database repository and start server
async function startServer() {
  await cafeRepo.init();

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🍵 Mood Café server running on http://0.0.0.0:${PORT}`);
    console.log(`⚡ Socket.IO listening on http://0.0.0.0:${PORT}/socket.io`);
    console.log(`🌿 Google Cloud SQL PostgreSQL & Cloud Run ready on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
