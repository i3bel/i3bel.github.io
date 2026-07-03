---
title: About
---

> 在自己的节奏里，慢慢成为更好的人。

<script setup>
import { ref } from 'vue'

const tabs = ref([
  {
    label: '个人简介',
    content: `<p>我是 <strong>i3bel</strong>，一名正在探索技术的爱好者。</p>
<p>目前主要在折腾 iOS 开发，用 Swift / SwiftUI 写一些 App。同时也捣鼓 AI 工具和自动化脚本，用 Cloud Code、DeepSeek 这些工具来提升效率。这个博客用到的前端技术栈——说实话我一个也不会，但这不妨碍我记录和分享。</p>
<p>我相信写博客是最好的学习方式：能写出来，才算真懂了。</p>`,
  },
  {
    label: '技术栈',
    content: `<h3>iOS 开发</h3>
<ul>
<li>Swift / SwiftUI</li>
<li>Xcode 开发环境</li>
<li>iOS 应用架构与 UI 构建</li>
</ul>
<h3>脚本与自动化</h3>
<ul>
<li>Python</li>
<li>Shell 脚本</li>
<li>终端工具与代理配置</li>
</ul>
<h3>AI 工具</h3>
<ul>
<li>Cloud Code（命令行 AI 工具）</li>
<li>DeepSeek API 接入</li>
<li>LLM 工作流搭建</li>
</ul>
<h3>工具链</h3>
<ul>
<li>Git / GitHub</li>
<li>Xcode / VS Code</li>
<li>VitePress（博客框架，虽然我还不太会）</li>
</ul>`,
  },
  {
    label: '项目',
    content: `<h3>cilicili</h3>
<p>一个 SwiftUI 实验项目，Bilibili 第三方 iOS 客户端，支持浏览、动态、视频播放和弹幕。</p>
<p><a href="https://github.com/i3bel/cilicili" target="_blank">github.com/i3bel/cilicili</a></p>
<h3>个人笔记系统</h3>
<p>就是这个博客，用 VitePress 搭建，部署在 GitHub Pages 上，记录学习过程中的踩坑记录和心得总结。</p>`,
  },
  {
    label: '联系我',
    content: `<p>如果你对我的某个项目感兴趣，或者发现博客里的内容有错误，欢迎通过 GitHub 联系我。</p>
<ul>
<li><strong>GitHub</strong>: <a href="https://github.com/i3bel" target="_blank">github.com/i3bel</a></li>
</ul>
<p>欢迎常来逛逛，希望这里的内容对你有所帮助！</p>`,
  },
])
</script>

<Tabs :tabs="tabs" />
