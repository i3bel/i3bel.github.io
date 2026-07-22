---
title: oracle
layout: page
---

<script setup lang="ts">
import { ref } from 'vue';
import { data as posts } from '../blog/posts.data.ts';
import { Card, Title, Divider, Button, Collapse, Table, Tag } from 'animal-island-vue';
import type { TableColumn } from 'animal-island-vue';

// 1. 定义可选的 Tag 颜色库
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

// 2. 根据 tag 文本的字符串哈希计算对应颜色（保证相同名称的 Tag 颜色一致）
function getTagColor(tagText: string) {
  if (!tagText || tagText === '待分类') return 'default';
  let hash = 0;
  for (let i = 0; i < tagText.length; i++) {
    hash = tagText.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % tagColors.length;
  return tagColors[index];
}

// 3. 过滤出 oracle 为 true / 'yes' 的文章
const oraclePosts = posts.filter((post: any) => {
  const isOracle = post.oracle === true || post.oracle === 'yes';
  return isOracle;
});

// 4. 按日期倒序排列
oraclePosts.sort((a: any, b: any) => {
  const dateA = a.date || '';
  const dateB = b.date || '';
  return dateB.localeCompare(dateA);
});

// 5. 统计文章总数
const totalCount = oraclePosts.length;

// 6. 转换数据为 Table data-source 格式
const tableData = oraclePosts.map((item: any, index: number) => {
  // 提取第一个 tag，如果不存在则使用 '待分类'
  let firstTag = '待分类';
  if (Array.isArray(item.tags) && item.tags.length > 0) {
    firstTag = item.tags[0];
  } else if (typeof item.tags === 'string' && item.tags.trim() !== '') {
    firstTag = item.tags;
  }

  return {
    key: item.url || index,
    date: item.date ? item.date.slice(0, 10) : '',
    title: item.title,
    url: item.url,
    tag: firstTag,
    tagColor: getTagColor(firstTag) // 预计算并关联该 tag 的色彩
  };
});

// 7. 表格列定义
const columns: TableColumn[] = [
  { title: '日期', dataIndex: 'date', width: 120 },
  { title: '标题', dataIndex: 'title' },
  { title: 'Tag', dataIndex: 'tag', width: 140, align: 'center' },
];

const striped = ref(true);
</script>

<div class="archives-page">
  <Title color="purple" size="large">占卜室</Title>
  <Divider type="dashed-brown" style="margin-top: 30px;" />

  <div style="height: 10px;"></div>

  <Button type="default" danger style="margin-top: 10px; margin-bottom: 20px;">
    {{ totalCount }} 文章
  </Button>
  
  <Table :columns="columns" :data-source="tableData" :striped="striped">
    <!-- 标题列：渲染为可点击链接 -->
    <template #cell-title="{ value, record }">
      <a :href="record.url" class="table-title-link">
        {{ value }}
      </a>
    </template>
    <template #title="{ value, record }">
      <a :href="record.url" class="table-title-link">
        {{ value }}
      </a>
    </template>
    <!-- Tag 列：使用动态绑定计算出的彩色组件 :color="record.tagColor" -->
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