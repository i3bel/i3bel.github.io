import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'i3bel',
  description: '个人技术博客 - 记录学习与思考',
  lang: 'zh-CN',
  base: '/',
  lastUpdated: true,
  cleanUrls: true,
  ignoreDeadLinks: true,

  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#059669' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:locale', content: 'zh_CN' }],
  ],

  themeConfig: {
    logo: null,
    search: {
      provider: 'local',
    },
    nav: [
      { text: 'Blog', link: '/blog/' },
      { text: 'Archives', link: '/archives/' },
      { text: 'Tags', link: '/tags/' },
      { text: '猜你想找', link: '/猜你想找/' },
      { text: 'Friends', link: '/friends/' },
      { text: 'About', link: '/about/' },
      { text: '漫画', link: '/manga' },
      { text: '文档编辑', link: '/docx-editor' },
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/i3bel' },
    ],
    footer: {
      copyright: `© ${new Date().getFullYear()} i3bel`,
    },
    docFooter: {
      prev: '上一篇',
      next: '下一篇',
    },
    outline: {
      label: '目录',
      level: [1, 4],
    },
    lastUpdated: {
      text: '最后更新于',
    },
    notFound: {
      title: '页面未找到',
      quote: '你访问的页面不存在，或许可以看看其他文章。',
      linkLabel: '返回首页',
      linkText: '返回首页',
    },
  },
})
