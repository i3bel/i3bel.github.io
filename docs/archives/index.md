---
title: Archives
layout: page
---

<script setup lang="ts">
import { ref } from 'vue'
import { data as posts } from '../blog/posts.data.ts'
import { Title, Divider, Button, Table, Collapse } from 'animal-island-vue'
import type { TableColumn } from 'animal-island-vue'

// 1. 定义表格列 - 移除了 tags 列
const columns: TableColumn[] = [
  { title: '序号', dataIndex: 'index', width: 70, align: 'center' },
  { title: '日期', dataIndex: 'date', width: 120 },
  { title: '标题', dataIndex: 'title' },
  // tags 列已移除
]

const striped = ref(true)

// 2. 按年份分组数据，预处理数据 - 移除了 tags 处理
function groupAndFormatByYear(posts: any[]) {
  const map: Record<string, any[]> = {}
  
  for (const post of posts) {
    const year = post.date ? post.date.slice(0, 4) : '未知'
    if (!map[year]) map[year] = []
    map[year].push(post)
  }

  // 年份倒序
  const sortedYears = Object.keys(map).sort((a, b) => b.localeCompare(a))

  return sortedYears.map(year => {
    const yearPosts = map[year].sort((a, b) => b.date.localeCompare(a.date))

    const tableData = yearPosts.map((post, idx) => {
      return {
        key: post.url || idx,
        index: idx + 1,
        date: post.date ? post.date.slice(0, 10) : '',
        title: post.title,
        url: post.url,
        // tags 已移除
      }
    })

    return {
      year,
      count: yearPosts.length,
      tableData
    }
  })
}

const archives = groupAndFormatByYear(posts)
</script>

<div class="archives-page">

<Title color="purple" size="large">档案室</Title>

<Divider type="dashed-brown" style="margin-top: 30px;" />

<div style="height: 10px;"></div>

<!-- 逐年渲染按钮与对应的 Table -->
<template v-for="item in archives" :key="item.year">
  <Button type="default" danger style="margin-top: 24px; margin-bottom: 16px;">
    {{ item.year }} • {{ item.count }} 文章
  </Button>

  <Table :columns="columns" :data-source="item.tableData" :striped="striped">
    <!-- 标题列插槽 -->
    <template #cell-title="{ value, record }">
      <a :href="record?.url" class="table-title-link">{{ value }}</a>
    </template>
    <template #title="{ value, record }">
      <a :href="record?.url" class="table-title-link">{{ value }}</a>
    </template>
    
    <!-- tags 相关的插槽已全部移除 -->
  </Table>
</template>

<div style="height: 30px;"></div>

<Collapse question="「档案室」路径？">
  <p>档案室 → 大厅、索引室、瞭望塔</p>
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

/* 标题链接样式 */
.table-title-link {
  text-decoration: none;
  color: var(--vp-c-text-1, #333);
  font-weight: 500;
  transition: color 0.15s ease;
}

.table-title-link:hover {
  color: var(--vp-c-brand-1, #19c8b9);
}

/* Tags 相关样式已移除 */

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
</style>