/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-inline' https://sdk.minepi.com; style-src 'self' 'unsafe-inline'; connect-src 'self' https://socialchain.app https://backend.appstudio-u7cm9zhmha0ruwv8.piappengine.com https://api.testnet.minepi.com; frame-ancestors 'self' https://*.pinet.com https://*.minepi.com;" }
        ]
      },
      {
        source: '/pi-app-validation.txt',
        headers: [
          { key: 'Content-Type', value: 'text/plain; charset=utf-8' },
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
          { key: 'Access-Control-Allow-Origin', value: '*' }
        ]
      }
    ];
  }
};

export default nextConfig;
