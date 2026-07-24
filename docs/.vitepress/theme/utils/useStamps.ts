// .vitepress/theme/utils/useStamps.ts
import { ref } from 'vue'

export interface StampData {
  src: string          // 图片访问路径，例如 '/stamp/动漫精选/cat.jpg'
  fileName: string     // 文件名，例如 'cat.jpg'
  initRotate: number   // 随机乱七八糟的倾斜角
  initY: number        // 随机上下错落值
}

export interface StampFolder {
  name: string         // 文件夹名字，例如 '动漫精选'
  stamps: StampData[]  // 属于该文件夹下的邮票列表
}

/**
 * 自动读取 public/stamp/ 下按子文件夹分类的所有图片文件
 */
export function useAutoStamps() {
  const folders = ref<StampFolder[]>([])

  // 1. 利用 Vite 的 glob 递归匹配 public/stamp/ 下所有子文件夹里的图片
  const globImages = import.meta.glob('/docs/public/stamp/**/*.{png,jpg,jpeg,webp,svg,PNG,JPG,JPEG}', {
    eager: true,
    query: '?url',
    import: 'default'
  })

  // 2. 兼容不同的 Vite 项目根目录配置 (/public/stamp/...)
  const globImagesAlt = import.meta.glob('/public/stamp/**/*.{png,jpg,jpeg,webp,svg,PNG,JPG,JPEG}', {
    eager: true,
    query: '?url',
    import: 'default'
  })

  const rawEntries = Object.keys(globImages).length > 0 ? globImages : globImagesAlt

  // 临时映射表：{ '动漫精选': [StampData, ...], '复古邮票集': [...] }
  const folderMap: Record<string, StampData[]> = {}

  for (const path in rawEntries) {
    // 根据规则提取相对路径
    // 例："/docs/public/stamp/动漫精选/芙莉莲.png" -> "动漫精选/芙莉莲.png"
    const relativePath = path
      .replace(/^\/docs\/public\/stamp\//, '')
      .replace(/^\/public\/stamp\//, '')

    const parts = relativePath.split('/')

    // 只处理放在子文件夹里的图片 (parts 格式应该为 ['文件夹名', '文件名'])
    if (parts.length >= 2) {
      const folderName = parts[0]
      const fileName = parts[parts.length - 1]

      // 构建前端可直接访问的路径
      const src = `/stamp/${relativePath}`

      // 获取当前文件夹内已有图片的数量，用于计算交替旋转/错落
      if (!folderMap[folderName]) {
        folderMap[folderName] = []
      }
      const index = folderMap[folderName].length

      // 自动为每张扫描到的图片生成自然随机的角度与错落高度
      const randomRotate = (index % 2 === 0 ? -1 : 1) * (6 + Math.floor(Math.random() * 10)) // -16deg ~ +16deg
      const randomY = (index % 2 === 0 ? 1 : -1) * (4 + Math.floor(Math.random() * 8))     // -12px ~ +12px

      folderMap[folderName].push({
        src,
        fileName,
        initRotate: randomRotate,
        initY: randomY
      })
    }
  }

  // 转为数组格式
  folders.value = Object.keys(folderMap).map((name) => ({
    name,
    stamps: folderMap[name]
  }))

  return {
    folders
  }
}