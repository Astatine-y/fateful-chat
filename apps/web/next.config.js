// apps/web/next.config.js
module.exports = {
  rewrites: async () => [
    {
      source: '/api/:path*',
      destination: 'http://localhost:3001/api/:path*',
    },
  ],
};