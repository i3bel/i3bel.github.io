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
  top: -400px;
  left: -400px;
  width: calc(100% + 800px);
  height: calc(100% + 800px);
  
  /* 必须确保使用 repeat 平铺 */
  background-image: url('/images/home-bg.webp');
  background-position: center;
  background-size: 400px auto;
  background-repeat: repeat;

  /* 核心动画：无限循环流动 */
  animation: island-app-bg-flow 80s linear infinite !important;
  will-change: transform;
}

/* 保证 keyframes 在当前组件样式中生效 */
@keyframes island-app-bg-flow {
  0% {
    transform: translate3d(0, 0, 0);
  }
  100% {
    transform: translate3d(-400px, -400px, 0);
  }
}
</style>