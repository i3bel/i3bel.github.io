<template>
  <DocxEditor
    :document-buffer="buf"
    document-name-editable
    :document-name="fileName"
    :color-mode="colorMode"
    :i18n="i18n"
    mode="editing"
    @document-name-change="fileName = $event"
    @save="onSave"
  >
    <template #titleBarRight>
      <input
        ref="fileInput"
        type="file"
        accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        hidden
        @change="onOpenFile"
      />
      <button title="新建空白文档" @click="newDocument">🆕</button>
      <button title="打开本地文档" @click="fileInput.click()">📂</button>
      <select v-model="localeKey" title="语言">
        <option value="zh-CN">中文</option>
        <option value="en">English</option>
      </select>
      <button title="切换深浅色" @click="toggleColorMode">
        {{ colorMode === 'dark' ? '☀️' : '🌙' }}
      </button>
    </template>
  </DocxEditor>
</template>

<script setup>
import { ref, shallowRef, watch } from 'vue'
import { DocxEditor } from '@eigenpal/docx-editor-vue'
import '@eigenpal/docx-editor-vue/styles.css'
import zhCN from '@eigenpal/docx-editor-i18n/zh-CN'
import en from '@eigenpal/docx-editor-i18n/en'

// null = 直接挂载一个空白文档，一进页面就能用，不需要先选文件
const buf = ref(null)
const fileName = ref('未命名文档.docx')
const fileInput = ref(null)
const colorMode = ref('system') // 跟随系统深浅色，不用手动点
const localeKey = ref('zh-CN')
const i18n = shallowRef(zhCN)

watch(localeKey, (key) => {
  i18n.value = key === 'zh-CN' ? zhCN : en
})

function toggleColorMode() {
  colorMode.value = colorMode.value === 'dark' ? 'light' : 'dark'
}

function onOpenFile(e) {
  const file = e.target.files[0]
  if (!file) return
  fileName.value = file.name
  buf.value = file // documentBuffer 直接支持 File 对象，不用手动转 ArrayBuffer
  e.target.value = ''
}

function newDocument() {
  fileName.value = '未命名文档.docx'
  buf.value = null
}

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