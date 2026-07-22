---
title: Archives
layout: page
---

<script setup lang="ts">
import { ref } from 'vue'
import { data as posts } from '../blog/posts.data.ts'
import { Title, Divider, Button, Table, Collapse, Tag } from 'animal-island-vue'
import type { TableColumn } from 'animal-island-vue'

// 1. 定义可用的 Tag 颜色
const tagColors = [
  'app-pink', 
  'purple', 
  'app-blue', 
  'app-yellow', 
  'app-orange', 
  'app-teal', 
  'app-green', 
  'app-red', 
  'lime-green', 
  'yellow-green', 
  'brown', 
  'warm-peach-pink'
] as const

// 根据 tag 文本的 Hash 计算分配固定的颜色，确保同一个 Tag 每次颜色一致
function getTagColor(tagText: string) {
  let hash = 0
  for (let i = 0; i < tagText.length; i++) {
    hash = tagText.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % tagColors.length
  return tagColors[index]
}

// 2. 定义表格列 - 包含 序号、日期、标题、Tags 四项
const columns: TableColumn[] = [
  { title: '序号', dataIndex: 'index', width: 70, align: 'center' },
  { title: '日期', dataIndex: 'date', width: 120 },
  { title: '标题', dataIndex: 'title' },
  { title: 'Tags', dataIndex: 'tags', width: 260, align: 'center' }, // 调整宽度保证放得下一行 2 个 Tag
]

const striped = ref(true)

// 3. 按年份分组数据，并对 Tags 进行截取和颜色匹配
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
      let rawTags: string[] = []
    
      // 兼容数组或字符串格式的 tags
      if (Array.isArray(post.tags)) {
        rawTags = post.tags
      } else if (typeof post.tags === 'string' && post.tags.trim() !== '') {
        rawTags = [post.tags]
      }
      // 核心要求：只截取 frontmatter 里的前 2 个 tag，并处理好对应的颜色
      const formattedTags = rawTags.slice(0, 2).map(t => ({
        name: t,
        color: getTagColor(t)
      }))
      return {
        key: post.url || idx,
        index: idx + 1,
        date: post.date ? post.date.slice(0, 10) : '',
        title: post.title,
        url: post.url,
        tags: formattedTags
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
    <!-- 1. 标题列插槽 -->
    <template #cell-title="{ value, record }">
      <a :href="record?.url" class="table-title-link">{{ value }}</a>
    </template>
    <template #title="{ value, record }">
      <a :href="record?.url" class="table-title-link">{{ value }}</a>
    </template>
    <!-- 2. Tags 列插槽 (同时支持 #cell-tags 和 #tags 插槽) -->
    <template #cell-tags="{ value }">
      <div class="tags-container">
        <Tag 
          v-for="(t, tIdx) in value" 
          :key="tIdx"
          size="small"
          :color="t.color"
        >
          {{ t.name }}
        </Tag>
      </div>
    </template>
    <template #tags="{ value }">
      <div class="tags-container">
        <Tag 
          v-for="(t, tIdx) in value" 
          :key="tIdx"
          size="small"
          :color="t.color"
        >
          {{ t.name }}
        </Tag>
      </div>
    </template>
  </Table>
</template>

<div style="height: 30px;"></div>

<Collapse question="「档案室」路径？">
  <p>档案室 → 大厅、索引室</p>
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

/* Tags 容器：强制在一行排列，超出时不换行 */
.tags-container {
  display: flex;
  flex-wrap: nowrap;      /* 强制不换行 */
  gap: 6px;
  justify-content: center;
  align-items: center;
  white-space: nowrap;    /* 确保文字内部也不换行 */
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

/* Tags 容器样式 */
.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: center;
  align-items: center;
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
</style>


