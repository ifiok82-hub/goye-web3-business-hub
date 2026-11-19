/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/pi-app-validation.txt',
        headers: [
          { key: 'Content-Type', value: 'text/plain; charset=utf-8' },
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
        ],
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value:
              "frame-ancestors 'self' https://*.pinet.com https://*.minepi.com https://socialchain.app https://*.socialchain.app https://*.piappengine.com https://appstudio.minepi.com https://aistudio.google.com https://*.google.com https://*.googleusercontent.com https://*.usercontent.goog https://*.run.app; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://sdk.minepi.com; connect-src 'self' https://socialchain.app https://backend.appstudio-u7cm9zhmha0ruwv8.piappengine.com https://api.minepi.com https://api.testnet.minepi.com wss://*.run.app ws://localhost:3000; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data: https:;",
          },
        ],
      },
    ];
  },
};
module.exports = nextConfig;
