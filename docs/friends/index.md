---
title: Friends
description: 友情链接
lastUpdated: false
layout: page
---

<script setup>
import { Card, Title, Divider, Button, Collapse } from 'animal-island-vue';

const friends = [
  {
    name: 'Wwweinuo',
    avatar: 'https://github.com/wwweinuo.png',
    desc: '',
    url: 'https://wwweinuo.github.io/',
  },
  {
    name: 'Mystic Stars',
    url: 'https://www.mysticstars.cn/',
    desc: '探索无限可能，记录思考、创造与生活。',
    avatar: 'https://www.mysticstars.cn/favicon.svg',
  },
]
</script>

<div class="friends-page">
  <Title color="purple" size="large">花园</Title>
  <Divider type="dashed-brown" style="margin-top: 30px;" />

  <div style="height: 10px;"></div>

  <Card type="dashed" style="margin-bottom: 20px;">
    <div style="display: flex; align-items: center; flex-wrap: wrap; gap: 4px; color: var(--vp-c-text-1);">
      <span>欢迎互加友链，</span>
      <a href="https://github.com/i3bel/i3bel.github.io/issues" target="_blank" rel="noopener" style="text-decoration: none;">
        <Button type="link" style="padding: 0; font-size: inherit;">点击这里</Button>
      </a>
      <span>留言交换。</span>
    </div>
  </Card>

  <div class="friends-grid">
    <component
      v-for="friend in friends"
      :key="friend.name"
      :is="friend.url ? 'a' : 'div'"
      :href="friend.url || undefined"
      :target="friend.url ? '_blank' : undefined"
      :rel="friend.url ? 'noopener' : undefined"
      style="text-decoration: none; display: block;"
    >
      <Card type="default" pattern="default" style="height: 100%;">
        <div style="display: flex; align-items: center; text-align: left; height: 60px; padding: 12px; gap: 12px;">
          <!-- 头像 -->
          <div style="width: 48px; height: 48px; border-radius: 50%; overflow: hidden; flex-shrink: 0;">
            <img v-if="friend.avatar" :src="friend.avatar" :alt="friend.name" style="width: 100%; height: 100%; object-fit: cover;" />
            <span v-else style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; background: var(--vp-c-bg-alt); font-size: 18px; font-weight: 600; color: var(--vp-c-text-2);">
              {{ friend.name[0] }}
            </span>
          </div>
          <!-- 文字信息 -->
          <div style="flex: 1; min-width: 0;">
            <div style="font-weight: 600; color: var(--vp-c-text-1); font-size: 14px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              {{ friend.name }}
            </div>
            <div v-if="friend.desc" style="font-size: 12px; color: var(--vp-c-text-2); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              {{ friend.desc }}
            </div>
            <div v-else style="font-size: 12px; color: var(--vp-c-text-2); opacity: 0.7; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              欢迎互加友链
            </div>
          </div>
        </div>
      </Card>
    </component>
  </div>

  <div style="height: 20px;"></div>

  <Collapse question="「花园」路径？">
    <p>花园 → 大厅、书房、阁楼</p>
  </Collapse>
</div>

<style scoped>
.friends-page {
  /* 1. 顶部固定位置：导航栏高度 + vp-doc 的默认上边距 */
  padding-top: calc(var(--vp-nav-height, 64px) + 32px);
  padding-bottom: 64px;
  
  /* 2. 宽度与居中：设定为 1200px 保证卡片流式网格排布舒展 */
  max-width: 1200px;
  
  /* 3. 水平居中与基础留白 */
  margin-left: auto;
  margin-right: auto;
  padding-left: 32px;
  padding-right: 32px;
  
  box-sizing: border-box;
  width: 100%;
}

/* 侧边栏存在时的平移偏移 */
:global(.has-sidebar) .friends-page {
  margin-left: calc(var(--vp-sidebar-width, 272px) + 32px);
}

/* 友链网格两列自适应布局 */
.friends-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

/* 移动端响应式，恢复默认边距 */
@media (max-width: 960px) {
  .friends-page {
    padding-top: calc(var(--vp-nav-height, 64px) + 16px);
    padding-left: 16px;
    padding-right: 16px;
  }
  
  :global(.has-sidebar) .friends-page {
    margin-left: auto;
  }
}
</style>