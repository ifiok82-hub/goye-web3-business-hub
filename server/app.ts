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
      sandbox: process.env.PI_SANDBOX !== 'false',
    });
  });

  return app;
}
