<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useData } from 'vitepress';
import { Notification, NotificationContainer } from 'animal-island-vue';

// ==========================================
// 1. 核心：调用 VitePress 的全局深浅色状态
// ==========================================
const { isDark } = useData();

function toggleTheme() {
  // 修改这个变量，整个 VitePress 网站的亮暗主题都会同步切换
  isDark.value = !isDark.value;
}

// ==========================================
// 2. 时钟逻辑
// ==========================================
const hourRotation = ref(0);
const minuteRotation = ref(0);
const dateText = ref('');
const rootRef = ref<HTMLElement | null>(null);

let clockTimer: any = null;

function updateClock() {
  const now = new Date();
  const s = now.getSeconds() + now.getMilliseconds() / 1000;
  const m = now.getMinutes() + s / 60;
  const h = (now.getHours() % 12) + m / 60;

  minuteRotation.value = m * 6;
  hourRotation.value = h * 30;

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  dateText.value = `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]}`;
}

// ==========================================
// 3. 🧙‍♂️ 隐藏游戏逻辑：【魔力感知试炼】
// ==========================================
const isGameActive = ref(false);
const isWaitingChange = ref(false);
const isTiming = ref(false);

let spacePressCount = 0;
let spacePressTimer: any = null;
let randomTimer: any = null;
let startTime = 0;
let originalThemeDarkState = false;
const bestRecord = ref<number | null>(null);

let bannerHandle: any = null;
let centerHandle: any = null;

function openBanner() {
  bannerHandle = Notification.warning({
    key: 'game-banner',
    message: '魔法使特级测验：魔力感知',
    description: '你触碰了千年魔法使的遗迹术式，试炼已开启。',
    position: 'topLeft',
    duration: 0
  });
}

function closeBanner() {
  try { bannerHandle?.close?.(); } catch (e) { /* noop */ }
  try { (Notification as any)?.close?.('game-banner'); } catch (e) { /* noop */ }
  bannerHandle = null;
}

function closeCenterNotification() {
  try { centerHandle?.close?.(); } catch (e) { /* noop */ }
  try { (Notification as any)?.close?.('game-center'); } catch (e) { /* noop */ }
  centerHandle = null;
}

function openCenterNotification(type: 'info' | 'success' | 'warning' | 'error', options: Record<string, any>) {
  closeCenterNotification();
  centerHandle = (Notification as any)[type]({ key: 'game-center', ...options });
}

function startRound() {
  if (!isGameActive.value) return;

  isWaitingChange.value = true;
  isTiming.value = false;

  openCenterNotification('info', {
    message: '🧙‍♂️ 压抑魔力·静候时机',
    description: '魔力波动正在隐藏……请保持绝对专注，极小缝隙的异变随时到来，此时切勿妄动。',
    duration: 0
  });

  if (typeof window !== 'undefined') {
    window.addEventListener('mousemove', handleEarlyMove);
  }

  const randomDelay = Math.floor(Math.random() * 2500) + 2000;
  randomTimer = setTimeout(() => {
    if (!isGameActive.value) return;

    if (typeof window !== 'undefined') {
      window.removeEventListener('mousemove', handleEarlyMove);
    }

    // 触发全站主题颠倒
    toggleTheme();
    startTime = performance.now();
    isWaitingChange.value = false;
    isTiming.value = true;

    if (typeof window !== 'undefined') {
      window.addEventListener('mousemove', handleMouseMove);
    }
  }, randomDelay);
}

function handleEarlyMove() {
  if (!isWaitingChange.value) return;

  isWaitingChange.value = false;
  if (randomTimer) clearTimeout(randomTimer);
  if (typeof window !== 'undefined') {
    window.removeEventListener('mousemove', handleEarlyMove);
  }

  openCenterNotification('error', {
    message: '⚠️ 魔力暴走·解析失败',
    description: '魔力动摇暴露了你的慌乱……如果是勇者辛美尔的话，绝对会冷静等待吧。按下【空格键】重新凝神。',
    duration: 0
  });
}

function handleMouseMove() {
  if (!isTiming.value) return;

  const endTime = performance.now();
  const reactionTime = Math.round(endTime - startTime);

  isTiming.value = false;
  if (typeof window !== 'undefined') {
    window.removeEventListener('mousemove', handleMouseMove);
  }

  if (bestRecord.value === null || reactionTime < bestRecord.value) {
    bestRecord.value = reactionTime;
  }

  let rank = '🧙‍♀️ 千年魔法使 (神速的魔力捕捉)';
  let desc = '看穿了魔力压制的缝隙！哪怕是赛丽艾也会对你的感知赞不赏口。';

  if (reactionTime > 380) {
    rank = '📦 迷宫宝箱怪 (还在沉睡中)';
    desc = '「有99%的概率是宝箱怪，但万一是真正的魔法呢？」看来你需要多喝点热茶提提神了。';
  } else if (reactionTime > 260) {
    rank = '📜 三级魔法使 (合格的直觉)';
    desc = '不错的反应能力，菲伦也常能在瞬间完成这样的防御术式。';
  } else if (reactionTime > 180) {
    rank = '🗡️ 勇者辛美尔的剑击 (斩断瞬息)';
    desc = '极度敏锐！在魔力变动的瞬间你便斩断了隙缝。';
  }

  openCenterNotification('success', {
    message: `✨ 魔力感知测试完成: ${reactionTime} ms`,
    description: `${rank}\n${desc}\n(历史最快记录: ${bestRecord.value} ms) | 按【空格键】继续旅程。`,
    duration: 0
  });
}

function enterGame() {
  if (isGameActive.value) return;

  isGameActive.value = true;
  originalThemeDarkState = isDark.value;

  openBanner();

  openCenterNotification('info', {
    message: '📜 魔法使的试炼规则',
    description: '按下【空格键】后，昼夜术式将在随机时刻颠倒。在魔力异变前请保持纹丝不动，异变发生的瞬间请立刻划动鼠标！',
    duration: 0
  });

  setTimeout(() => {
    startRound();
  }, 1200);
}

function exitGame() {
  if (!isGameActive.value) return;

  isGameActive.value = false;
  isWaitingChange.value = false;
  isTiming.value = false;

  if (randomTimer) clearTimeout(randomTimer);
  if (typeof window !== 'undefined') {
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mousemove', handleEarlyMove);
  }

  if (isDark.value !== originalThemeDarkState) {
    toggleTheme();
  }

  closeBanner();
  closeCenterNotification();
}

function handleKeyDown(event: KeyboardEvent) {
  if (event.code !== 'Space') return;

  const target = event.target as HTMLElement;
  if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) {
    return;
  }

  event.preventDefault();

  if (isGameActive.value) {
    if (isWaitingChange.value) {
      openCenterNotification('warning', {
        message: '⏳ 保持耐心',
        description: '魔力仍在平稳流动，请像等待花海开放一样耐心凝视……',
        duration: 0
      });
      return;
    }
    if (isTiming.value) return;

    startRound();
    return;
  }

  spacePressCount++;
  if (spacePressTimer) clearTimeout(spacePressTimer);

  spacePressTimer = setTimeout(() => {
    spacePressCount = 0;
  }, 2000);

  if (spacePressCount >= 5) {
    spacePressCount = 0;
    if (spacePressTimer) clearTimeout(spacePressTimer);
    enterGame();
  }
}

onMounted(() => {
  updateClock();
  clockTimer = setInterval(updateClock, 50);
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  if (clockTimer) clearInterval(clockTimer);
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', handleKeyDown);
  }
  if (spacePressTimer) clearTimeout(spacePressTimer);
  exitGame();

  try { Notification.destroy(); } catch (e) { /* noop */ }
});
</script>

<template>
  <ClientOnly>
    <NotificationContainer />
  </ClientOnly>

  <div 
    ref="rootRef" 
    class="cowatch-root" 
    :class="{ light: !isDark }"
  >
    <!-- 时钟主体 (包含背景数字、时针和分针) -->
    <div class="cw-clock-wrap">
      <div class="cw-bg-num" style="left:50%;top:20%;transform:translate(-50%,-50%) rotate(-5deg)">12</div>
      <div class="cw-bg-num" style="left:82%;top:50%;transform:translate(-50%,-50%) rotate(10deg)">3</div>
      <div class="cw-bg-num" style="left:50%;top:82%;transform:translate(-50%,-50%) rotate(9deg)">6</div>
      <div class="cw-bg-num" style="left:18%;top:50%;transform:translate(-50%,-50%) rotate(-6deg)">9</div>
      
      <div class="cw-hand hour" :style="{ transform: `translate(-50%, -80%) rotate(${hourRotation}deg)` }"></div>
      <div class="cw-hand minute" :style="{ transform: `translate(-50%, -80%) rotate(${minuteRotation}deg)` }"></div>
      <div class="cw-center-dot"></div>
    </div>

    <!-- 右下角日期 -->
    <div class="cw-date">{{ dateText }}</div>
  </div>
</template>

<style scoped>
.cowatch-root {
  --fg: #ffffff;
  --fg-dim: rgba(255,255,255,0.55);
  --pill-bg: rgba(255,255,255,0.06);
  --hand-color: #ffffff;
  --num-color: rgba(255,255,255,0.08);

  background: transparent;
  color: var(--fg);
  width: 100%;
  height: 100vh;
  min-height: 600px;
  position: relative;
  overflow: hidden;
  user-select: none;
  transition: color 0.3s ease;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Rounded", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

/* 亮色模式下的时钟线条与字体颜色 */
.cowatch-root.light {
  --fg: #000000;
  --fg-dim: rgba(0,0,0,0.55);
  --pill-bg: rgba(0,0,0,0.05);
  --hand-color: #000000;
  --num-color: rgba(0,0,0,0.08);
  background: transparent;
}

/* Clock */
.cw-clock-wrap {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: min(52vw, calc(100vh - 180px), 720px);
  aspect-ratio: 1 / 1;
  z-index: 10;
}

.cw-bg-num {
  position: absolute;
  font-size: clamp(140px, 36cqw, 300px);
  font-weight: 900;
  letter-spacing: -0.06em;
  line-height: 0.72;
  color: var(--num-color);
  pointer-events: none;
  user-select: none;
}

.cw-hand {
  position: absolute;
  left: 50%;
  top: 50%;
  border-radius: 999px;
  background: var(--hand-color);
  transform-origin: 50% 80%;
  transition: transform 0.05s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
}

.cw-hand.hour {
  width: clamp(16px, 2.2vw, 28px);
  height: 28%;
  z-index: 3;
}

.cw-hand.minute {
  width: clamp(10px, 1.2vw, 16px);
  height: 40%;
  z-index: 4;
}

.cw-center-dot {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 16px;
  height: 16px;
  background: var(--hand-color);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  z-index: 6;
}

/* Date pill */
.cw-date {
  position: absolute;
  bottom: 28px;
  right: 28px;
  background: var(--pill-bg);
  color: var(--fg);
  font-size: 13px;
  font-weight: 600;
  padding: 10px 18px;
  border-radius: 24px;
  z-index: 20;
  backdrop-filter: blur(8px);
}

@media (max-width: 640px) {
  .cw-date { bottom: 16px; right: 16px; }
  .cw-clock-wrap { width: min(80vw, calc(100vh - 240px)); }
}
</style>