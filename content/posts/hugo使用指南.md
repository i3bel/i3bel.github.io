+++
title = 'Hugo使用指南'
date = '2025-11-19T16:02:20+08:00'
draft = false
categories = ["工具"]
showReadingTime = true
ShowToc = true
ShowPostNavLinks = true
ShowBreadCrumbs = true
description = '教程、技术文档、软件使用、工具说明'
+++

# 部署与新建文章

hugo server -D

hugo new posts/1.md

## 如果我在本地部署，让网络监听，手机访问我要输入

hugo server --bind 0.0.0.0 --baseURL http://192.168.1.7:1313/

