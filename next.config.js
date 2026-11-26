/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  env: {
    NEXT_PUBLIC_PI_SANDBOX: process.env.NEXT_PUBLIC_PI_SANDBOX || 'true',
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value:
              "frame-ancestors 'self' https://*.minepi.com https://*.pinet.com https://*.pi.app https://*.pi-browser.app https://app-studio.minepi.com https://appstudio.minepi.com https://*.piappengine.com https://*.vercel.app https://*.google.com; frame-src 'self' https://*.minepi.com https://*.pinet.com https://*.pi.app https://*.pi-browser.app https://*.socialchain.app https://*.piappengine.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://sdk.minepi.com https://*.minepi.com https://*.pinet.com; connect-src 'self' https://socialchain.app https://*.minepi.com https://*.pinet.com https://*.pi.app https://*.pi-browser.app https://backend.appstudio-u7cm9zhmha0ruwv8.piappengine.com https://api.testnet.minepi.com wss:; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data: https:;",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
