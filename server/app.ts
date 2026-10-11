/**
 * GOYE Web3 Business Hub - Express Application Factory
 * Configures routers, security middleware, and route prefix handling for both
 * local development/server execution and Vercel Serverless Function deployments.
 */

import express from 'express';
import dotenv from 'dotenv';
import { apiRouter } from './routes/api.ts';
import { piRouter } from './routes/pi.ts';
import { verifyRouter } from './routes/verify.ts';
import { adminRouter } from './routes/admin.ts';

dotenv.config();

export function createExpressApp() {
  const app = express();

  // JSON Body Parser
  app.use(express.json());



  // Mount Hardened Routers
  app.use('/api/verify', verifyRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api/pi', piRouter);
  app.use('/api', apiRouter);

  // Health check endpoint
  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'GOYE Web3 Business Hub',
      timestamp: new Date().toISOString(),
      network: process.env.PI_NETWORK_MODE || 'TESTNET',
      sandbox: false,
    });
  });

  // Official Pi Domain Validation endpoint
  app.get('/validation-key.txt', (_req, res) => {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send('90abaa643d3497da29102392c358d77a18e2937cb338f944de6f88db2a2a2f7a46a39851946bb07eaa648e3a5cbee79db904ab485c3e929be43049c61396c757\n');
  });

  return app;
}
