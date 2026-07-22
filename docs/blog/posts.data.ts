import { createContentLoader } from 'vitepress'
import { statSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

interface Post {
  title: string
  url: string
  date: string
  summary: string
  tags: string[]
  oracle?: boolean | string // 1. 补充 oracle 属性类型
}

const docsDir = resolve(fileURLToPath(import.meta.url), '../..')

export default createContentLoader('blog/**/*.md', {
  includeSrc: false,
  render: false,
  excerpt: false,
  transform(raw): Post[] {
    return raw
      .filter((page) => page.url !== '/blog/')
      .map((page) => {
        let dateStr = ''
        try {
          const filePath = resolve(docsDir, `.${page.url}.md`)
          dateStr = statSync(filePath).mtime.toISOString().slice(0, 10)
        } catch {
          // ignore
        }
        const rawDate = page.frontmatter.date
        const publishDate = rawDate instanceof Date
          ? rawDate.toISOString().slice(0, 10)
          : String(rawDate || dateStr)

        return {
          title: page.frontmatter.title || '',
          url: page.url,
          date: publishDate,
          summary: page.frontmatter.summary || '',
          tags: page.frontmatter.tags || [],
          oracle: page.frontmatter.oracle, // 2. 关键修改：提取 frontmatter 中的 oracle 字段！
        }
      })
      .sort((a, b) => b.date.localeCompare(a.date))
  },
})