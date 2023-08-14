import { defineConfig } from 'dumi';

export default defineConfig({
  favicons: ['/logo.png'],
  outputPath: 'docs-dist',
  hash: true,
  locales: [
    { id: 'zh-CN', name: '中文' },
    { id: 'en-US', name: 'English' },
  ],
  themeConfig: {
    name: 'bitlap',
    logo: '/logo.png', // "https://user-images.githubusercontent.com/9554297/83762004-a0761b00-a6a9-11ea-83b4-9c8ff721d4b8.png",
    footer:
      'Open-source MIT Licensed | Copyright © 2022-present<br />Powered by bitlap.org',
    socialLinks: {
      github: 'https://github.com/bitlap',
      // twitter: 'https://xxxx',
      // zhihu: 'https://xxxx',
    },
    nav: {
      'zh-CN': [
        // null,
        {
          title: '实验室',
          children: [
            { title: 'smt', link: '/lab/smt' },
            { title: 'zim', link: '/lab/zim' },
          ],
        },
      ],
      'en-US': [
        // null,
        {
          title: 'Lab',
          children: [
            { title: 'smt', link: '/en-US/lab/smt' },
            { title: 'zim', link: '/en-US/lab/zim' },
          ],
        },
      ],
    },
  },
});
