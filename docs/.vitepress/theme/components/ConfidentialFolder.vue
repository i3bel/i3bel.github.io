<!-- .vitepress/theme/components/ConfidentialFolder.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import Stamp from './Stamp.vue'
import { useAutoStamps, type StampData } from '../utils/useStamps'

interface Props {
  title?: string
  subtitle?: string
  folderName?: string // 🎯 指定读取 public/stamp/ 下哪个子文件夹名称
  top?: string
  left?: string
  right?: string
  bottom?: string
  rotate?: number
  zIndex?: number
  stamps?: StampData[] // 可选：如果不传，将根据 folderName 或 title 自动匹配
}

const props = withDefaults(defineProps<Props>(), {
  title: 'CLASSIFIED',
  subtitle: '',
  rotate: -3,
  zIndex: 10
})

// 自动扫描 public/stamp 下按子文件夹分类的图片列表
const { folders } = useAutoStamps()

// 🎯 计算当前文件夹最终需要展示的邮票列表
const displayStamps = computed<StampData[]>(() => {
  // 1. 如果显式传递了 stamps，直接使用
  if (props.stamps && props.stamps.length > 0) {
    return props.stamps
  }

  if (folders.value.length === 0) return []

  // 2. 根据 folderName 或 title 尝试在自动扫描的文件夹中精确匹配
  const targetName = props.folderName || props.title
  const matched = folders.value.find((f) => f.name === targetName)

  if (matched) {
    return matched.stamps
  }

  // 3. 如果没匹配到（例如 title 传了英文 "CLASSIFIED"），默认返回第一个子文件夹里的图片
  return folders.value[0]?.stamps || []
})

const isOpen = ref(false)
const toggleFolder = () => {
  isOpen.value = !isOpen.value
}
</script>

<template>
  <div 
    class="folder-sticker-wrapper"
    :style="{
      top: top,
      left: left,
      right: right,
      bottom: bottom,
      transform: `rotate(${rotate}deg)`,
      zIndex: zIndex
    }"
  >
    <div 
      class="folder-scene" 
      :class="{ 'is-open': isOpen }" 
      @click="toggleFolder"
    >
      <div class="folder-container">
        
        <!-- 1. 文件夹底座/后盖 -->
        <div class="folder-back"></div>

        <!-- 2. 邮票展示区：渲染自动匹配到的 Stamp 列表 -->
        <div class="folder-stamps-rack">
          <div 
            v-for="(item, index) in displayStamps" 
            :key="item.src + index"
            class="stamp-slot"
            :style="{
              // 未展开状态：自动读取/计算的歪斜角度与 Y 位移
              '--init-rot': `${item.initRotate ?? -8}deg`,
              '--init-y': `${item.initY ?? 8}px`,
              
              // 展开状态：按顺序横向依次排开，每张相距 140px（适配 170px 宽度的 Stamp）
              '--target-x': `${(index + 1) * 140}px`,

              // 展开延迟（从左到右）
              '--open-delay': `${0.08 + index * 0.08}s`,
              // 收回延迟（从右到左倒序原路返回）
              '--close-delay': `${(displayStamps.length - 1 - index) * 0.06}s`
            }"
          >
            <!-- 使用 Stamp.vue 渲染具体图片 -->
            <Stamp :src="item.src" width="170px" height="220px" />
          </div>
        </div>

        <!-- 3. 文件夹前盖 (侧翻 45 度) -->
        <div class="folder-front">
          <div class="folder-label-box">
            <span class="confidential-tag">CONFIDENTIAL</span>
            <h3 class="folder-main-title">{{ title }}</h3>
            <p class="folder-sub-title">
              {{ subtitle || `${displayStamps.length} Stamps` }}
            </p>
          </div>
          <div class="folder-lines">
            <i></i><i></i><i></i>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.folder-sticker-wrapper {
  position: absolute;
  user-select: none;
}

.folder-scene {
  display: flex;
  align-items: center;
  perspective: 1400px;
  cursor: pointer;
}

.folder-container {
  position: relative;
  width: 190px;
  height: 250px;
  transform-style: preserve-3d;
}

/* 1. 后盖 */
.folder-back {
  position: absolute;
  inset: 0;
  background: #e2c074;
  border-radius: 6px 12px 12px 6px;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.12);
  z-index: 1;
}

/* 2. 邮票卡槽 & 对称动效 */
.folder-stamps-rack {
  position: absolute;
  top: 15px;
  left: 15px;
  z-index: 2;
  display: flex;
  align-items: center;
}

.stamp-slot {
  position: absolute;
  left: 0;
  top: 0;
  opacity: 0;
  
  /* 📦 初始/收回姿态：在文件夹深处歪斜、微缩放 */
  transform: translate3d(-10px, var(--init-y), 0) rotate(var(--init-rot)) scale(0.75);
  
  /* 🔄 原路收回时的倒序动画 */
  transition: 
    transform 0.48s cubic-bezier(0.4, 0, 0.2, 1) var(--close-delay),
    opacity 0.35s ease var(--close-delay);
  will-change: transform, opacity;
  pointer-events: none;
}

/* 🚀 展开状态：横向等间距水平排开 (rotate 0deg) */
.folder-scene.is-open .stamp-slot {
  opacity: 1;
  transform: translate3d(var(--target-x), 0, 0) rotate(0deg) scale(1);
  
  /* ✨ 展开时的正序微弹簧动画 */
  transition: 
    transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) var(--open-delay),
    opacity 0.35s ease var(--open-delay);
  pointer-events: auto;
}

/* 单张悬停效果 */
.folder-scene.is-open .stamp-slot:hover {
  transform: translate3d(var(--target-x), -10px, 0) rotate(0deg) scale(1.08) !important;
  transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1) !important;
  z-index: 20;
}

/* 3. 前盖 (侧翻 45 度) */
.folder-front {
  position: absolute;
  inset: 0;
  background: #f4d07e;
  border-radius: 6px 12px 12px 6px;
  z-index: 5;
  transform-origin: left center;
  
  transition: 
    transform 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.08s,
    box-shadow 0.5s ease 0.08s;
  will-change: transform, box-shadow;
  box-shadow: inset -3px 0 10px rgba(0, 0, 0, 0.05), 5px 5px 18px rgba(0, 0, 0, 0.12);
  padding: 22px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-left: 5px solid #d4ad53;
}

.folder-scene.is-open .folder-front {
  transform: rotateY(-45deg);
  transition: 
    transform 0.55s cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow 0.55s ease;
  box-shadow: 16px 14px 28px rgba(0, 0, 0, 0.2);
}

.confidential-tag {
  display: inline-block;
  font-size: 9px;
  font-weight: 800;
  color: #d33a3a;
  border: 1.5px solid #d33a3a;
  padding: 1px 5px;
  border-radius: 2px;
  letter-spacing: 1px;
  transform: rotate(-4deg);
}

.folder-main-title {
  font-size: 15px;
  font-weight: bold;
  color: #4a3812;
  margin: 10px 0 2px 0;
}

.folder-sub-title {
  font-size: 10px;
  color: #8c7339;
  margin: 0;
}

.folder-lines {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.folder-lines i {
  display: block;
  height: 2px;
  background: #e6bf65;
  width: 100%;
}

.folder-lines i:last-child {
  width: 55%;
}
</style>