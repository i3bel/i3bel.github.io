<!-- docs/.vitepress/theme/components/ContextMenu.vue -->

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useRouter, useRoute } from 'vitepress'
import { Select } from 'animal-island-vue'


const router = useRouter()
const route = useRoute()


const visible = ref(false)
const pos = ref({ x: 0, y: 0 })
const selectedValue = ref('')


const menuMap: Record<string, { key: string; label: string; target: string }[]> = {

  '/garden/': [
    { key: 'hall', label: '🏠 大厅', target: '/' },
    { key: 'archives', label: '📚 档案室', target: '/archives/' },
    { key: 'blog', label: '✏️ 博客', target: '/blog/' },
  ],

  '/blog/': [
    { key: 'hall', label: '🏠 大厅', target: '/' },
    { key: 'archives', label: '📚 档案室', target: '/archives/' },
    { key: 'tags', label: '🏷️ 索引室', target: '/tags/' },
  ],

  '/archives/': [
    { key: 'hall', label: '🏠 大厅', target: '/' },
    { key: 'blog', label: '✏️ 博客', target: '/blog/' },
    { key: 'tags', label: '🏷️ 索引室', target: '/tags/' },
  ],

  '/tags/': [
    { key: 'hall', label: '🏠 大厅', target: '/' },
    { key: 'blog', label: '✏️ 博客', target: '/blog/' },
    { key: 'archives', label: '📚 档案室', target: '/archives/' },
  ],

  '/about/': [
    { key: 'hall', label: '🏠 大厅', target: '/' },
    { key: 'blog', label: '✏️ 博客', target: '/blog/' },
    { key: 'friends', label: '🌿 花园', target: '/garden/' },
  ],

  '/': [
    { key: 'blog', label: '✏️ 博客', target: '/blog/' },
    { key: 'archives', label: '📚 档案室', target: '/archives/' },
    { key: 'tags', label: '🏷️ 索引室', target: '/tags/' },
    { key: 'friends', label: '🌿 花园', target: '/garden/' },
    { key: 'about', label: '👤 书房', target: '/about/' },
  ],

}


function matchedOptions() {

  const matches = Object.keys(menuMap)
    .filter(p => route.path === p || route.path.startsWith(p))
    .sort((a,b)=>b.length-a.length)

  return matches.length
    ? menuMap[matches[0]]
    : []

}


const options = computed(matchedOptions)



function onContextMenu(e:MouseEvent){

  const opts = matchedOptions()

  if(!opts.length)
    return


  e.preventDefault()


  const width = 220
  const height = 300


  pos.value = {

    x: Math.min(
      e.clientX,
      window.innerWidth - width
    ),

    y: Math.min(
      e.clientY,
      window.innerHeight - height
    )

  }


  selectedValue.value=''
  visible.value=true

}



function onSelect(value:string){

  const item =
    options.value.find(
      o=>o.key===value
    )


  if(item){

    try{

      router.go(item.target)

    }catch{

      location.href=item.target

    }

  }


  visible.value=false

}



function onDocClick(e:MouseEvent){

  const el=document.querySelector(
    '.ctx-select-float'
  )


  if(
    el &&
    !el.contains(e.target as Node)
  ){

    visible.value=false

  }

}


function close(){

  visible.value=false

}



function onKeydown(e:KeyboardEvent){

  if(e.key==='Escape')
    close()

}



onMounted(()=>{

  window.addEventListener(
    'contextmenu',
    onContextMenu
  )


  window.addEventListener(
    'click',
    onDocClick,
    true
  )


  window.addEventListener(
    'keydown',
    onKeydown
  )


  window.addEventListener(
    'scroll',
    close,
    true
  )


  window.addEventListener(
    'resize',
    close
  )

})



onBeforeUnmount(()=>{

  window.removeEventListener(
    'contextmenu',
    onContextMenu
  )

  window.removeEventListener(
    'click',
    onDocClick,
    true
  )

  window.removeEventListener(
    'keydown',
    onKeydown
  )

  window.removeEventListener(
    'scroll',
    close,
    true
  )

  window.removeEventListener(
    'resize',
    close
  )

})

</script>


<template>

  <Teleport to="body">

    <!--
      vp-raw:
      告诉 VitePress:
      这里是第三方组件区域
      不要干涉CSS
    -->

    <div
      class="vp-raw"
    >

      <div
        v-if="visible"
        class="ctx-select-float"
        :style="{
          left:pos.x+'px',
          top:pos.y+'px'
        }"
      >

        <Select

          v-model="selectedValue"

          :options="options"

          placeholder="选择跳转页面..."

          @change="onSelect"

        />

      </div>

    </div>

  </Teleport>

</template>


<style scoped>


.ctx-select-float{

  position:fixed;

  z-index:99999;

}


/*
 不碰 animal-island 内部

 不设置:
 - transition
 - animation
 - transform
 - color
 - background

 全部交给 animal-island-vue

*/


</style>