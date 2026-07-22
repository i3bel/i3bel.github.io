<template>
  <ClientOnly>
    <div class="about-page vp-raw">
      <!-- 1. 未选择文件时展示的选择界面 -->
      <div v-if="!hasPages">
        <Title color="warm-peach-pink" size="large">阁楼</Title>

        <Divider type="dashed-brown" style="margin-top: 30px;" />

        <div class="picker-btn-group">
          <!-- 隐藏的原生文件输入框 -->
          <input 
            ref="folderInputRef" 
            type="file" 
            webkitdirectory 
            multiple 
            @change="onFilesSelected" 
            hidden 
          />
          <input 
            ref="imagesInputRef" 
            type="file" 
            accept="image/*" 
            multiple 
            @change="onFilesSelected" 
            hidden 
          />

          <!-- 1. 选择文件夹 -->
          <Button 
            type="primary" 
            danger 
            style="margin-top: 10px; margin-bottom: 20px;" 
            @click="triggerFolderSelect"
          >
            选择文件夹
          </Button>

          <!-- 2. 选择多张图片 -->
          <Button 
            type="primary" 
            danger 
            style="margin-top: 10px; margin-bottom: 20px;" 
            @click="triggerImagesSelect"
          >
            选择多张图片
          </Button>

          <!-- 3. 点击直接跳转到 /文档编辑/ 页面 -->
          <Button 
            type="primary" 
            danger 
            style="margin-top: 10px; margin-bottom: 20px;" 
            @click="goToDocEditor"
          >
            文档编辑
          </Button>

          <!-- 4. 切换光亮与黑暗模式 -->
          <Button 
            type="primary" 
            danger 
            style="margin-top: 10px; margin-bottom: 20px;" 
            @click="toggleTheme"
          >
            {{ isDark ? '☀️ 浅色模式' : '🌙 深色模式' }}
          </Button>
        </div>


<template>
  <div class="vp-home-hero">
    <div class="avatar">
      <img src="https://github.com/i3bel.png" alt="avatar" />
    </div>
    <h1>你好，我是 i3bel</h1>
    <p class="tagline">一名正在探索技术的爱好者</p>

    <div class="signature">
      <div class="signature-quote">
        <span class="signature-mark">"</span>
        <span class="signature-text">{{ quote }}</span>
        <span class="signature-mark">"</span>
      </div>
    </div>

    <div class="actions">
      <a href="/blog/" class="btn btn-primary">查看博客</a>
      <!-- 点击关于我触发实时彩蛋转换 -->
      <a href="/about/" class="btn btn-secondary" @click="toggleFont">关于我</a>
    </div>
  </div>

  <div class="post-list">
    <h2 class="section-title">最新文章</h2>
    <div v-for="post in posts" :key="post.url" class="post-item">
      <div class="post-date">{{ post.date }}</div>
      <div class="post-title">
        <a :href="post.url">{{ post.title }}</a>
      </div>
      <p class="post-summary">{{ post.summary }}</p>
      <div class="post-tags">
        <a
          v-for="tag in post.tags"
          :key="tag"
          :href="`/tags/#${tag}`"
          class="post-tag"
        >#{{ tag }}</a>
      </div>
    </div>
  </div>
</template>
        <Card type="dashed" color="warm-peach-pink" style="margin-top: 10px;">
          图片只在浏览器本地读取，不会上传到任何服务器。<br />
          <span style="font-size: 13px; opacity: 0.8;">💡 手机端建议使用“选择多张图片”</span>
        </Card>
        <div style="height: 20px;"></div>
        <Collapse question="「阁楼」路径？">
        <p>阁楼 → 大厅、花园</p>
        </Collapse>

      </div>

      <!-- 2. 网页全屏阅读器 -->
      <div v-else class="manga-viewer-container">
        <!-- comimi 阅读器挂载点 -->
        <div ref="viewerEl" class="comimi-viewer-wrapper"></div>
      </div>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { ref, nextTick, onBeforeUnmount } from 'vue'
import { useRouter, useData } from 'vitepress'
import { createMangaViewer } from '@yui540/comimi'

// 引入 animal-island-vue 组件及样式
import { Title, Divider, Card, Button, Collapse } from 'animal-island-vue'
import 'animal-island-vue/style'

// 初始化 VitePress 路由与主题数据
const router = useRouter()
const { isDark } = useData()

// 切换深色/浅色模式
function toggleTheme() {
  isDark.value = !isDark.value
}

// 跳转到 /文档编辑/
function goToDocEditor() {
  router.go('/文档编辑/')
}

const hasPages = ref(false)
const viewerEl = ref<HTMLElement | null>(null)
let viewerInstance: any = null

// DOM 引用
const folderInputRef = ref<HTMLInputElement | null>(null)
const imagesInputRef = ref<HTMLInputElement | null>(null)

// 按钮点击触发函数
function triggerFolderSelect() {
  folderInputRef.value?.click()
}

function triggerImagesSelect() {
  imagesInputRef.value?.click()
}

function naturalSort(a: File, b: File) {
  return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
}

async function onFilesSelected(e: Event) {
  const target = e.target as HTMLInputElement
  if (!target.files) return

  const files = Array.from(target.files).filter(f => f.type.startsWith('image/'))
  if (files.length === 0) return

  files.sort(naturalSort)

  const pages = files.map((file, i) => ({
    id: `p${i}`,
    type: 'image',
    src: URL.createObjectURL(file),
    label: file.name
  }))

  hasPages.value = true
  await nextTick()

  if (viewerEl.value) {
    viewerInstance = createMangaViewer(viewerEl.value, {
      manga: { id: 'local-manga', title: '阁楼', pages },
      locale: 'zh-CN',
      
      settings: {
        layoutMode: 'browserFullscreen',
        readingDirection: 'rtl'
      },
      
      lockLayoutMode: true,
      forceSettings: ['layoutMode']
    })
  }
}

function reset() {
  viewerInstance?.destroy()
  viewerInstance = null
  hasPages.value = false
}

onBeforeUnmount(() => {
  viewerInstance?.destroy()
})
</script>

<style scoped>
/* ==========================================================================
   页面整体排版
   ========================================================================== */
.about-page {
  padding-top: calc(var(--vp-nav-height, 64px) + 32px);
  padding-bottom: 64px;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  padding-left: 32px;
  padding-right: 32px;
  box-sizing: border-box;
  width: 100%;
}

:global(.has-sidebar) .about-page {
  margin-left: calc(var(--vp-sidebar-width, 272px) + 32px);
}

@media (max-width: 960px) {
  .about-page {
    padding-top: calc(var(--vp-nav-height, 64px) + 16px);
    padding-left: 16px;
    padding-right: 16px;
  }
  
  :global(.has-sidebar) .about-page {
    margin-left: auto;
  }
}

.picker-btn-group {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

/* ==========================================================================
   阅读器挂载样式
   ========================================================================== */
.manga-viewer-container {
  width: 100%;
  height: 100%;
}

.comimi-viewer-wrapper :deep(*) {
  animation-play-state: running !important;
  box-sizing: border-box;
}
</style>