<!-- components/flowbg.vue -->
<template>
  <div class="interactive-ascii-bg" aria-hidden="true">
    <div class="bg-flow-layer" />
  </div>
</template>

<style scoped>
.interactive-ascii-bg {
  position: fixed;
  inset: 0;
  z-index: -1;
  overflow: hidden;
  pointer-events: none;
}

.bg-flow-layer {
  position: absolute;
  /* 扩大容器偏移量，防止在较大分辨率屏幕下动画移动时四角露出空白 */
  top: -1000px;
  left: -1000px;
  width: calc(100% + 2000px);
  height: calc(100% + 2000px);
  
  /* 必须确保使用 repeat 平铺 */
  background-image: url('/images/home-bg.webp');
  background-position: center;
  /* 宽度设为 400px，高度根据原图 (1012x2156) 比例自动换算为 852.1739px */
  background-size: 400px auto;
  background-repeat: repeat;

  /* 核心动画：无限循环流动 */
  animation: island-app-bg-flow 120s linear infinite !important;
  will-change: transform;
}

/* 
  无缝关键点：
  贴图宽度 400px，原图 1012x2156 -> 贴图高度 = 400 * (2156 / 1012) ≈ 852.1739px
  将位移终点设为 (-400px, -852.1739px) 即可消除 80 秒动画结束时的重置跳变
*/
@keyframes island-app-bg-flow {
  0% {
    transform: translate3d(0, 0, 0);
  }
  100% {
    transform: translate3d(-400px, -852.1739px, 0);
  }
}
</style>