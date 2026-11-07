/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  headers: async () => [
    {
      source: '/pi-app-validation.txt',
      headers: [
        { key: 'Content-Type', value: 'text/plain; charset=utf-8' },
        { key: 'Cache-Control', value: 'public, max-age=0' },
        { key: 'Access-Control-Allow-Origin', value: '*' }
      ]
    }
  ]
}

module.exports = nextConfig
