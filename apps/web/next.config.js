// apps/web/next.config.js
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

module.exports = {
  rewrites: async () => [
    {
      source: '/api/:path*',
      destination: `${apiUrl}/api/:path*`,
    },
  ],
};