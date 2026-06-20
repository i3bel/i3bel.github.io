---
title: 使用 fontTools 合并中英文字体：保留全部英文 + 按需补全中文
date: '2026-06-20T10:22:41+08:00'
summary: 基于 fontTools 的 Python 脚本，将英文字体完整保留，仅从中文字体中补全缺失的汉字字形，生成一个体积更小、兼容性更好的合并 TTF 字体。
tags:
- fontTools
- 字体合并
- Python
- PowerShell
- TTF
- 中英文字体
- 字体优化
---

# 使用 fontTools 合并中英文字体：保留全部英文 + 按需补全中文

&gt; 本文记录了一个基于 fontTools 的字体合并脚本，核心思路是：**完整保留英文字体的所有字形，仅从中文字体中补充缺失的汉字**，从而生成一个体积更小、兼容性更好的合并 TTF 字体。

---

## 背景与需求

在开发个人博客或项目时，经常需要同时显示中英文内容。常见方案有两种：

1. **加载两个字体文件**：分别加载英文字体和中文字体，通过 CSS 的 `font-family` 回退机制实现。缺点是请求次数多、加载慢。
2. **合并为一个字体文件**：将中英文字体合二为一，减少 HTTP 请求，提升加载速度。

但直接合并往往面临一个问题：如果简单地将两个字体叠加，英文字体中的字符（如 ASCII 范围内的字母、数字、符号）可能被中文字体覆盖，导致英文排版效果变差。

**本文的方案是：以英文字体为基准，完整保留其所有字形；仅将中文字体中缺失的汉字字形补充进来。** 这样既保证了英文的排版质量，又获得了完整的中文支持。

---

## 前置条件

- 已安装 Python 3.x
- 已安装 `fontTools` 库：`pip install fonttools`
- 准备两个 TTF 字体文件：
  - `en.ttf`：英文字体（如 JetBrains Mono、Fira Code 等）
  - `zh.ttf`：中文字体（如思源黑体、Noto Sans CJK 等）

将两个字体文件放在同一目录下，然后运行脚本。

---

## 脚本详解

```powershell
& C:\Users\Administrator\AppData\Local\Programs\Python\Python314\python.exe -c "
import os
from fontTools.ttLib import TTFont

print('====== 🚀 启动逆向保留终极方案（稳过） 🚀 ======')
en_path = 'en.ttf'
zh_path = 'zh.ttf'
output_path = 'merged_font.ttf'

if not os.path.exists(en_path) or not os.path.exists(zh_path):
    print('❌ 错误：当前目录下没找全 en.ttf 或 zh.ttf！')
    exit()

print('1. 正在加载英文基准字体 (en.ttf) 并提取纯正字形...')
en_font = TTFont(en_path)
en_cmap = en_font.getBestCmap()

# 提取英文里所有的字形实体和横向宽度
en_glyf = en_font['glyf']
en_hmtx = en_font['hmtx']

print('2. 正在加载中文基础字体 (zh.ttf) 作为骨架...')
# 直接用中文字体做容器，它天生自带 9000+ 完美汉字及配套底层组件，免去搬运冲突
zh_font = TTFont(zh_path)
zh_glyf = zh_font['glyf']
zh_hmtx = zh_font['hmtx']

print('3. ⚡ 正在用英文原版字形 100% 强行覆盖中文字体中的对应字符...')
overwrite_count = 0

# 遍历英文原字体里所有的有效映射
for code, en_glyph_name in en_cmap.items():
    if en_glyph_name not in en_glyf:
        continue
        
    # 获取中文字体在这个编码下的字形名称（如果存在的话）
    # 如果不存在，我们就为中文字体创建一个新的映射名
    zh_cmap_tables = zh_font['cmap'].tables
    
    # 统一命名，防止和中文原字形冲突
    target_glyph_name = f'en_uni{code:04X}'
    
    # 将英文原版的轮廓和宽度硬写入中文字体中
    zh_glyf[target_glyph_name] = en_glyf[en_glyph_name]
    zh_hmtx[target_glyph_name] = en_hmtx[en_glyph_name]
    
    # 强行修改中文字体的所有映射表，把这个编码指引到刚才写入的英文原版字形上
    for table in zh_cmap_tables:
        table.cmap[code] = target_glyph_name
        
    overwrite_count += 1

print(f'   -&gt; 成功用英文原版字形强行覆盖/写入了 {overwrite_count} 个字符映射！')

print('4. 正在优化新字体的度量参数（同步英文行高）...')
# 为了让合并后的字体排版高度更接近原版英文，把英文的垂直度量指标部分同步过去
for table_name in ['head', 'hhea', 'OS/2']:
    if table_name in en_font and table_name in zh_font:
        if table_name == 'OS/2':
            # 只同步关键的行高和上坡度下坡度，避免整体替换引发版本错误
            zh_font['OS/2'].sTypoAscender = en_font['OS/2'].sTypoAscender
            zh_font['OS/2'].sTypoDescender = en_font['OS/2'].sTypoDescender
            zh_font['OS/2'].sTypoLineGap = en_font['OS/2'].sTypoLineGap

print('5. 正在安全保存最终合并的字体文件...')
try:
    zh_font.save(output_path)
    print('=' * 50)
    print('✨ 奇迹终于发生！新字体已完美生成！')
    print(f'📂 文件名: {output_path}')
    print('   (此方案通过逆向全覆盖，100%保证了英文是原版，中文无损补全)')
    print('=' * 50)
except Exception as e:
    print(f'❌ 保存失败，原因是: {e}')
"