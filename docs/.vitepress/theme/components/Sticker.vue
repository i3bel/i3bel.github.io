<!-- .vitepress/theme/components/Sticker.vue -->
<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, useId, nextTick, computed } from 'vue'

const props = withDefaults(defineProps<{
  // 模式切换
  type?: 'image' | 'text'
  src?: string

  // 文字贴纸专属配置
  text?: string
  bgColor?: string
  textColor?: string
  showIcon?: boolean
  fontSize?: number
  useSnakeFont?: boolean

  // 描边控制
  outlineWidth?: number
  outlineColor?: string

  // 尺寸与定位
  // width/height 是"最大边界框"(max box)，真实渲染尺寸会按内容自然比例 contain 缩放得出
  width?: number
  height?: number
  top?: string
  left?: string
  right?: string
  bottom?: string
  rotate?: number
  zIndex?: number

  // 👇 点击穿透相关：只有贴纸"轮廓边缘附近的一圈窄带"才拦截点击，
  //    贴纸内部主体（哪怕不透明）和外部空白区域一律穿透给下面的元素
  hitTestAlpha?: boolean
  // 透明度判定阈值 0-255，越大越严格（默认 15，过滤掉抗锯齿的极淡边缘像素）
  alphaThreshold?: number
  // 边缘可交互带宽度（css px）。建议和下面 peel.grabWidth 保持一致，默认 30
  edgeBandWidth?: number
}>(), {
  type: 'text',
  bgColor: '#FFB800',
  textColor: '#3D1C00',
  showIcon: false,
  fontSize: 24,
  useSnakeFont: false,
  outlineColor: '#ffffff',
  width: 220,
  height: 180,
  rotate: -2,
  zIndex: 10,
  hitTestAlpha: true,
  alphaThreshold: 15,
  edgeBandWidth: 30
})

const stickerId = useId()
const stickerRef = ref<HTMLElement | null>(null)

// 响应式保存计算出来的贴纸真实尺寸（文字模式 / 图片模式都会用到）
const autoSize = ref<{ width: number; height: number } | null>(null)

function generateTextStickerSVG(): { src: string; width: number; height: number } {
  const defaultText = "旅途的起点\n也是歇息的营地\n右键轻点\n开启魔法扉页"
  const textContent = props.text || defaultText
  const lines = textContent.split('\n')

  const maxLineLength = Math.max(...lines.map(line => line.length))

  const fontSize = props.fontSize
  const lineHeight = Math.round(fontSize * 1.4)

  const paddingX = 24
  const paddingY = 20
  const topTabHeight = 18

  const viewWidth = Math.max(180, maxLineLength * (fontSize * 0.8) + paddingX * 2)
  const viewHeight = Math.max(120, lines.length * lineHeight + paddingY * 2) + topTabHeight

  const startY = topTabHeight + (viewHeight - topTabHeight) / 2 - ((lines.length - 1) * lineHeight) / 2
  const centerX = viewWidth / 2

  const textSpans = lines.map((line, index) => {
    return `<tspan x="${centerX}" y="${startY + index * lineHeight}">${line}</tspan>`
  }).join('')

  const tabWidth = Math.max(80, viewWidth * 0.35)
  const tabHalf = tabWidth / 2
  const tabR = 6
  const cornerR = 16

  const pathD = `
    M ${centerX - tabHalf} ${topTabHeight}
    V ${tabR}
    A ${tabR} ${tabR} 0 0 1 ${centerX - tabHalf + tabR} 0
    H ${centerX + tabHalf - tabR}
    A ${tabR} ${tabR} 0 0 1 ${centerX + tabHalf} ${tabR}
    V ${topTabHeight}
    H ${viewWidth - cornerR}
    A ${cornerR} ${cornerR} 0 0 1 ${viewWidth} ${topTabHeight + cornerR}
    V ${viewHeight - cornerR}
    A ${cornerR} ${cornerR} 0 0 1 ${viewWidth - cornerR} ${viewHeight}
    H ${cornerR}
    A ${cornerR} ${cornerR} 0 0 1 0 ${viewHeight - cornerR}
    V ${topTabHeight + cornerR}
    A ${cornerR} ${cornerR} 0 0 1 ${cornerR} ${topTabHeight}
    Z
  `.replace(/\s+/g, ' ').trim()

  const origin = typeof window !== 'undefined' ? window.location.origin : ''

  const fontDefStyle = props.useSnakeFont ? `
    <style>
      @font-face {
        font-family: 'SnakeCustomFont';
        src: url('${origin}/fonts/Snake-Regular.ttf') format('truetype');
        font-weight: normal;
        font-style: normal;
      }
      .sticker-text {
        font-family: 'SnakeCustomFont', cursive, sans-serif;
      }
    </style>
  ` : `
    <style>
      .sticker-text {
        font-family: system-ui, -apple-system, sans-serif;
      }
    </style>
  `

  const svgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewWidth} ${viewHeight}" width="${viewWidth}" height="${viewHeight}">
      <defs>
        ${fontDefStyle}
      </defs>
      <path d="${pathD}" fill="${props.bgColor}" />
      <text fill="${props.textColor}" class="sticker-text" font-size="${fontSize}" font-weight="800" text-anchor="middle" dominant-baseline="middle">
        ${textSpans}
      </text>
    </svg>
  `.trim()

  return {
    src: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgContent)}`,
    width: viewWidth,
    height: viewHeight
  }
}

function loadImageNaturalSize(src: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight })
    img.onerror = reject
    img.src = src
  })
}

function fitContain(naturalW: number, naturalH: number, maxW: number, maxH: number) {
  if (!naturalW || !naturalH) return { width: maxW, height: maxH }
  const scale = Math.min(maxW / naturalW, maxH / naturalH)
  return {
    width: Math.round(naturalW * scale),
    height: Math.round(naturalH * scale)
  }
}

const finalWidth = computed(() => {
  return autoSize.value ? autoSize.value.width + 'px' : props.width + 'px'
})

const finalHeight = computed(() => {
  return autoSize.value ? autoSize.value.height + 'px' : props.height + 'px'
})

// ============ 透明区域点击穿透：alpha 采样 ============
let alphaData: Uint8ClampedArray | null = null
let alphaW = 0
let alphaH = 0
let isInteracting = false // 正在撕/拖拽中，此时不做透明度判定，避免中途穿帮

// 用一张缩小的离屏 canvas 采样透明度，足够判断"这一点是否有内容"，不需要原图分辨率
async function buildAlphaMap(src: string) {
  alphaData = null
  return new Promise<void>((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      try {
        const maxDim = 64
        const scale = Math.min(1, maxDim / Math.max(img.naturalWidth, img.naturalHeight))
        alphaW = Math.max(1, Math.round(img.naturalWidth * scale))
        alphaH = Math.max(1, Math.round(img.naturalHeight * scale))
        const canvas = document.createElement('canvas')
        canvas.width = alphaW
        canvas.height = alphaH
        const ctx = canvas.getContext('2d')
        if (!ctx) return resolve()
        ctx.drawImage(img, 0, 0, alphaW, alphaH)
        alphaData = ctx.getImageData(0, 0, alphaW, alphaH).data
      } catch (err) {
        // 跨域图片没有 CORS 头时，画布会被污染、读不出像素
        // 这种情况下无法做透明度检测，退化为"整个框都可点击"（即原来的行为）
        console.warn('[Sticker] 无法读取像素透明度（可能是跨域图片缺少 CORS 头），该贴纸将退化为整框可交互:', src, err)
        alphaData = null
      }
      resolve()
    }
    img.onerror = () => resolve()
    img.src = src
  })
}

function sampleAlpha(clientX: number, clientY: number, rect: DOMRect): number | null {
  if (!alphaData) return null
  const nx = (clientX - rect.left) / rect.width
  const ny = (clientY - rect.top) / rect.height
  if (nx < 0 || nx > 1 || ny < 0 || ny > 1) return null
  const px = Math.min(alphaW - 1, Math.floor(nx * alphaW))
  const py = Math.min(alphaH - 1, Math.floor(ny * alphaH))
  const idx = (py * alphaW + px) * 4 + 3
  return alphaData[idx]
}

function handlePointerMove(e: PointerEvent) {
  const el = stickerRef.value
  if (!el || !props.hitTestAlpha) return
  if (isInteracting) return // 撕纸/拖拽过程中，保持 auto，不做透明度判定

  const rect = el.getBoundingClientRect()
  const inBox =
    e.clientX >= rect.left && e.clientX <= rect.right &&
    e.clientY >= rect.top && e.clientY <= rect.bottom

  if (!inBox) {
    el.style.pointerEvents = 'none'
    return
  }

  const alpha = sampleAlpha(e.clientX, e.clientY, rect)
  // alpha === null 说明采样失败（跨域等），保底按可交互处理，避免贴纸完全失灵
  const shouldIntercept = alpha === null ? true : alpha > props.alphaThreshold
  el.style.pointerEvents = shouldIntercept ? 'auto' : 'none'
}

function handlePointerDown() {
  isInteracting = true
}

function handlePointerUp() {
  isInteracting = false
}

onMounted(async () => {
  if (!customElements.get('sticker-forge')) {
    await new Promise<void>((resolve, reject) => {
      if (document.getElementById('sticker-forge-script')) return resolve()
      const script = document.createElement('script')
      script.id = 'sticker-forge-script'
      script.type = 'module'
      script.src = 'https://sticker.oooo.so/embed/sticker-forge.es.js'
      script.onload = () => resolve()
      script.onerror = reject
      document.head.appendChild(script)
    })
  }

  await customElements.whenDefined('sticker-forge')

  let sourceSrc = props.src || ''

  if (props.type === 'text') {
    const svgData = generateTextStickerSVG()
    sourceSrc = svgData.src
    autoSize.value = { width: svgData.width, height: svgData.height }
  } else if (props.type === 'image' && props.src) {
    try {
      const natural = await loadImageNaturalSize(props.src)
      autoSize.value = fitContain(natural.width, natural.height, props.width, props.height)
    } catch (err) {
      console.warn('[Sticker] 图片加载失败，回退使用传入的 width/height:', props.src, err)
      autoSize.value = null
    }
  }

  await nextTick()

  const sticker = stickerRef.value
  if (sticker) {
    await sticker.setSource({
      type: 'image',
      src: sourceSrc,
      name: props.text || 'CustomSticker'
    })

    const finalOutlineWidth = props.outlineWidth ?? (props.type === 'image' ? 12 : 0)

    sticker.setOptions({
      outline: {
        width: finalOutlineWidth,
        color: props.outlineColor
      },
      shadow: { opacity: 0.2, blur: 14, distance: 8, angle: 45, color: '#000000' },
      peel: {
        radius: 0.12,
        stiffness: 0.75,
        grabWidth: 30,
        maxAngle: 3.55,
        release: 'snap'
      },
      sound: { enabled: true, volume: 0.4 },
      back: { color: props.type === 'text' ? '#E0A000' : '#ffffff', gloss: 0.4, roughness: 0.4 },
      tilt: props.rotate,
      wind: 0.1,
      quality: 'high'
    })

    setTimeout(() => {
      if (typeof sticker.resize === 'function') {
        sticker.resize()
      }
    }, 100)
  }

  // 初始化透明度采样 + 挂载全局指针事件监听（做点击穿透判定）
  if (props.hitTestAlpha) {
    await buildAlphaMap(sourceSrc)
    if (stickerRef.value) {
      stickerRef.value.style.pointerEvents = 'none' // 默认不拦截，等 pointermove 判定后再切换
      stickerRef.value.addEventListener('pointerdown', handlePointerDown)
    }
    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    window.addEventListener('pointerup', handlePointerUp, { passive: true })
    window.addEventListener('pointercancel', handlePointerUp, { passive: true })
  }
})

onBeforeUnmount(() => {
  if (stickerRef.value) {
    stickerRef.value.removeEventListener('pointerdown', handlePointerDown)
  }
  window.removeEventListener('pointermove', handlePointerMove)
  window.removeEventListener('pointerup', handlePointerUp)
  window.removeEventListener('pointercancel', handlePointerUp)
})
</script>

<template>
  <sticker-forge
    ref="stickerRef"
    :id="stickerId"
    class="interactive-sticker"
    :style="{
      top: props.top,
      left: props.left,
      right: props.right,
      bottom: props.bottom,
      width: finalWidth,
      height: finalHeight,
      zIndex: props.zIndex
    }"
  ></sticker-forge>
</template>

<style scoped>
.interactive-sticker {
  position: absolute;
  display: block;
  /* 不再用 !important 强制 auto：默认不拦截点击，
     是否可交互由 JS 根据鼠标位置的像素透明度动态切换 */
  pointer-events: none;
  cursor: grab;
}

.interactive-sticker:active {
  cursor: grabbing;
}
</style>