/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://sdk.minepi.com https://*.minepi.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; connect-src 'self' https://socialchain.app https://backend.appstudio-u7cm9zhmha0ruwv8.piappengine.com https://api.testnet.minepi.com https://api.minepi.com; frame-ancestors 'self' https://*.pinet.com https://*.minepi.com;"
          }
        ]
      }
    ];
  }
};

export default nextConfig;
