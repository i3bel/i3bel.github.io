<!-- .vitepress/theme/components/Stamp.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { withBase } from 'vitepress'
import { Tooltip } from 'animal-island-vue'

interface Props {
  src: string
  width?: string
  height?: string
}

const props = withDefaults(defineProps<Props>(), {
  width: '130px',
  height: '180px'
})

const realSrc = computed(() => {
  if (!props.src) return ''
  if (props.src.startsWith('http') || props.src.startsWith('data:')) {
    return props.src
  }
  return withBase(props.src)
})

const stampTitle = computed(() => {
  if (!props.src) return ''
  const fileName = props.src.split('/').pop() || ''
  return fileName.replace(/\.[^/.]+$/, '')
})
</script>

<template>
  <Tooltip 
    :title="stampTitle" 
    variant="default" 
    bordered 
    placement="top"
  >
    <div 
      class="stamp-wrapper"
      :style="{ width: props.width, height: props.height }"
    >
      <!-- 📜 真正带有 100% 干净锯齿的米色底纸 -->
      <div class="stamp-paper-clean">
        <div class="stamp-inner-border">
          <img :src="realSrc" class="stamp-image" :alt="stampTitle" />
        </div>
      </div>
    </div>
  </Tooltip>
</template>

<style scoped>
.stamp-wrapper {
  display: inline-block;
  user-select: none;
  cursor: pointer;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.28));
  transition: filter 0.2s ease;
}

.stamp-wrapper:hover {
  filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.38));
}

/* 📜 米色底纸：使用纯 CSS 锯齿波浪，外扩并消除边缘线 */
.stamp-paper-clean {
  width: 100%;
  height: 100%;
  background-color: #f7f4eb;
  padding: 10px 8px; 
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;

  /* ------------------ 🎯 纯净四周齿孔实现 ------------------ */
  --r: 4px;      /* 齿孔挖空半径 */
  --gap: 11px;   /* 齿孔间距 */

  /* 
    核心修正：利用 radial-gradient 绘制圆孔，
    将圆孔半透明边缘暴露在容器之外，硬生生把外圈 1px 的杂线推出去裁掉！
  */
  --mask-pattern: 
    radial-gradient(circle var(--r) at calc(-1 * var(--r) + 1.5px) 50%, #0000 99%, #000) 0 0 / 100% var(--gap) repeat-y,
    radial-gradient(circle var(--r) at calc(100% + var(--r) - 1.5px) 50%, #0000 99%, #000) 0 0 / 100% var(--gap) repeat-y,
    radial-gradient(circle var(--r) at 50% calc(-1 * var(--r) + 1.5px), #0000 99%, #000) 0 0 / var(--gap) 100% repeat-x,
    radial-gradient(circle var(--r) at 50% calc(100% + var(--r) - 1.5px), #0000 99%, #000) 0 0 / var(--gap) 100% repeat-x;

  mask: var(--mask-pattern);
  mask-composite: intersect;

  -webkit-mask: var(--mask-pattern);
  -webkit-mask-composite: source-in;
}

/* 🔲 细深色描边内框 */
.stamp-inner-border {
  width: 100%;
  height: 100%;
  border: 1.5px solid #2c3e50;
  padding: 2px;
  box-sizing: border-box;
  background-color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

/* 🖼️ 主图展示 */
.stamp-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
</style>