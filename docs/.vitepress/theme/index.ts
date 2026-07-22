import DefaultTheme from 'vitepress/theme'
import 'animal-island-vue/style'
import { h } from 'vue'
import { useRoute } from 'vitepress'
import type { Theme } from 'vitepress'
import HomePage from './components/HomePage.vue'
import BackToTop from './components/BackToTop.vue'
import Tabs from './components/Tabs.vue'
import flowbg from './components/flowbg.vue'
import ContextMenu from './components/ContextMenu.vue'   // 名字和下面用的保持一致
import './style.css'
import { NotificationContainer } from 'animal-island-vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('HomePage', HomePage)
    app.component('Tabs', Tabs)
  },
  Layout() {
    const route = useRoute()
    const excluded = ['/docx-editor']
    const showBg = !excluded.some((p) => route.path.startsWith(p))
    return h('div', null, [
      showBg ? h(flowbg) : null,
      h(DefaultTheme.Layout, null, {
        'layout-bottom': () => [h(BackToTop), h(ContextMenu),  h(NotificationContainer)],
      }),
    ])
  },
} satisfies Theme