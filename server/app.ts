/**
 * GOYE Web3 Business Hub - Express Application Factory
 * Configures routers, security middleware, and route prefix handling for both
 * local development/server execution and Vercel Serverless Function deployments.
 */

import express from 'express';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { apiRouter } from './routes/api.ts';
import { piRouter } from './routes/pi.ts';
import { verifyRouter } from './routes/verify.ts';
import { adminRouter } from './routes/admin.ts';

dotenv.config();

export function createExpressApp() {
  const app = express();

  // Permissive CORS middleware for cross-origin mobile webview & Vercel edge
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // JSON Body Parser
  app.use(express.json());

  // Dual-prefix router mounting ensures matching regardless of Vercel path rewriting
  app.use('/api/pi', piRouter);
  app.use('/pi', piRouter);

  app.use('/api/verify', verifyRouter);
  app.use('/verify', verifyRouter);

  app.use('/api/admin', adminRouter);
  app.use('/admin', adminRouter);

  app.use('/api', apiRouter);
  app.use('/', apiRouter);

  // Health check endpoint (both /health and /api/health)
  const healthHandler = (_req: express.Request, res: express.Response) => {
    res.json({
      status: 'ok',
      service: 'GOYE Web3 Business Hub',
      timestamp: new Date().toISOString(),
      network: process.env.PI_NETWORK_MODE || 'TESTNET',
      sandbox: false,
    });
  };
  app.get('/health', healthHandler);
  app.get('/api/health', healthHandler);

  // Official Pi Domain Validation endpoint (both /validation-key.txt and /api/validation-key.txt)
  const validationHandler = (_req: express.Request, res: express.Response) => {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send('90abaa643d3497da29102392c358d77a18e2937cb338f944de6f88db2a2a2f7a46a39851946bb07eaa648e3a5cbee79db904ab485c3e929be43049c61396c757\n');
  };
  app.get('/validation-key.txt', validationHandler);
  app.get('/api/validation-key.txt', validationHandler);

  // Official Privacy Policy endpoint (serves public accessible semantic HTML with HTTP 200 OK)
  const privacyHandler = (_req: express.Request, res: express.Response) => {
    try {
      const candidates = [
        path.resolve(process.cwd(), 'public', 'privacy.html'),
        path.resolve(process.cwd(), 'dist', 'privacy.html'),
      ];
      for (const p of candidates) {
        if (fs.existsSync(p)) {
          const content = fs.readFileSync(p, 'utf-8');
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          return res.status(200).send(content);
        }
      }
    } catch (_) {}
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send('<!doctype html><html><head><title>GOYE Privacy Policy</title></head><body><h1>Privacy Policy</h1><p>GOYE Web3 Business Hub Official Privacy Policy</p><p>Contact: compliance@goye.services</p></body></html>');
  };
  app.get('/privacy', privacyHandler);
  app.get('/api/privacy', privacyHandler);

  return app;
}
