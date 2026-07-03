# i3bel's Notes

![GitHub Repo stars](https://img.shields.io/github/stars/i3bel/i3bel.github.io?style=social)
![GitHub last commit](https://img.shields.io/github/last-commit/i3bel/i3bel.github.io)
![License](https://img.shields.io/github/license/i3bel/i3bel.github.io)

基于 [VitePress](https://vitepress.dev) 构建的个人笔记博客，部署在 GitHub Pages。

说实话，这个博客用到的技术栈我一个也不会，但这不妨碍我记录和分享。

## 技术栈

- **框架**: VitePress (Vue 3 + Vite)
- **搜索**: VitePress 内置本地搜索
- **部署**: GitHub Actions → GitHub Pages
- **样式**: 自定义 CSS 覆盖默认主题

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建静态站点
npm run build

# 预览构建结果
npm run preview
```

## 目录结构

```
├── .github/workflows/
│   └── deploy.yml           # GitHub Actions 自动部署
├── docs/                    # VitePress 文档根目录
│   ├── .vitepress/
│   │   ├── config.mts       # 站点配置
│   │   └── theme/           # 自定义主题
│   ├── blog/                # 博客文章
│   ├── archives/            # 归档页
│   ├── tags/                # 标签页
│   ├── friends/             # 友链页
│   └── public/              # 静态资源
└── package.json
```

## 文章规范

文章使用 Markdown 编写，放在 `docs/blog/` 目录下，按年份分文件夹：

```yaml
---
title: 文章标题
date: 2026-05-22
tags: [VitePress, GitHub Pages]
summary: 文章摘要，用于列表页展示
---
```

## 部署

推送到 `master` 分支后，GitHub Actions 自动构建并部署到 GitHub Pages。

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=i3bel/i3bel.github.io&type=Date)](https://star-history.com/#i3bel/i3bel.github.io&Date)

## License

[MIT](LICENSE)
