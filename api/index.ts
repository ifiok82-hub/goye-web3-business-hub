/**
 * GOYE Web3 Business Hub - Vercel Serverless Function Handler
 * Routes incoming API requests on Vercel to the Express application instance.
 */

import type { IncomingMessage, ServerResponse } from 'http';
import { createExpressApp } from '../server/app.ts';

const app = createExpressApp();

export default function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.url && !req.url.startsWith('/api') && !req.url.startsWith('/health')) {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
  }
  return (app as unknown as (req: IncomingMessage, res: ServerResponse) => void)(req, res);
}
