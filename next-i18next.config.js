const path = require('path');

module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'zh-cn', 'zh-tw', 'es', 'fr', 'th', 'vi'],
  },
  ns: ['common', 'bazi', 'dashboard', 'auth'],
  defaultNS: 'common',
  localePath: path.resolve('./apps/web/public/locales'),
};
