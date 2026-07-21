<!-- docs/.vitepress/theme/components/ZMenu.vue -->
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, nextTick } from 'vue'
import { useRouter, useRoute } from 'vitepress'
import { Select } from 'animal-island-vue'

const router = useRouter()
const route = useRoute()

const visible = ref(false)
const pos = ref({ x: 0, y: 0 })
const mouse = ref({ x: 0, y: 0 })
const selectValue = ref('')
const containerRef = ref<HTMLElement | null>(null)

// 按路由路径前缀匹配菜单内容，不同页面弹出不同选项
const menuMap: Record<string, { key: string; label: string; target: string }[]> = {
  '/garden/': [
    { key: 'hall', label: '大厅', target: '/' },
    { key: 'archives', label: '档案室', target: '/archives/' },
    { key: 'blog', label: '博客', target: '/blog/' },
  ],
  // 其他页面需要这个功能就继续往这加一组
}

function matchedKey() {
  return Object.keys(menuMap).find(p => route.path.startsWith(p))
}

const currentOptions = computed(() => {
  const m = matchedKey()
  return m ? menuMap[m].map(o => ({ key: o.key, label: o.label })) : []
})

function onMouseMove(e: MouseEvent) {
  mouse.value = { x: e.clientX, y: e.clientY }
}

function onKeydown(e: KeyboardEvent) {
  const tag = (e.target as HTMLElement)?.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA') return   // 避免打字时误触发
  if (e.key.toLowerCase() !== 'z' || e.metaKey || e.ctrlKey || e.altKey) return
  if (currentOptions.value.length === 0) return        // 当前页面没配置菜单就不弹

  pos.value = { ...mouse.value }
  visible.value = true
  selectValue.value = ''

  nextTick(() => {
    // Select 没开放编程式展开接口，模拟点击它内部的真实触发元素来强制展开
    const trigger = containerRef.value?.querySelector('.animal-select__trigger') as HTMLElement
    trigger?.click()
  })
}

function onDocClick(e: MouseEvent) {
  if (visible.value && containerRef.value && !containerRef.value.contains(e.target as Node)) {
    visible.value = false
  }
}

function onSelectChange(key: string) {
  const m = matchedKey()
  const target = m ? menuMap[m].find(o => o.key === key)?.target : undefined
  visible.value = false
  if (target) router.go(target)
}

onMounted(() => {
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('keydown', onKeydown)
  window.addEventListener('click', onDocClick, true)
})
onBeforeUnmount(() => {
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('click', onDocClick, true)
})
</script>

<template>
  <div
    v-if="visible"
    ref="containerRef"
    class="z-menu-float"
    :style="{ left: pos.x + 'px', top: pos.y + 'px' }"
  >
    <Select
      v-model="selectValue"
      :options="currentOptions"
      placeholder="选择跳转..."
      @change="onSelectChange"
    />
  </div>
</template>

<style scoped>
.z-menu-float {
  position: fixed;
  z-index: 999;
  transform: translate(-8px, -8px);
}
</style>