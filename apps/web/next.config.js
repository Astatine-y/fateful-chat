// apps/web/next.config.js
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function getApiUrl() {
  let url = apiUrl.trim();
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }
  return url.replace(/\/$/, '');
}

module.exports = {
  rewrites: async () => [
    {
      source: '/api/:path*',
      destination: `${getApiUrl()}/api/:path*`,
    },
  ],
  typescript: {
    ignoreBuildErrors: true,
  },
};