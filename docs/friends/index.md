---
title: Friends
description: 友情链接
---

<script setup>
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
    desc: '索无限可能，记录思考、创造与生活。',
    avatar: 'https://www.mysticstars.cn/favicon.svg',
  },
]
</script>

<div class="friends-page">
  <h1>Friends</h1>
  <p class="friends-intro">欢迎互加友链，<a href="https://github.com/i3bel/i3bel.github.io/issues">点击这里</a> 留言交换。</p>
  <div class="friends-grid">
    <component
      v-for="friend in friends"
      :key="friend.name"
      :is="friend.url ? 'a' : 'div'"
      :href="friend.url || undefined"
      :target="friend.url ? '_blank' : undefined"
      :rel="friend.url ? 'noopener' : undefined"
      class="friend-card"
    >
      <div class="friend-avatar">
        <img v-if="friend.avatar" :src="friend.avatar" :alt="friend.name" loading="lazy" />
        <span v-else class="friend-avatar-placeholder">{{ friend.name[0] }}</span>
      </div>
      <div class="friend-info">
        <span class="friend-name">{{ friend.name }}</span>
        <span v-if="friend.desc" class="friend-desc">{{ friend.desc }}</span>
      </div>
    </component>
  </div>
</div>