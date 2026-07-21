---
title: 猜你想找
layout: page
---

<script setup lang="ts">
import { ref } from 'vue';
import { Card, Title, Divider, Button, Collapse, Table } from 'animal-island-vue';
import type { TableColumn } from 'animal-island-vue';

const favorites = [
  {
    title: 'CS2 一键静音切换：将 M 键设为音量开关',
    url: '/blog/2026/CS2 一键静音切换：将 M 键设为音量开关',
    date: '2026-06-20',
    tag: '游戏', // 预留 Tag 字段
  },
  {
    title: '终端代理完全指南：HTTP-SOCKS5 端口代理与 Git 代理配置速查手册',
    url: '/blog/2026/终端代理完全指南：HTTP-SOCKS5 端口代理与 Git 代理配置速查手册',
    date: '2026-07-03',
    tag: '代理',
  },
  {
    title: '愿望购物清单',
    url: '/blog/2027/愿望购物清单',
    date: '2030-07-03',
    tag: '购物',
  },
]

const totalCount = favorites.length

// 按日期倒序排序
favorites.sort((a, b) => b.date.localeCompare(a.date))

// 转换为 Table 数据格式
const tableData = favorites.map((item, index) => ({
  key: index,
  date: item.date,
  title: item.title,
  url: item.url,
  tag: item.tag || '待分类',
}))

const columns: TableColumn[] = [
  { title: '日期', dataIndex: 'date', width: 120 },
  { title: '标题', dataIndex: 'title' },
  { title: 'Tag', dataIndex: 'tag', width: 100, align: 'center' },
]

const striped = ref(true)
</script>

<div class="archives-page">
  <Title color="purple" size="large">占卜室</Title>
  <Divider type="dashed-brown" style="margin-top: 30px;" />

  <div style="height: 10px;"></div>

  <Button type="default"  danger style="margin-top: 10px; margin-bottom: 20px;">
  {{ totalCount }} 文章
</Button>
  
  <Table :columns="columns" :data-source="tableData" :striped="striped">
    <!-- 标题列：渲染为可点击链接 -->
    <template #cell-title="{ value, record }">
      <a :href="record.url" style="text-decoration: none; color: #333;">
        {{ value }}
      </a>
    </template>
    <!-- Tag 列：占位，后续完善 -->
    <template #cell-tag="{ value }">
      <span :style="{
        padding: '2px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        color: '#999',
        background: '#f0f0f0',
        display: 'inline-block',
      }">
        {{ value }}
      </span>
    </template>
  </Table>

  <div style="height: 20px;"></div>

  <Collapse question="「占卜室」路径？">
  <p>  占卜室 → 大厅、索引室、瞭望塔</p>
</Collapse>
</div>

<style scoped>
.archives-page {
  /* 1. 顶部固定位置：导航栏高度 + vp-doc 的默认上边距 */
  padding-top: calc(var(--vp-nav-height, 64px) + 32px);
  
  /* 2. 宽度与居中（与 .content-container 的最大宽度保持一致，一般为 688px 或 720px） */
  max-width: 1200px;
  
  /* 3. 左侧与右侧位置：如果页面有侧边栏，左侧向右平移 Sidebar 的宽度 */
  margin-left: auto;
  margin-right: auto;
  padding-left: 32px;
  padding-right: 32px;
  
  box-sizing: border-box;
  width: 100%;
}

/* 如果你的这个页面保留了侧边栏（frontmatter 里写了 sidebar: true），取消 margin: auto，改用左对齐 */
:global(.has-sidebar) .archives-page {
  margin-left: calc(var(--vp-sidebar-width, 272px) + 32px);
}

/* 移动端响应式，恢复默认的离边边距 */
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

/* 下面保持你原有的表格和文章样式 */
:deep(.animal-table) {
  border: none !important;
}
/* ...其他样式... */
</style>