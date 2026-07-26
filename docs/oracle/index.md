---
title: oracle
layout: page
---

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useData } from 'vitepress';
import { data as rawPosts } from '../blog/posts.data.ts';
import { 
  Title, Divider, Button, Collapse, Table, Tag, 
  Notification, NotificationContainer 
} from 'animal-island-vue';
import type { TableColumn } from 'animal-island-vue';

// VitePress 官方的深色模式状态（和右上角默认主题切换按钮共用同一个状态）
const { isDark } = useData();

// ==========================================
// 1. 数据解析与处理
// ==========================================

const tagColors = [
  'app-pink', 'purple', 'app-blue', 'app-yellow', 'app-orange', 
  'app-teal', 'app-green', 'app-red', 'lime-green', 'yellow-green', 
  'brown', 'warm-peach-pink'
] as const;

function getTagColor(tagText: string) {
  if (!tagText || tagText === '待分类') return 'default';
  let hash = 0;
  for (let i = 0; i < tagText.length; i++) {
    hash = tagText.charCodeAt(i) + ((hash << 5) - hash);
  }
  return tagColors[Math.abs(hash) % tagColors.length];
}

// 确保 posts 安全
const posts = computed(() => Array.isArray(rawPosts) ? rawPosts : []);

// 过滤 Oracle 文章
const oraclePosts = computed(() => {
  return posts.value
    .filter((post: any) => post && (post.oracle === true || post.oracle === 'yes' || post.oracle === 'true'))
    .sort((a: any, b: any) => (b.date || '').localeCompare(a.date || ''));
});

// 计算属性：文章数
const totalCount = computed(() => oraclePosts.value.length);

// 映射 Table 所需数据
const tableData = computed(() => {
  return oraclePosts.value.map((item: any, index: number) => {
    let firstTag = '待分类';
    if (Array.isArray(item.tags) && item.tags.length > 0) {
      firstTag = item.tags[0];
    } else if (typeof item.tags === 'string' && item.tags.trim() !== '') {
      firstTag = item.tags;
    }

    return {
      key: item.url || index,
      date: item.date ? String(item.date).slice(0, 10) : '',
      title: item.title || '无标题',
      url: item.url || '#',
      tag: firstTag,
      tagColor: getTagColor(firstTag)
    };
  });
});

const columns: TableColumn[] = [
  { title: '日期', dataIndex: 'date', width: 120 },
  { title: '标题', dataIndex: 'title' },
  { title: 'Tag', dataIndex: 'tag', width: 140, align: 'center' },
];

const striped = ref(true);

function toggleTheme() {
  isDark.value = !isDark.value;
}

// ==========================================
// 2. 🔮 隐藏副本：【占卜室·水银之镜】
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

// --------------------------------------------
// 通知句柄管理：左上角「已进入副本」横幅 与 中间状态通知 各自独立生命周期
// 不再使用 Notification.destroy()（会把所有通知一起清掉）
// --------------------------------------------
let bannerHandle: any = null;
let centerHandle: any = null;

function openBanner() {
  bannerHandle = Notification.warning({
    key: 'game-banner',
    message: ' 魔法使特级测验：魔力感知',
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

function openCenterNotification(type: 'info' | 'success' | 'warning', options: Record<string, any>) {
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
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', handleKeyDown);
  }
  if (spacePressTimer) clearTimeout(spacePressTimer);
  exitGame();

  // 离开 oracle 页面时，统一清空所有通知（此时不会误伤其他页面）
  try { Notification.destroy(); } catch (e) { /* noop */ }
});
</script>

<ClientOnly>
  <NotificationContainer />
</ClientOnly>

<div class="archives-page">
  <Title color="purple" size="large">占卜室</Title>
  <Divider type="dashed-brown" style="margin-top: 30px;" />

  <div style="height: 10px;"></div>

  <Button type="default" danger style="margin-top: 10px; margin-bottom: 20px; margin-right: 12px;">
    {{ totalCount }} 文章
  </Button>

  
  
  <Table :columns="columns" :data-source="tableData" :striped="striped">
    <!-- 标题列：渲染为可点击链接 -->
    <template #cell-title="{ value, record }">
      <a :href="record?.url || '#'" class="table-title-link">
        {{ value }}
      </a>
    </template>
    <template #title="{ value, record }">
      <a :href="record?.url || '#'" class="table-title-link">
        {{ value }}
      </a>
    </template>
    <!-- Tag 列：使用动态绑定计算出的彩色组件 -->
    <template #cell-tag="{ value, record }">
      <Tag size="small" :color="record?.tagColor || getTagColor(value)">{{ value }}</Tag>
    </template>
    <template #tag="{ value, record }">
      <Tag size="small" :color="record?.tagColor || getTagColor(value)">{{ value }}</Tag>
    </template>
  </Table>

  <div style="height: 20px;"></div>

  <Collapse question="「占卜室」路径？">
    <p>占卜室 → 大厅、索引室</p>
  </Collapse>
</div>

<style scoped>
.archives-page {
  padding-top: calc(var(--vp-nav-height, 64px) + 32px);
  padding-bottom: 64px;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  padding-left: 32px;
  padding-right: 32px;
  box-sizing: border-box;
  width: 100%;
}

:global(.has-sidebar) .archives-page {
  margin-left: calc(var(--vp-sidebar-width, 272px) + 32px);
}

.table-title-link {
  text-decoration: none;
  color: var(--vp-c-text-1, #333);
  font-weight: 500;
  transition: color 0.15s ease;
}

.table-title-link:hover {
  color: var(--vp-c-brand-1, #19c8b9);
}

@media (max-width: 960px) {
  .archives-page {
    padding-top: calc(var(--vp-nav-height, 64px) + 16px);
    padding-left: 16px;
    padding-right: 16px;
  }
  
  :global(.has-sidebar) .archives-page {
    margin-left: auto;
  }
}

:deep(.animal-table) {
  border: none !important;
}
</style>