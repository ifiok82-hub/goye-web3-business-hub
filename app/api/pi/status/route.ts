import { NextResponse } from 'next/server';
import { getPiApiBase, getPiApiKeyStatus, isPiSandboxServer } from '@/lib/piPlatform';

export async function GET() {
  const piApiKeyStatus = getPiApiKeyStatus();
  const sandbox = isPiSandboxServer();

  return NextResponse.json(
    {
      piApiKeyConfigured: piApiKeyStatus === 'CONFIGURED',
      piApiKeyStatus,
      sandbox,
      network: sandbox ? 'testnet' : 'mainnet',
      piApiBase: getPiApiBase(),
      routes: {
        auth: '/api/auth/pi',
        approve: '/api/pi/approve',
        complete: '/api/pi/complete',
        cancel: '/api/pi/cancel',
        incomplete: '/api/pi/incomplete',
      },
    },
    { status: 200 }
  );
}
