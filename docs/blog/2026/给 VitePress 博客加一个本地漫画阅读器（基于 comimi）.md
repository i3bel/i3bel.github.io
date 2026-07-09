---
title: 给 VitePress 博客加一个本地漫画阅读器（基于 comimi）
date: '2026-07-09T00:00:00+08:00'
summary: 记录把开源漫画阅读器 comimi 接入 VitePress 博客的全过程，实现一个不上传、不联网、只读取本地图片的"漫画"页面，类似 VLC 读取本地视频那样读取本地漫画。
tags:
- VitePress
- comimi
- GitHub Pages
- 漫画阅读器
- 前端
- 建站
---

# 给 VitePress 博客加一个本地漫画阅读器（基于 comimi）

> 本文记录了如何把开源漫画阅读器库 [comimi](https://github.com/yui540/comimi) 接入到 VitePress 搭建的博客（托管在 GitHub Pages 上），做成一个独立的"漫画"页面。核心需求是：**不上传、不联网存储，只读取本地电脑或手机里的图片文件**，效果类似 VLC 播放本地视频——网页只是个播放器/阅读器外壳，内容始终留在本地。

---

## 背景

comimi 是一个不依赖 React/Vue 的纯 JS/TS 漫画阅读器库，负责翻页、手势、全屏、快捷键、阅读进度记忆等交互，但它本身并不关心图片从哪来——只要给它一个 `pages` 数组（每页一个图片地址），它就能渲染。

这个特性正好可以用来做"本地漫画阅读器"：借助浏览器原生的 File API，让用户在页面里选择本地图片或文件夹，浏览器会生成 `blob:` 本地对象 URL——这种 URL 只在当前浏览器标签页内有效，图片数据全程留在本地内存里，不会上传到任何服务器，也不需要联网。把这些本地 URL 交给 comimi 渲染，就得到了一个"读取本地漫画"的网页版阅读器。

---

## 第一步：安装依赖

在 VitePress 项目根目录执行：

```bash
npm install @yui540/comimi
```

---

## 第二步：编写阅读器组件

新建 `.vitepress/theme/components/MangaReader.vue`（路径按实际源目录调整），包含两部分：

1. **选图界面**：提供"选择文件夹"和"选择多张图片"两个入口，选中后通过 `URL.createObjectURL()` 把本地文件转成临时 URL；
2. **阅读界面**：拿到图片 URL 数组后调用 `createMangaViewer` 挂载 comimi。

```vue
<template>
  <div class="manga-reader-page">
    <div v-if="!hasPages" class="manga-picker">
      <div class="picker-card">
        <div class="picker-icon">📖</div>
        <h2>选择本地漫画</h2>
        <p class="picker-desc">图片只在浏览器本地读取，不会上传到任何服务器</p>
        <label class="picker-btn primary">
          选择文件夹
          <input type="file" webkitdirectory multiple @change="onFilesSelected" hidden />
        </label>
        <label class="picker-btn">
          选择多张图片
          <input type="file" accept="image/*" multiple @change="onFilesSelected" hidden />
        </label>
        <p class="picker-hint">手机端建议用"选择多张图片"</p>
      </div>
    </div>

    <div v-else class="reader-wrap">
      <div class="reader-toolbar">
        <button class="reset-btn" @click="reset">← 重新选择</button>
        <span v-if="totalPages" class="page-indicator">
          第 {{ currentPageIndex + 1 }} / {{ totalPages }} 页
        </span>
      </div>
      <div ref="viewerEl" class="i3bel-manga-viewer"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onBeforeUnmount } from 'vue'
import { createMangaViewer } from '@yui540/comimi'

const hasPages = ref(false)
const viewerEl = ref(null)
const currentPageIndex = ref(0)
const totalPages = ref(0)

let viewerInstance = null
let currentUrls = []

function naturalSort(a, b) {
  return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
}

async function onFilesSelected(e) {
  const files = Array.from(e.target.files).filter(f => f.type.startsWith('image/'))
  if (files.length === 0) return

  files.sort(naturalSort)

  const pages = files.map((file, i) => ({
    id: `p${i}`,
    type: 'image',
    src: URL.createObjectURL(file),
    label: file.name
  }))

  currentUrls = pages.map(p => p.src)
  totalPages.value = pages.length
  hasPages.value = true
  await nextTick()

  viewerInstance = createMangaViewer(viewerEl.value, {
    manga: { id: 'local-manga', title: '本地漫画', pages },
    initialPageQueryParam: 'p',
    locale: 'zh-CN',
    settings: {
      readingDirection: 'ltr',
      layoutMode: 'nativeFullscreen'
    },
    storage: {
      enabled: true,
      databaseName: 'i3bel-manga'
    },
    className: 'i3bel-manga-viewer',
    events: {
      ready: ({ manga }) => {
        console.log('[漫画阅读器] 加载完成：', manga.title, '共', manga.pages.length, '页')
      },
      pageChange: ({ pageIndex }) => {
        currentPageIndex.value = pageIndex
      }
    }
  })
}

function reset() {
  viewerInstance?.destroy()
  viewerInstance = null
  hasPages.value = false
  currentPageIndex.value = 0
  totalPages.value = 0
  currentUrls.forEach(url => URL.revokeObjectURL(url))
  currentUrls = []
}

onBeforeUnmount(() => {
  viewerInstance?.destroy()
  currentUrls.forEach(url => URL.revokeObjectURL(url))
})
</script>

<style scoped>
.manga-picker {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  padding: 24px;
}
.picker-card {
  max-width: 420px;
  width: 100%;
  text-align: center;
  padding: 40px 32px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
  background: var(--vp-c-bg-soft);
}
.picker-icon { font-size: 48px; margin-bottom: 8px; }
.picker-card h2 { margin: 0 0 8px; font-size: 20px; }
.picker-desc {
  color: var(--vp-c-text-2);
  font-size: 14px;
  margin-bottom: 24px;
}
.picker-btn {
  display: block;
  width: 100%;
  padding: 12px;
  margin-bottom: 12px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  cursor: pointer;
  font-size: 14px;
  transition: border-color .2s, background .2s;
}
.picker-btn:hover { border-color: var(--vp-c-brand-1); }
.picker-btn.primary {
  background: var(--vp-c-brand-1);
  color: var(--vp-c-white, #fff);
  border-color: var(--vp-c-brand-1);
}
.picker-btn.primary:hover { background: var(--vp-c-brand-2); }
.picker-hint {
  font-size: 12px;
  color: var(--vp-c-text-3);
  margin-top: 8px;
}
.reader-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.reset-btn {
  padding: 6px 14px;
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  cursor: pointer;
  font-size: 14px;
}
.reset-btn:hover { border-color: var(--vp-c-brand-1); }
.page-indicator {
  font-size: 13px;
  color: var(--vp-c-text-2);
}
</style>
```

界面样式使用了 VitePress 的主题 CSS 变量（`--vp-c-brand-1` 等），深色/浅色模式会自动跟随站点主题，不用额外适配。

---

## 第三步：创建"漫画"页面

新建 `manga.md`：

```md
---
layout: page
title: 漫画
---

<script setup>
import MangaReader from './.vitepress/theme/components/MangaReader.vue'
</script>

<ClientOnly>
  <MangaReader />
</ClientOnly>
```

`<ClientOnly>` 是必须加的一步：VitePress 构建时会在 Node 环境里做服务端渲染（SSR），而 `createMangaViewer` 需要操作真实 DOM，在 Node 里执行会报错导致构建失败。`ClientOnly` 保证这个组件只在浏览器里挂载。

---

## 第四步：把"漫画"加到导航栏

打开 `.vitepress/config.ts`，在 `nav` 数组里加一项：

```ts
export default defineConfig({
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      // ...原有导航...
      { text: '漫画', link: '/manga' }
    ]
  }
})
```

VitePress 的 `nav` 默认渲染在页面右上角，加进数组即可，不需要额外定位样式。

---

## 第五步：本地测试与部署

```bash
npm run docs:dev
```

打开对应地址，点导航栏"漫画" → 选择一个文件夹或几张图片 → 应该能直接看到阅读器加载出来，支持翻页、全屏、快捷键。

确认无误后正常执行构建、推送部署流程即可：

```bash
npm run docs:build
```

因为整个漫画阅读功能都是纯客户端代码（打包进静态 JS bundle），跟现有 GitHub Pages 部署流程完全一样，不需要额外配置服务器或后端。

---

## 踩过的两个坑

### 1. 选图界面太丑

默认的原生 `<input type="file">` 样式很难看，用 `hidden` 属性隐藏原生输入框，改用 `<label>` 包裹触发点击，再套上卡片样式（圆角、间距、按钮 hover 效果），体验立刻好很多，代码见上文组件里的 `.picker-*` 相关样式。

### 2. 翻页动效"消失"了

一开始怀疑是操作系统的"减少动态效果"（`prefers-reduced-motion: reduce`）无障碍设置导致 comimi 主动关闭了动画，但经过对照测试（官方演示站同样是 `reduce: true`，动效依旧正常），排除了这个猜测。

后来确认所谓"没有动效"其实指的是阅读器内按钮的 `:hover` / `:active` 微交互效果不明显，而不是翻页本身的过渡动画——翻页功能和过渡效果其实一直是正常的。这类细节样式覆盖问题（大概率是 VitePress 全局样式与 comimi 注入样式的优先级冲突）后续可以用浏览器开发者工具的 Styles 面板逐条排查，但对使用体验影响不大，暂未继续深究。

---

## 关于隐私与本地读取的说明

- 图片通过 `URL.createObjectURL(file)` 生成的是浏览器内存里的临时引用，数据从始至终不会离开本地设备，更不会经过 GitHub Pages 服务器（GitHub Pages 本身就是纯静态托管，没有接收上传的能力）。
- 每次刷新页面都需要重新选择文件夹或图片，这是浏览器的安全限制，网页无法记住上次选择的本地文件路径；但阅读设置（阅读方向、布局模式等）会通过 comimi 自带的 IndexedDB 存储保留下来。
- 图片文件名建议使用统一位数命名（如 `001.jpg`、`002.jpg`），保证按文件名自然排序时页面顺序正确。
- 手机端 Safari 对"选择整个文件夹"支持不稳定，建议使用"选择多张图片"入口。

---

## 总结

整个接入过程核心其实很简单：comimi 负责渲染和交互，浏览器原生 File API 负责"读本地文件而不上传"，VitePress 只需要留意 SSR 场景下要用 `<ClientOnly>` 包裹客户端专属逻辑。花费的时间主要在两个细节问题的排查上，功能本身半小时内就能跑起来。

---

## 参考链接

- [comimi GitHub 仓库](https://github.com/yui540/comimi)
- [VitePress 官方文档](https://vitepress.dev/)
- [MDN：URL.createObjectURL()](https://developer.mozilla.org/zh-CN/docs/Web/API/URL/createObjectURL_static)
