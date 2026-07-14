<template>
  <div class="docx-app-root">
    <DocxEditor
      v-if="buf"
      document-name-editable
      :document-name="fileName"
      :document-buffer="buf"
      :color-mode="colorMode"
      :i18n="i18n"
      mode="editing"
      @document-name-change="fileName = $event"
      @save="onSave"
    />
  </div>
</template>

<script setup>
import { ref, shallowRef, onMounted, onBeforeUnmount } from 'vue'
import { DocxEditor } from '@eigenpal/docx-editor-vue'
import '@eigenpal/docx-editor-vue/styles.css'
import zhCN from '@eigenpal/docx-editor-i18n/zh-CN'

const buf = ref(null)
const fileName = ref('未命名文档.docx')
const colorMode = ref('dark')
const i18n = shallowRef(zhCN)

let prevBodyStyle = ''
onMounted(async () => {
  prevBodyStyle = document.body.getAttribute('style') || ''
  document.body.style.margin = '0'
  document.body.style.height = '100vh'
  document.body.style.overflow = 'hidden'

  const res = await fetch('/blank.docx')
  buf.value = await res.arrayBuffer()
})

onBeforeUnmount(() => {
  document.body.setAttribute('style', prevBodyStyle)
})

async function onSave(outBuf) {
  const blob = new Blob([outBuf], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName.value
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.docx-app-root { height: 100vh; width: 100vw; overflow: hidden; display: flex; flex-direction: column; }
.docx-app-root :deep(> *) { flex: 1; min-height: 0; }
</style>