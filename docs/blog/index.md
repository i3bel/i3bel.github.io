---
title: Blog
description: 所有文章列表
lastUpdated: false
layout: page
---

<script setup lang="ts">
import { ref } from 'vue';
import { Tabs, Title, Divider, Card, Button, Collapse } from 'animal-island-vue';
import type { TabItem } from 'animal-island-vue';
import 'animal-island-vue/style';
import { data as posts } from './posts.data.ts'

</script>

<div class="blog-page">
  <Title color="purple" size="large">陈列廊</Title>
  <Divider type="dashed-brown" style="margin-top: 30px;" />
  <div style="height: 10px;"></div>

  <div class="post-list" style="padding: 0;">
  <div v-for="post in posts" :key="post.url" class="post-item">
    <Card type="dashed" class="post-card"  block>
      <div class="post-header">
        <span class="post-date">{{ post.date }}</span>
        <div style="height: 10px;"></div>
        <Button class="post-title-btn" type="primary" danger>
          <a :href="post.url">{{ post.title }}</a>
        </Button>
      </div>
      <p class="post-summary">{{ post.summary }}</p>
      <div class="post-tags">
        <Button size="small" 
          v-for="tag in post.tags"
          :key="tag"
          class="post-tag-btn"
        >
          <a :href="`/tags/#${tag}`">#{{ tag }}</a>
        </Button>
      </div>
    </Card>
  </div>
</div>

<div style="height: 20px;"></div>
<Collapse question="「花园」路径？">
    <p>陈列廊 → 大厅、索引室、书房</p>
  </Collapse>

</div>


<style scoped>
.blog-page {
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

:global(.has-sidebar) .blog-page {
  margin-left: calc(var(--vp-sidebar-width, 272px) + 32px);
}

.post-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px 0;
  margin-bottom: -10px;
  width: 100%; /* 占满 .post-list 的宽度 */
}


.post-card {
  background: transparent !important;
  background-color: transparent !important;
}


.post-date {
  font-size: 13px;
  color: var(--vp-c-text-2);
  font-variant-numeric: tabular-nums;
}

.post-list {
  max-width: 1200px;  /* 改成 1200px */
  margin: 0 auto;
  padding: 0 24px 64px;
}


.blog-page {
  max-width: 1200px;  /* 改成 1200px */
  margin: 0 auto;
  padding: 32px 24px;
}

.post-title {
  font-size: 18px;
  font-weight: 600;
}

.post-title a {
  color: var(--vp-c-text-1);
  text-decoration: none;
}

.post-title a:hover {
  color: var(--vp-c-brand-1);
}

.post-summary {
  font-size: 14px;
  color: var(--vp-c-text-2);
  line-height: 1.7;
  margin: 4px 0;
}

.post-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 4px;
}

.post-tag {
  font-size: 12px;
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
  padding: 2px 12px;
  border-radius: 12px;
  text-decoration: none;
}

.post-tag:hover {
  background: var(--vp-c-brand-1);
  color: #fff;
}

@media (max-width: 640px) {
  .blog-page {
    padding-left: 16px;
    padding-right: 16px;
  }
  
  .post-title {
    font-size: 16px;
  }
  
  .post-summary {
    font-size: 13px;
  }
}
</style>