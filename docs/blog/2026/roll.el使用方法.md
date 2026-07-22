---
title: roll.el：Emacs RPG 掷骰插件
date: '2026-07-18T13:00:00+08:00'
summary: 一个功能丰富的 Emacs 掷骰插件，支持标准 RPG 掷骰表达式、D&D 保留/去除骰子、重骰、Math 函数、重复掷骰以及随机工具。
oracle: yes
tags:
- Emacs
- Emacs Lisp
- RPG
- D&D
- Dice
- TTRPG
- roll.el
---

# roll.el：Emacs RPG 掷骰插件

> 一个简单而强大的 Emacs 掷骰插件。

---

## 功能特性

- 🎲 标准骰子表达式（`d20`、`3d6`……）
- ➕ 四则运算
- 🧮 括号表达式
- 🎯 多个骰子混合计算
- 📉 去除最低骰（Drop Lowest）
- 📈 保留最高骰（Keep Highest）
- 🔄 无限重骰（Reroll）
- 🔁 单次重骰（Reroll Once）
- 📐 JavaScript `Math` 数学函数
- ♻️ 重复掷骰
- ⌨️ `M-x` 交互命令
- 🎯 随机抽选
- 🔀 随机排序
- 🍀 今日运势

---

## 基础掷骰

默认可以省略前面的 `1`。

```elisp
(roll "d6")              ; 1颗6面骰
(roll "1d6")             ; 同上
(roll "d20")             ; 1颗20面骰
(roll "d100")            ; 1颗100面骰

(roll "3d6")             ; 3颗6面骰
(roll "2d20")            ; 2颗20面骰
```

---

## 数学运算

支持普通四则运算和括号。

```elisp
(roll "d6 + 2")
(roll "3d6 - 1")
(roll "d6 * 2")
(roll "2d6 / 2")
(roll "d20 + 5 - 2")

(roll "(2d6 + 3) * 2")

(roll "d6 + d4")
```

---

## 去除最低骰（Drop Lowest）

使用 `d` 去掉最低点数。

```elisp
(roll "4d6d1")           ; D&D 创角
(roll "5d6d2")
(roll "3d20d1")
(roll "4d6d1 + 2")
```

---

## 无限重骰（Reroll）

使用 `r` 对低于指定值的骰子持续重掷。

```elisp
(roll "2d6r2")
(roll "3d8r3")
(roll "d10r2")
(roll "4d6r2 + 2")
```

---

## 单次重骰（Reroll Once）

使用 `rk` 对低于指定值的骰子仅重掷一次。

```elisp
(roll "2d6rk2")
(roll "3d8rk3")
(roll "d10rk2")
(roll "4d6rk2 + 3")
```

---

## 保留最高骰（Keep Highest）

使用 `k` 保留最高的若干颗骰子。

适用于 D&D 优势等规则。

```elisp
(roll "2d20k1")
(roll "3d6k2")
(roll "4d6k3")
(roll "2d20k1 + 5")
```

---

## Math 函数

支持 JavaScript 风格的 `Math` 函数。

```elisp
(roll "Math.ceil(3d6 / 2)")
(roll "Math.floor(3d6 / 2)")
(roll "Math.round(3d6 / 2)")
(roll "Math.abs(d6 - 3)")
(roll "Math.max(d20, d20)")
(roll "Math.min(d20, d20)")
(roll "Math.ceil((2d6 + 3) / 2)")
```

目前支持：

- `Math.ceil`
- `Math.floor`
- `Math.round`
- `Math.abs`
- `Math.max`
- `Math.min`

---

## 复杂表达式

所有骰子规则都可以自由组合。

```elisp
(roll "4d6d1 + 3d6")
(roll "2d20k1 + d4 + 5")
(roll "(2d6 + 3) * 2 + d4")
(roll "Math.ceil(4d6d1 / 2)")
(roll "Math.max(2d20k1, d20)")
```

---

## 重复掷骰

第二个参数表示重复整个表达式。

```elisp
(roll "d6" 3)
(roll "4d6d1" 6)
(roll "2d20k1" 10)
(roll "Math.ceil(3d6/2)" 5)
(roll "d6 + 2" 4)
```

---

## 交互命令

所有命令均可通过 `M-x` 调用。

```text
M-x roll-interactive      输入任意掷骰表达式
M-x roll-d20              快速掷 d20
M-x roll-d6               快速掷 d6
M-x roll-d100             快速掷 d100
M-x roll-advantage        优势掷骰
M-x roll-disadvantage     劣势掷骰
M-x roll-region           对选中区域中的表达式进行掷骰
```

---

## 随机工具

### 随机抽选

随机选择一个项目。

```elisp
(roll-pick "战士 法师 盗贼 牧师")
```

---

### 随机排序

随机打乱顺序。

```elisp
(roll-shuffle "A B C D E")
```

---

### 今日运势

默认七段运势。

```elisp
(roll-luck)
```

十二段运势。

```elisp
(roll-luck 'twelve)
```

浅草寺御神签风格。

```elisp
(roll-luck 'asakusa)
```

---

## License

GPL-3.0