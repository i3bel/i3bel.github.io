---
title: Tags
layout: page
---

<script setup lang="ts">
import { ref, computed } from 'vue'
import { data as posts } from '../blog/posts.data.ts'
import { Title, Divider, Table, Tag, Button, Checkbox, Card, Collapse } from 'animal-island-vue'
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

// 根据 tag 文本的 Hash 计算分配固定的颜色
function getTagColor(tagText: string) {
  let hash = 0
  for (let i = 0; i < tagText.length; i++) {
    hash = tagText.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % tagColors.length
  return tagColors[index]
}

// 2. 定义表格列
const columns: TableColumn[] = [
  { title: '序号', dataIndex: 'index', width: 70, align: 'center' },
  { title: '日期', dataIndex: 'date', width: 120 },
  { title: '标题', dataIndex: 'title' },
  { title: 'Tags', dataIndex: 'tags', width: 240, align: 'center' },
]

const striped = ref(true)

// 3. 按 Tag 分组数据
function getTagMap(posts: any[]) {
  const map: Record<string, { count: number; posts: any[] }> = {}
  
  for (const post of posts) {
    const rawTags = Array.isArray(post.tags) ? post.tags : (post.tags ? [post.tags] : [])
    for (const tag of rawTags) {
      if (!map[tag]) map[tag] = { count: 0, posts: [] }
      map[tag].count++
      map[tag].posts.push(post)
    }
  }

  const sortedEntries = Object.entries(map).sort((a, b) => b[1].count - a[1].count)

  return sortedEntries.map(([tag, data]) => {
    const sortedPosts = data.posts.sort((a, b) => (b.date || '').localeCompare(a.date || ''))

    const tableData = sortedPosts.map((post, idx) => {
      let postTags: string[] = []
      if (Array.isArray(post.tags)) {
        postTags = post.tags
      } else if (typeof post.tags === 'string' && post.tags.trim() !== '') {
        postTags = [post.tags]
      }

      const formattedTags = postTags.slice(0, 2).map(t => ({
        name: t,
        color: getTagColor(t)
      }))

      return {
        key: `${tag}-${post.url || idx}`,
        index: idx + 1,
        date: post.date ? post.date.slice(0, 10) : '',
        title: post.title,
        url: post.url,
        tags: formattedTags
      }
    })

    return {
      tag,
      count: data.count,
      tableData
    }
  })
}

const tagSections = getTagMap(posts)

// 4. 构造 Checkbox 的 options 选项
const tagOptions = tagSections.map(item => ({
  label: `${item.tag} (${item.count})`,
  value: item.tag
}))

// 默认不选中任何 Tag
const selectedTags = ref<string[]>([])

// 计算当前选中的 Tag 对应的 Table 数据列表
const activeTagSections = computed(() => {
  return tagSections.filter(item => selectedTags.value.includes(item.tag))
})
</script>

<!-- 使用 vp-raw 隔离容器保护全部动森 UI 与动画样式 -->
<div class="archives-page vp-raw">
  <Title color="purple" size="large">索引室</Title>

  <Divider type="dashed-brown" style="margin-top: 30px;" />

  <div style="height: 10px;"></div>

  <!-- 1. 使用 Animal 卡片包裹 Checkbox 选框，形成受保护的独立 UI 区域 -->
  <Card class="tag-cloud-card">
    <div class="tag-checkbox-container">
      <Checkbox v-model="selectedTags" :options="tagOptions" />
    </div>
  </Card>

  <div style="height: 20px;"></div>

  <!-- 2. 为勾选展开的表格加入 Vue 原生渐隐过渡动画 -->
  <TransitionGroup name="animal-fade">
    <div v-for="item in activeTagSections" :key="item.tag" class="tag-section-item">
      <Button type="default" danger style="margin-top: 24px; margin-bottom: 16px;">
        <span :id="item.tag">{{ item.tag }} • {{ item.count }} 文章</span>
      </Button>
      <Table :columns="columns" :data-source="item.tableData" :striped="striped">
        <!-- 标题列插槽 -->
        <template #cell-title="{ value, record }">
          <a :href="record?.url" class="table-title-link">{{ value }}</a>
        </template>
        <template #title="{ value, record }">
          <a :href="record?.url" class="table-title-link">{{ value }}</a>
        </template>
        <!-- Tags 列插槽 -->
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
    </div>
  </TransitionGroup>

  <div style="height: 30px;"></div>

  <Collapse question="「索引室」路径？">
    <p>索引室 → 大厅、档案室、占卜室</p>
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

/* Card 卡片强化 */
.tag-cloud-card {
  padding: 12px;
  background-color: var(--vp-c-bg-soft, #f9f9f9);
}

/* Checkbox 外层容器样式 */
.tag-checkbox-container {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

/* Tags 容器：强制在一行排列，超出时不换行 */
.tags-container {
  display: flex;
  flex-wrap: nowrap;
  gap: 6px;
  justify-content: center;
  align-items: center;
  white-space: nowrap;
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

/* 渐隐过渡动画 */
.animal-fade-enter-active,
.animal-fade-leave-active {
  transition: all 0.3s ease;
}
.animal-fade-enter-from,
.animal-fade-leave-to {
  opacity: 0;
  transform: translateY(12px);
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