---
title: Discord 角色模拟 Bot：一个账号扮演多个角色
date: '2026-07-18T13:30:00+08:00'
summary: 使用 Discord Webhook，让一个 Bot 在服务器中模拟多个角色发言，自定义用户名和头像，并支持角色管理、自动补全等功能。
tags:
- Discord
- Discord Bot
- Webhook
- Node.js
- JavaScript
- 开源
---

# Discord 角色模拟 Bot：一个账号扮演多个角色

> 利用 Discord 官方 Webhook 功能，让一个 Bot 轻松扮演多个角色，无需多个 Discord 账号。

---

## 简介

这个 Bot 可以让你使用 `/chat` 命令，以不同的角色身份在频道中发送消息。

每个角色都拥有自己的：

- 👤 用户名
- 🖼️ 头像

虽然消息实际上由 **Bot + Webhook** 发出，但频道中的显示效果就像是真正的不同用户在发言。

整个过程中，你只需要登录自己的一个 Discord 账号即可。

---

## 功能

目前支持以下命令：

### `/chat`

以指定角色发送消息。

```text
/chat 角色:<名字> 消息:<内容>
```

特点：

- 自动切换用户名
- 自动切换头像
- 角色名称支持自动补全（Autocomplete）

---

### `/character add`

新增或更新角色。

```text
/character add 名字:<角色名> 头像:<图片链接>
```

---

### `/character remove`

删除角色。

```text
/character remove 名字:<角色名>
```

---

### `/character list`

查看当前服务器所有角色。

```text
/character list
```

---

## 数据存储

所有角色都会保存在：

```text
data/characters.json
```

角色数据按照 **服务器（Guild）** 分开存储。

例如：

- A 服务器拥有自己的角色列表
- B 服务器拥有另一套角色列表

两者互不影响。

---

## 安装

### ① 创建 Discord Bot

打开 Discord Developer Portal：

> https://discord.com/developers/applications

然后：

1. 点击 **New Application**
2. 输入应用名称（例如 `CharacterBot`）

---

### ② 创建 Bot

进入左侧 **Bot** 页面。

需要完成：

- 获取 **Bot Token**
- 建议关闭 **Public Bot**（除非需要公开邀请）

保存好 Token，后面会写入 `.env`。

---

### ③ 邀请 Bot

进入：

```text
OAuth2
    └── URL Generator
```

勾选：

#### Scopes

- bot
- applications.commands

#### Bot Permissions

- Send Messages
- Manage Webhooks
- Read Message History

生成邀请链接后，将 Bot 邀请进入自己的服务器。

---

### ④ 获取 Application ID

进入：

```text
General Information
```

复制：

```text
Application ID
```

稍后填写到 `.env` 的 `CLIENT_ID`。

---

## 配置

安装依赖：

```bash
npm install
```

复制配置文件：

```bash
cp .env.example .env
```

编辑 `.env`：

```text
DISCORD_TOKEN=你的 Bot Token

CLIENT_ID=Application ID

GUILD_ID=服务器 ID（可选）
```

其中：

- **DISCORD_TOKEN**：Bot Token
- **CLIENT_ID**：Application ID
- **GUILD_ID**：服务器 ID

> 填写 `GUILD_ID` 后，Slash Command 基本会在几秒内生效；不填写则注册为全局命令，Discord 最长可能需要约一小时同步。

---

## 启动

注册 Slash Command：

```bash
npm run deploy
```

启动 Bot：

```bash
npm run start
```

如果终端输出类似：

```text
已登录：CharacterBot
```

说明启动成功。

---

## 使用示例

首先创建角色：

```text
/character add 名字:小明 头像:https://example.com/avatar1.png

/character add 名字:小红 头像:https://example.com/avatar2.png
```

随后发送消息：

```text
/chat 角色:小明 消息:大家好！

/chat 角色:小红 消息:你好呀～
```

最终频道中看到的效果就是：

> **小明**：大家好！

> **小红**：你好呀～

其他成员不会看到是谁执行了 `/chat` 命令。

命令执行成功后的提示消息仅自己可见（Ephemeral）。

---

## 注意事项

### Webhook 权限

Bot 必须拥有：

- Manage Webhooks

第一次在某个频道发送消息时，会自动创建一个：

```text
CharacterBot-Relay
```

之后都会重复使用这个 Webhook，不会反复创建。

---

### 头像要求

头像必须是：

- http://
- https://

开头的公开图片链接。

如果是本地图片，可以：

- 上传到图床
- 上传到 Discord 后复制图片链接

---

### 权限限制

Webhook 不受：

- 加入服务器时间
- 身份组昵称

等限制影响。

但仍然遵守频道权限。

如果 Bot 无法访问某个频道，那么 Webhook 同样无法发送消息。

---

### 是否违规？

不会。

本项目完全使用 Discord 官方提供的 **Webhook API**。

许多知名机器人，例如：

- PluralKit
- Tupperbox

也都采用相同的实现方式。

---

### 批量导入角色

如果需要一次添加大量角色，可以直接编辑：

```text
data/characters.json
```

文件格式如下：

```json
{
  "服务器ID": [
    {
      "name": "小明",
      "avatar": "https://example.com/avatar.png"
    },
    {
      "name": "小红",
      "avatar": "https://example.com/avatar2.png"
    }
  ]
}
```

保存后重启 Bot，或等待下一次读取即可生效。