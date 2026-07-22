---
title: CS2 一键静音切换：将 M 键设为音量开关
date: '2026-06-20T10:59:00+08:00'
summary: 在 CS2 中通过两条简单的控制台指令，将 M 键设置为一键静音/恢复音量的切换开关，方便在对局中快速切换。
oracle: yes
tags:
- CS2
- Counter-Strike 2
- 游戏指令
- 控制台
- 快捷键
- 音量控制
---

# CS2 一键静音切换：将 M 键设为音量开关

&gt; 两条简单的控制台指令，让 M 键成为你在 CS2 对局中的音量总开关。

---

## 效果

按下 **M 键** → 游戏音量变为 **0**（完全静音）

再次按下 **M 键** → 游戏音量恢复为 **1**（正常音量）

---

## 指令

```text
alias toggle_master_volume "toggle volume 0 1"; bind "m" "toggle_master_volume"