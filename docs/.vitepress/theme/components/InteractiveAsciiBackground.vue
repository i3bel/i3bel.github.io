<template>
  <div ref="wrapEl" class="ascii-bg-wrap" aria-hidden="true">
    <canvas ref="canvasEl" class="ascii-bg-canvas"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const DENSITY_CHARS = ['#', '*', '+', '=', '-', ':', '.']

const props = defineProps({
  cellSize: { type: Number, default: 14 },
  radius: { type: Number, default: 150 },
  // 文字区域外扩多宽的"羽化"范围，越大过渡越柔和
  textMargin: { type: Number, default: 60 },
  // 需要避开的文字容器选择器，按你自己的页面结构加/改
  protectedSelectors: {
    type: String,
    default: '.vp-doc, .post-list, .VPDocAside, .VPNavBar, .VPSidebar'
  }
})

const wrapEl = ref(null)
const canvasEl = ref(null)

let ctx = null
let dpr = 1
let width = 0
let height = 0
let cols = 0
let rows = 0
let mouseX = -9999
let mouseY = -9999
let rafId = null
let isDark = false
let themeObserver = null
let contentRects = []

const palette = {
  light: { base: '#b08a3e' },
  dark:  { base: '#e8c77a' }
}

function noise2D(x, y) {
  const nx = x * 0.007
  const ny = y * 0.007
  let v = Math.sin(nx * 1.5) * Math.cos(ny * 1.5)
  v += Math.sin(nx * 3.5) * Math.sin(ny * 2.5) * 0.5
  v += Math.cos(nx * 7.0) * Math.cos(ny * 6.0) * 0.2
  return (v + 1.7) / 3.4
}

// 点到矩形的最短距离；点在矩形内部时返回 0（含负数区间也归 0）
function distanceToRect(x, y, rect) {
  const dx = Math.max(rect.left - x, 0, x - rect.right)
  const dy = Math.max(rect.top - y, 0, y - rect.bottom)
  return Math.sqrt(dx * dx + dy * dy)
}

function updateContentRects() {
  const els = document.querySelectorAll(props.protectedSelectors)
  const rects = []
  els.forEach((el) => {
    const r = el.getBoundingClientRect()
    if (r.width > 0 && r.height > 0) rects.push(r)
  })
  contentRects = rects
}

function resize() {
  width = window.innerWidth
  height = window.innerHeight
  dpr = Math.min(window.devicePixelRatio || 1, 2)
  canvasEl.value.width = width * dpr
  canvasEl.value.height = height * dpr
  canvasEl.value.style.width = width + 'px'
  canvasEl.value.style.height = height + 'px'
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  cols = Math.ceil(width / props.cellSize) + 1
  rows = Math.ceil(height / props.cellSize) + 1
}

function draw() {
  updateContentRects() // 每帧刷新，滚动/切页时文字位置变了也能跟上

  const colors = isDark ? palette.dark : palette.light
  ctx.clearRect(0, 0, width, height)
  ctx.font = `${props.cellSize * 0.75}px ui-monospace, Menlo, Consolas, monospace`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = colors.base

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * props.cellSize
      const y = r * props.cellSize

      let baseNoise = noise2D(x, y)
      baseNoise = Math.max(0.1, Math.min(0.9, baseNoise))

      const dx = x - mouseX
      const dy = y - mouseY
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < props.radius) {
        const t = dist / props.radius
        baseNoise -= (1 - t) * 0.5
      }

      let finalHeight = Math.max(0, Math.min(1, baseNoise))

      // ---- 文字区域压制：越靠近/越深入文字，越往"稀疏"方向推，直到完全消失 ----
      let suppress = 0
      for (const rect of contentRects) {
        const d = distanceToRect(x, y, rect)
        if (d <= 0) { suppress = 1; break }
        const s = Math.max(0, 1 - d / props.textMargin)
        if (s > suppress) suppress = s
      }
      if (suppress > 0) {
        finalHeight = finalHeight + suppress * (1 - finalHeight)
      }

      const idx = Math.floor(finalHeight * DENSITY_CHARS.length)
      const char = DENSITY_CHARS[Math.min(DENSITY_CHARS.length - 1, idx)]

      const alpha = (0.3 - finalHeight * 0.46) * (1 - suppress)
      if (alpha <= 0.01) continue // 完全看不见就不画，省性能

      ctx.globalAlpha = alpha
      ctx.fillText(char, x, y)
    }
  }
}

function loop() {
  draw()
  rafId = requestAnimationFrame(loop)
}

function onPointerMove(e) {
  mouseX = e.clientX
  mouseY = e.clientY
}
function onPointerLeave() {
  mouseX = -9999
  mouseY = -9999
}
function updateTheme() {
  isDark = document.documentElement.classList.contains('dark')
}

onMounted(() => {
  ctx = canvasEl.value.getContext('2d')
  updateTheme()
  resize()

  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerleave', onPointerLeave)
  window.addEventListener('resize', resize)

  themeObserver = new MutationObserver(updateTheme)
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

  rafId = requestAnimationFrame(loop)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(rafId)
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerleave', onPointerLeave)
  window.removeEventListener('resize', resize)
  themeObserver?.disconnect()
})
</script>

<style scoped>
.ascii-bg-wrap {
  position: fixed;
  inset: 0;
  z-index: -1;
  overflow: hidden;
}
.ascii-bg-canvas {
  display: block;
  pointer-events: none;
}
</style>