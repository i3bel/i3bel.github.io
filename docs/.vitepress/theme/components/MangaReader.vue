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

    <div v-else>
      <button class="reset-btn" @click="reset">← 重新选择</button>
      <div ref="viewerEl"></div>
    </div>
  </div>
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

  viewerInstance = createMangaViewer(viewerEl.value, {
    manga: { id: 'local-manga', title: '本地漫画', pages },
    locale: 'zh-CN',
    settings: { readingDirection: 'ltr', layoutMode: 'nativeFullscreen' }
  })
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
.reset-btn {
  padding: 6px 14px;
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  cursor: pointer;
  font-size: 14px;
}
.reset-btn:hover { border-color: var(--vp-c-brand-1); }
</style>