<!-- .vitepress/theme/components/Sticker.vue -->
<script setup lang="ts">
import { onMounted, ref, useId, nextTick } from 'vue'

const props = withDefaults(defineProps<{
  // 模式切换
  type?: 'image' | 'text'
  src?: string          // 图片模式时的图片地址

  // 文字贴纸专属配置
  text?: string         
  bgColor?: string      
  textColor?: string    
  showIcon?: boolean    
  fontSize?: number

  // ===== 描边控制 =====
  outlineWidth?: number  // 描边宽度（单位：像素），默认：图片模式 12px，文字模式 0px
  outlineColor?: string  // 描边颜色，默认 '#ffffff'

  // 尺寸与定位
  width?: number        
  height?: number       
  top?: string
  left?: string
  right?: string
  bottom?: string
  rotate?: number       
  zIndex?: number
}>(), {
  type: 'text',
  bgColor: '#FFB800',
  textColor: '#3D1C00',
  showIcon: false,       // 👈 默认不显示图标
  fontSize: 24,
  outlineColor: '#ffffff', // 默认白色描边
  width: 220,
  height: 180,
  rotate: -2,
  zIndex: 10
})

const stickerId = useId()
const stickerRef = ref<any>(null)

// 根据文字内容自适应生成动态 1:1 SVG
// 根据文字内容自适应生成动态 1:1 SVG
function generateTextStickerSVG(): string {
  const defaultText = "旅途的起点\n也是歇息的营地\n右键轻点\n开启魔法扉页"
  const textContent = props.text || defaultText
  const lines = textContent.split('\n')

  const maxLineLength = Math.max(...lines.map(line => line.length))
  
  // 🎯 使用传入的字号大小
  const fontSize = props.fontSize
  const lineHeight = Math.round(fontSize * 1.5) // 行高跟随字号自适应
  
  const paddingX = 48
  const paddingY = 36
  const topTabHeight = 24 
  
  const calcWidth = Math.max(260, maxLineLength * (fontSize * 0.7) + paddingX * 2)
  const calcHeight = Math.max(160, lines.length * lineHeight + paddingY * 2)
  
  const viewWidth = calcWidth
  const viewHeight = calcHeight + topTabHeight

  const startY = topTabHeight + (calcHeight / 2) - ((lines.length - 1) * lineHeight) / 2
  const centerX = viewWidth / 2

  const textSpans = lines.map((line, index) => {
    return `<tspan x="${centerX}" y="${startY + index * lineHeight}">${line}</tspan>`
  }).join('')

  const tabWidth = Math.max(100, viewWidth * 0.4) 
  const tabHalf = tabWidth / 2
  const tabR = 8    
  const cornerR = 20 

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

  const svgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewWidth} ${viewHeight}" width="${viewWidth}" height="${viewHeight}">
      <path d="${pathD}" fill="${props.bgColor}" />
      <text fill="${props.textColor}" font-family="system-ui, -apple-system, sans-serif" font-size="${fontSize}" font-weight="800" text-anchor="middle" dominant-baseline="middle">
        ${textSpans}
      </text>
    </svg>
  `.trim()

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgContent)}`
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
  await nextTick()
  const sticker = stickerRef.value

  if (sticker) {
    const sourceSrc = props.type === 'text' ? generateTextStickerSVG() : (props.src || '')

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
      width: props.width + 'px',
      height: props.height + 'px',
      zIndex: props.zIndex
    }"
  ></sticker-forge>
</template>

<style scoped>
.interactive-sticker {
  position: absolute;
  display: block;
  pointer-events: auto !important;
  cursor: grab;
}

.interactive-sticker:active {
  cursor: grabbing;
}
</style>