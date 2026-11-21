import { defineConfig } from 'vitepress'
import developerSidebar from './developer-nav.json'

export default defineConfig({
  title: 'Semi',
  description: '可通过插件扩展的桌面设备管理应用，支持 macOS 和 Windows',
  lang: 'zh-CN',
  base: '/',
  cleanUrls: true,
  markdown: { lineNumbers: true },
  themeConfig: {
    logo: '/logo.png',
    nav: [
      { text: '首页', link: '/' },
      { text: '下载', link: '/download' },
      { text: '使用指南', link: '/guide/' },
      { text: '插件开发', link: '/developer/' }
    ],
    sidebar: {
      '/guide/': [{ text: '使用指南', items: [
        { text: '快速开始', link: '/guide/' },
        { text: '设备与连接', link: '/guide/devices' }
      ] }],
      '/developer/': developerSidebar
    },
    socialLinks: [{ icon: 'github', link: 'https://github.com/LTDSA/semi-releases' }],
    search: { provider: 'local', options: { locales: { root: { translations: { button: { buttonText: '搜索文档', buttonAriaLabel: '搜索文档' }, modal: { displayDetails: '显示详细列表', resetButtonTitle: '清除搜索', backButtonTitle: '关闭搜索', noResultsText: '没有找到相关结果', footer: { selectText: '选择', navigateText: '切换', closeText: '关闭' } } } } } } },
    outline: { label: '本页目录', level: [2, 3] },
    sidebarMenuLabel: '目录',
    darkModeSwitchLabel: '外观',
    darkModeSwitchTitle: '切换至深色模式',
    lightModeSwitchTitle: '切换至浅色模式',
    returnToTopLabel: '回到顶部',
    externalLinkIcon: true,
    docFooter: { prev: '上一篇', next: '下一篇' },
    footer: { message: 'Semi · 桌面设备管理', copyright: 'Copyright © 2025–2026 LTDSA' }
  }
})
