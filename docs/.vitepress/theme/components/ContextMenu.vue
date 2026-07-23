<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, nextTick } from 'vue'
import { useRouter, useRoute } from 'vitepress'
import { Select } from 'animal-island-vue'

const router = useRouter()
const route = useRoute()

const visible = ref(false)
const pos = ref({ x: 0, y: 0 })
const selectedValue = ref('')
const selectRef = ref<any>(null)

interface MenuItem {
  key: string
  label: string
  target: string
  message?: string
  description?: string
  type?: 'info' | 'success' | 'warning' | 'error'
}

const menuMap: Record<string, MenuItem[]> = {
  // 从 花园 (/garden/) 出发
  '/garden/': [
    { key: 'hall', label: '🏠 大厅', target: '/', message: '抖落法袍上的落叶与泥土……回大厅喝杯热花草茶吧。' },
    { key: 'study', label: '👤 书房', target: '/study/', message: '去书房吧。毕竟精灵的记忆太漫长了，有些旧事得翻翻魔导书才想得起来。' },
    { key: 'loft', label: '📖 阁楼', target: '/loft/', message: '趁着阳光不错，去阁楼晒晒那些收集来的、毫无用处的魔法道具吧。' },
  ],

  // 从 陈列廊/博客 (/blog/) 出发
  '/blog/': [
    { key: 'hall', label: '🏠 大厅', target: '/', message: '合上泛黄的手稿……大厅里的壁炉应该还烧得正旺吧。' },
    { key: 'loft', label: '📖 阁楼', target: '/loft/', message: '去阁楼看看吧，说不定能找到「把这些文字变成民间魔法」的魔导书呢。' },
  ],

  // 从 档案室 (/archives/) 出发
  '/archives/': [
    { key: 'hall', label: '🏠 大厅', target: '/', message: '人类的时间总是走得这么快……先回大厅休息一会儿吧。' },
    { key: 'tags', label: '🏷️ 索引室', target: '/tags/', message: '把这些散落的旅途记忆，按标签好好归类收拢起来吧。' },
  ],

  // 从 索引室 (/tags/) 出发
  '/tags/': [
    { key: 'hall', label: '🏠 大厅', target: '/', message: '分类整理得差不多了，回大厅坐会儿吧。' },
    { key: 'oracle', label: '🔮 占卜室', target: '/oracle/', message: '前方有一股不可思议的魔力反应呢……去看看也无妨。' },
    { key: 'archives', label: '📚 档案室', target: '/archives/', message: '顺着这些标记，回去翻翻很久很久以前写下的文字吧。' },
  ],

  // 从 书房 (/study/) 出发
  '/study/': [
    { key: 'hall', label: '🏠 大厅', target: '/', message: '羽毛笔的墨水干了。今天就先研究到这里，回大厅吧。' },
    { key: 'oracle', label: '🔮 占卜室', target: '/oracle/', message: '魔法研究遇到了瓶颈……去占卜室找找看有没有神秘的灵感吧。' },
    { key: 'garden', label: '🌿 花园', target: '/garden/', message: '眼睛稍微有点酸了呢，去外面看看草木花卉开了没有。' },
  ],

  // 从 占卜室 (/oracle/) 出发
  '/oracle/': [
    { key: 'hall', label: '🏠 大厅', target: '/', message: '命运这种东西总是难以琢磨，还是大厅里和平平静静的日常更让人安心呢。' },
    { key: 'tags', label: '🏷️ 索引室', target: '/tags/', message: '把刚刚获得的启示，归类到具体的魔力标记里去吧。' },
    { key: 'loft', label: '📖 阁楼', target: '/loft/', message: '积灰的阴暗角落里……说不定正藏着宝箱怪（以及罕见的魔导书）呢。' },
    { key: 'darkroom', label: '🕯️ 暗房', target: '/darkroom/', message: '点亮一盏微光，在静谧的暗房里，像吟唱咒语一样专注地敲击指尖吧。' },
  ],

  // 从 阁楼 (/loft/) 出发
  '/loft/': [
    { key: 'hall', label: '🏠 大厅', target: '/', message: '踩着木梯吱呀吱呀地走下去，回大厅喝杯红茶歇一会儿。' },
    { key: 'garden', label: '🌿 花园', target: '/garden/', message: '从阁楼小窗看到外面的微风，想去花海里躺着睡个午觉呢。' },
    { key: 'darkroom', label: '🕯️ 暗房', target: '/darkroom/', message: '点亮一盏微光，在静谧的暗房里，像吟唱咒语一样专注地敲击指尖吧。' },
  ],

  // 从 暗房 (/darkroom/) 出发
  '/darkroom/': [
    { key: 'hall', label: '🏠 大厅', target: '/', message: '从静谧的暗房里出来，踩着木梯回大厅歇一会儿吧。' },
    { key: 'garden', label: '🌿 花园', target: '/garden/', message: '暗房待久了有点眼花，去外面的花园吹吹风吧。' },
    { key: 'oracle', label: '🔮 占卜室', target: '/oracle/', message: '咏唱遇到了瓶颈……去寻找一点神秘的灵感与启发吧。' },
  ],

  // 从 大厅 (/) 出发（旅程的起点与中途休息站）
  '/': [
    { key: 'blog', label: '🖼️ 陈列廊', target: '/blog/', message: '来看看这一路上，我和伙伴们都收集到了哪些有趣的故事吧。' },
    { key: 'archives', label: '📚 档案室', target: '/archives/', message: '去翻翻过去的日记吧……明明只是几十年前的事，却感觉像在很久以前了。' },
    { key: 'tags', label: '🏷️ 索引室', target: '/tags/', message: '漫长旅途里散落的记忆碎片，在这里都能找到踪迹呢。' },
    { key: 'oracle', label: '🔮 占卜室', target: '/oracle/', message: '「能让人找到好玩藏品的魔法」……大概就在里面吧。' },
    { key: 'garden', label: '🌿 花园', target: '/garden/', message: '去拜访一下同行旅人们的花园吧，如果是勇者辛美尔的话，大概也会这么做。' },
    { key: 'loft', label: '📖 阁楼', target: '/loft/', message: '积灰的阴暗角落里……说不定藏着什么毫无用处却很有趣的小玩意呢。' },
    { key: 'study', label: '👤 书房', target: '/study/', message: '找个安静的地方坐下，聊聊关于我的、以及那些漫长的时光吧。' },
    { key: 'darkroom', label: '🕯️ 暗房', target: '/darkroom/', message: '点亮一盏微光，在静谧的暗房里，像吟唱咒语一样专注地敲击指尖吧。' },
  ],
}

function matchedOptions(): MenuItem[] {
  const matches = Object.keys(menuMap)
    .filter(p => route.path === p || route.path.startsWith(p))
    .sort((a, b) => b.length - a.length)

  return matches.length ? menuMap[matches[0]] : []
}

const options = computed(matchedOptions)

async function onContextMenu(e: MouseEvent) {
  const opts = matchedOptions()
  if (!opts.length) return

  e.preventDefault()

  const width = 220
  const height = 300

  pos.value = {
    x: Math.min(e.clientX, window.innerWidth - width),
    y: Math.min(e.clientY, window.innerHeight - height)
  }

  selectedValue.value = ''
  visible.value = true

  // ⚡️ 等待 DOM 渲染完毕后，自动触发 Select 的展开事件
  await nextTick()
  if (selectRef.value) {
    // 优先尝试触发 Select 暴露出的 triggerRef，如果没有则直接点击 DOM
    const triggerEl = selectRef.value.triggerRef || selectRef.value.$el?.querySelector('.animal-select-trigger, [class*="trigger"]') || selectRef.value.$el
    if (triggerEl && typeof triggerEl.click === 'function') {
      triggerEl.click()
    }
  }
}

async function onSelect(value: string) {
  const item = options.value.find(o => o.key === value)

  if (item) {
    const { Notification } = await import('animal-island-vue')
    
    const notifyType = item.type ?? 'info'
    const notifyFn = Notification[notifyType] || Notification.info

    notifyFn({
      message: item.message ?? `欢迎来到「${item.label.replace(/^\S+\s/, '')}」`,
      description: item.description,
      duration: 4.5,
    })

    try {
      router.go(item.target)
    } catch {
      location.href = item.target
    }
  }

  visible.value = false
}

function onDocClick(e: MouseEvent) {
  const el = document.querySelector('.ctx-select-float')
  if (el && !el.contains(e.target as Node)) {
    visible.value = false
  }
}

function close() {
  visible.value = false
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') close()
}

onMounted(() => {
  window.addEventListener('contextmenu', onContextMenu)
  window.addEventListener('click', onDocClick, true)
  window.addEventListener('keydown', onKeydown)
  window.addEventListener('scroll', close, true)
  window.addEventListener('resize', close)
})

onBeforeUnmount(() => {
  window.removeEventListener('contextmenu', onContextMenu)
  window.removeEventListener('click', onDocClick, true)
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('scroll', close, true)
  window.removeEventListener('resize', close)
})
</script>

<template>
  <Teleport to="body">
    <div class="vp-raw">
      <div
        v-if="visible"
        class="ctx-select-float"
        :style="{
          left: pos.x + 'px',
          top: pos.y + 'px'
        }"
      >
        <Select
          ref="selectRef"
          v-model="selectedValue"
          :options="options"
          placeholder="选择跳转页面..."
          @change="onSelect"
        />
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.ctx-select-float {
  position: fixed;
  z-index: 99999;
}

/* ⚡️ 隐藏 Select 默认的选择框主体（Trigger），让弹出的下拉列表直接展示 */
.ctx-select-float :deep([class*="trigger"]),
.ctx-select-float :deep(.animal-select-trigger),
.ctx-select-float :deep(.animal-select-selection) {
  height: 0 !important;
  min-height: 0 !important;
  padding: 0 !important;
  margin: 0 !important;
  border: none !important;
  opacity: 0 !important;
  pointer-events: none !important;
  overflow: hidden !important;
}

/* 确保下拉菜单面板相对当前定位直接顶格显示 */
.ctx-select-float :deep([class*="dropdown"]),
.ctx-select-float :deep(.animal-select-dropdown) {
  position: relative !important;
  top: 0 !important;
  left: 0 !important;
  display: block !important;
  opacity: 1 !important;
  visibility: visible !important;
  transform: none !important;
}
</style>