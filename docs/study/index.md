---
title: 关于
lastUpdated: false
layout: page
---

<script setup lang="ts">
import { ref } from 'vue';
import { Tabs, Title, Divider, Card, Button, Collapse } from 'animal-island-vue';
import type { TabItem } from 'animal-island-vue';
import 'animal-island-vue/style';

// 定义标签页
const items: TabItem[] = [
  { key: 'about', label: '关于本站' },
  { key: 'why', label: '为什么写博客' },
  { key: 'skills', label: '技能栈' },
  { key: 'projects', label: '我的项目' },
];

const active = ref('about');
</script>

<div class="about-page">
  <Title color="warm-peach-pink" size="large">书房</Title>

  <Divider type="dashed-brown" style="margin-top: 30px;" />

  <Button type="primary"  danger style="margin-top: 10px; margin-bottom: 20px;">i3bel</Button>

  <Card type="dashed" color="warm-peach-pink">
    目前主要在折腾 iOS 开发（Swift / SwiftUI），也写一些 AI 工具和自动化脚本。这个博客用到的前端技术栈——说实话我一个也不会，但这不妨碍我记录和分享。
  </Card>

  <div style="height: 20px;"></div>

<Tabs v-model="active" :items="items">
  <!-- 标签页 1：关于本站 -->
  <template #about>
    <div class="tab-content">
      <p>这个博客使用 <strong>VitePress</strong> 构建，部署在 <strong>GitHub Pages</strong> 上。它是我个人的<strong>笔记系统</strong>，用来沉淀学习过程中的思考与总结。</p>
      <p>本站涵盖的主题包括但不限于：</p>
      <ul>
        <li>iOS 开发（Swift、SwiftUI）</li>
        <li>AI 工具与自动化工作流</li>
        <li>终端技巧与开发环境配置</li>
        <li>效率方法论与知识管理</li>
        <li>折腾过程中的踩坑记录</li>
      </ul>
    </div>
  </template>

  <!-- 标签页 2：为什么写博客 -->
  <template #why>
    <div class="tab-content">
      <p>写博客不是为了展示我有多厉害，而是为了：</p>
      <ol>
        <li><strong>逼自己理解</strong>——能写出来，才算真懂了</li>
        <li><strong>建立外脑</strong>——以后遇到同样的问题，知道去哪里找答案</li>
        <li><strong>连接同好</strong>——也许某篇文章正好帮到了正在搜索这个问题的你</li>
      </ol>
    </div>
  </template>

  <!-- 标签页 3：技能栈 -->
  <template #skills>
    <div class="tab-content">
      <ul>
        <li><strong>iOS 开发</strong>: Swift、SwiftUI</li>
        <li><strong>脚本与自动化</strong>: Python、Shell</li>
        <li><strong>AI 工具</strong>: Cloud Code、DeepSeek、各类 LLM 工作流</li>
        <li><strong>工具链</strong>: Git、Xcode、VS Code</li>
      </ul>
    </div>
  </template>

  <!-- 标签页 4：我的项目 -->
  <template #projects>
    <div class="tab-content">
      <ul>
        <li>
          <strong>cilicili</strong> — 一个 SwiftUI 实验项目，Bilibili 第三方 iOS 客户端，支持浏览、动态、视频播放和弹幕<br>
          <a href="https://github.com/i3bel/cilicili" target="_blank" rel="noopener" style="color: var(--vp-c-brand-1); text-decoration: none;">github.com/i3bel/cilicili</a>
        </li>
      </ul>
    </div>
  </template>
</Tabs>

  <div style="height: 20px;"></div>

  <Collapse question="「书房」路径？">
    <p>书房 → 大厅、花园</p>
  </Collapse>
</div>

<style scoped>
.about-page {
  /* 1. 顶部固定位置：导航栏高度 + vp-doc 的默认上边距 */
  padding-top: calc(var(--vp-nav-height, 64px) + 32px);
  padding-bottom: 64px;
  
  /* 2. 宽度与居中：设置 900px 保证选项卡与列表排版足够宽敞舒适 */
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
:global(.has-sidebar) .about-page {
  margin-left: calc(var(--vp-sidebar-width, 272px) + 32px);
}

/* 选项卡内部文档排版适配 */
.tab-content {
  padding-top: 12px;
  color: var(--vp-c-text-1);
  line-height: 1.7;
}

.tab-content ul,
.tab-content ol {
  padding-left: 20px;
  margin: 12px 0;
}

.tab-content li {
  margin-bottom: 6px;
}

.tab-content blockquote {
  margin: 16px 0;
  padding: 8px 16px;
  border-left: 4px solid var(--vp-c-brand-1);
  background: var(--vp-c-bg-alt);
  border-radius: 0 8px 8px 0;
  color: var(--vp-c-text-2);
}

/* 移动端响应式，恢复默认边距 */
@media (max-width: 960px) {
  .about-page {
    padding-top: calc(var(--vp-nav-height, 64px) + 16px);
    padding-left: 16px;
    padding-right: 16px;
  }
  
  :global(.has-sidebar) .about-page {
    margin-left: auto;
  }
}
</style>