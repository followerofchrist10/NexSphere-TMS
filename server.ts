import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import backendApp from './backend/src/app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT || 3000);

// Proxy and health check routes
app.use((req, res, next) => {
  if (req.url.startsWith('/api') || req.url.startsWith('/health')) {
    return (backendApp as any)(req, res, next);
  }
  next();
});

// Serve frontend static build
const distPath = path.resolve(__dirname, 'dist');
app.use(express.static(distPath));

// React SPA fallback
app.get('*', (_req, res) => {
  res.sendFile(path.resolve(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`NexSphere Edu production server running on port ${PORT}`);
});
