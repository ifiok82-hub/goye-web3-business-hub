/**
 * GOYE Web3 Business Hub - Vercel Serverless Function Handler
 * Routes incoming API requests on Vercel to the Express application instance.
 *
 * Hardened for Vercel Serverless execution:
 * - Detects matched path from headers (x-matched-path, x-forwarded-uri, x-vercel-original-url)
 * - Detects query parameter path ($1 from vercel.json rewrite)
 * - Normalizes req.url so Express router matches regardless of Vercel prefix stripping
 * - Sets permissive CORS headers for mobile webview compatibility
 */

import type { IncomingMessage, ServerResponse } from 'http';
import { createExpressApp } from '../server/app.ts';

const app = createExpressApp();

export default function handler(req: IncomingMessage, res: ServerResponse) {
  // CORS Preflight handling for Serverless edge
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  let targetPath = req.url || '';

  // 1. Inspect headers sent by Vercel's routing layer
  const forwardedPath =
    (req.headers['x-matched-path'] as string) ||
    (req.headers['x-forwarded-uri'] as string) ||
    (req.headers['x-vercel-original-url'] as string) ||
    (req.headers['x-original-url'] as string);

  if (forwardedPath && forwardedPath.startsWith('/api/')) {
    targetPath = forwardedPath;
  } else if (req.url && req.url.includes('path=')) {
    // 2. Inspect query parameter from vercel.json destination /api?path=$1
    const match = req.url.match(/[?&]path=([^&]+)/);
    if (match) {
      const decoded = decodeURIComponent(match[1]);
      targetPath = decoded.startsWith('/') ? '/api' + decoded : '/api/' + decoded;
    }
  }

  // 3. Ensure targetPath has /api prefix for Express routing (unless /health or /validation-key.txt)
  if (
    targetPath &&
    !targetPath.startsWith('/api') &&
    !targetPath.startsWith('/health') &&
    !targetPath.startsWith('/validation-key.txt')
  ) {
    targetPath = '/api' + (targetPath.startsWith('/') ? targetPath : '/' + targetPath);
  }

  req.url = targetPath;

  return (app as unknown as (req: IncomingMessage, res: ServerResponse) => void)(req, res);
}
