+++
title = 'HugoPapermod中KaTeX矩阵与分段函数渲染技巧'
date = '2025-11-23T15:23:42+08:00'
draft = false
categories = ["工具"]
showReadingTime = true
ShowToc = true
ShowPostNavLinks = true
ShowBreadCrumbs = true
description = ''
math = true
+++


# 引言

在使用 Hugo Papermod 主题撰写带数学公式的文章时，矩阵和分段函数有时无法正确换行或显示。这是因为 Markdown 对 `\\` 换行符和某些 LaTeX 块级公式有转义处理，导致 KaTeX 渲染失败。

本文介绍一个简单而有效的解决方案，确保矩阵和分段函数在 Papermod 中完美显示。

---

# 问题示例

普通 Markdown 写法：


$$
\begin{bmatrix}
a & b \\
c & d
\end{bmatrix}
$$

\begin{bmatrix} a & b \\ c & d \end{bmatrix}

# 解决方案：使用 rawhtml 短代码

Papermod 提供了 {{< rawhtml >}} ... {{< /rawhtml >}} 短代码，可以让 Hugo 原样输出 HTML/LaTeX 内容，避免 Markdown 的转义问题。

语法示例：
{{< rawhtml >}}
Y = 
$\begin{bmatrix}
a & b \\
c & d
\end{bmatrix}$
{{< /rawhtml >}}
