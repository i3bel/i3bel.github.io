<template>
  <ClientOnly>
    <div class="manga-reader-page vp-raw">
      <!-- 1. 选择文件界面 -->
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

      <!-- 2. 网页全屏阅读器 -->
      <div v-else class="manga-viewer-container">
        <!-- 退出/重新选择按钮 -->
        <button class="reset-btn" @click="reset">← 重新选择</button>
        <!-- comimi 阅读器挂载点 -->
        <div ref="viewerEl" class="comimi-viewer-wrapper"></div>
      </div>
    </div>
  </ClientOnly>
</template>

<script setup>
import { ref, nextTick, onBeforeUnmount } from 'vue'
import { createMangaViewer } from '@yui540/comimi'

const hasPages = ref(false)
const viewerEl = ref(null)
let viewerInstance = null

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

  hasPages.value = true
  await nextTick()

  if (viewerEl.value) {
    viewerInstance = createMangaViewer(viewerEl.value, {
      manga: { id: 'local-manga', title: '本地漫画', pages },
      locale: 'zh-CN',
      
      // 核心设置：开启网页全屏并锁定
      settings: {
        layoutMode: 'browserFullscreen', // 网页全屏（铺满浏览器）
        readingDirection: 'rtl'          // 日式漫画默认右->左 (可按需改 ltr)
      },
      
      // 强行锁定模式，防止 IndexedDB 缓存旧设置覆盖，同时禁用按 Esc / N / W 退出网页全屏
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
   选择卡片 UI 样式
   ========================================================================== */
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
.picker-card h2 { margin: 0 0 8px; font-size: 20px; border: none; padding: 0; }
.picker-desc { color: var(--vp-c-text-2); font-size: 14px; margin-bottom: 24px; }

.picker-btn {
  display: block; width: 100%; padding: 12px; margin-bottom: 12px;
  border-radius: 8px; border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg); cursor: pointer; font-size: 14px;
  transition: border-color .2s;
}
.picker-btn:hover { border-color: var(--vp-c-brand-1); }
.picker-btn.primary {
  background: var(--vp-c-brand-1); color: #fff; border-color: var(--vp-c-brand-1);
}
.picker-hint { font-size: 12px; color: var(--vp-c-text-3); margin-top: 8px; }

/* ==========================================================================
   网页全屏顶层与重新选择按钮
   ========================================================================== */
.manga-viewer-container {
  width: 100%;
  height: 100%;
}

/* 重新选择按钮悬浮在网页全屏最上层 (层级设高，防止被阅读器 UI 遮挡) */
.reset-btn {
  position: fixed;
  top: 12px;
  left: 12px;
  z-index: 999999;
  padding: 6px 14px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  cursor: pointer;
  font-size: 13px;
  backdrop-filter: blur(4px);
  transition: all 0.2s;
}

.reset-btn:hover {
  background: rgba(0, 0, 0, 0.85);
  border-color: var(--vp-c-brand-1);
}

/* 恢复动画与原生交互 */
.comimi-viewer-wrapper :deep(*) {
  animation-play-state: running !important;
  box-sizing: border-box;
}
</style>