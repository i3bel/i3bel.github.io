import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'
import { useRoute } from 'vitepress'
import type { Theme } from 'vitepress'
import HomePage from './components/HomePage.vue'
import BackToTop from './components/BackToTop.vue'
import Tabs from './components/Tabs.vue'
import InteractiveAsciiBackground from './components/InteractiveAsciiBackground.vue'
import './style.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('HomePage', HomePage)
    app.component('Tabs', Tabs)
  },
  Layout() {
    const route = useRoute()
    const excluded = ['/manga', '/docx-editor']
    const showBg = !excluded.some((p) => route.path.startsWith(p))

    return h('div', null, [
      showBg ? h(InteractiveAsciiBackground) : null,
      h(DefaultTheme.Layout, null, {
        'layout-bottom': () => h(BackToTop),
      }),
    ])
  },
} satisfies Theme