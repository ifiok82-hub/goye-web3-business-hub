/**
 * GOYE Web3 Business Hub - Full-Stack Express Server
 * Serves API routes, verification endpoints, admin portals, and Vite middleware.
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { createExpressApp } from './server/app.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = createExpressApp();
  const portArgIndex = process.argv.indexOf('--port');
  const portArg = portArgIndex !== -1 ? Number(process.argv[portArgIndex + 1]) : null;
  const port = portArg || (process.env.PORT && process.env.PORT !== '8080' ? Number(process.env.PORT) : 3000);
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    // Serve production static build
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    // Mount Vite middlewares in development
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: 3000,
        hmr: false,
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`[GOYE Web3 Business Hub] Hardened server running on http://0.0.0.0:${port}`);
    console.log(`[GOYE Mode]: ${isProduction ? 'Production' : 'Development (Vite Middleware)'}`);
  });
}

startServer().catch((err) => {
  console.error('[GOYE Fatal Server Startup Error]:', err);
  process.exit(1);
});
