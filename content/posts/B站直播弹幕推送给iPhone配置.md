+++
title = 'B站直播弹幕推送给iPhone配置'
date = '2025-12-20T15:25:04+08:00'
draft = false
categories = ["工具"]
showReadingTime = true
ShowToc = true
ShowPostNavLinks = true
ShowBreadCrumbs = true
description = ''
+++

# 引言
因为我没有两个显示器，有时在电脑上看直播会错过弹幕。为了不漏掉重要消息，我想把 **B站直播弹幕直接推送到 iPhone**。本文将介绍完整实现流程，从信息接收到手机推送的配置方法。

# 运行方法


 1. **启动 Event Bridge 服务器**
打开终端，进入 `laplace-bark` 文件夹，运行：
   ```bash
   .\leb-server-windows-x64.exe --host 0.0.0.0
   ```
2. 在另一个终端中，仍在 laplace-bark 文件夹，运行：
```
node index.js
```
3. 打开花店

访问 [Laplace Chat 配置页面](https://chat.laplace.live/dashboard/CGNDMIT4YDC08)

# 原理实现
整体思路非常简单：

```
B站直播间 -> Laplace Chat (信息接收) -> Event Bridge (中转) -> Bark (iPhone通知)
```

1. **信息接收**：通过 Laplace Chat 获取直播间的弹幕、礼物、SC 和互动事件。
2. **桥接**：本地运行 Event Bridge，将 Laplace Chat 的事件转发到本地。
3. **推送**：使用 Bark 将事件通知推送到 iPhone，并可显示头像。

# 具体实现

## 1. 配置 Laplace Chat
访问 [Laplace Chat 配置页面](https://chat.laplace.live/dashboard/CGNDMIT4YDC08)，完成以下操作：

1. 输入你的 B站直播间 ID。
2. 获取身份码并绑定桥（Event Bridge）。
3. 配置桥的连接方式为本地 WebSocket（Local Bridge）。
4. 确认桥已显示 **Event Bridge 已连接**。

这样，Laplace Chat 就可以把直播间事件发送到你本地的桥。

## 2. 运行 Event Bridge
1. 下载并解压 `leb-server-windows-x64.exe` 到一个文件夹，比如 `C:\Users\Administrator\Desktop\laplace-bark`。
2. 打开终端，运行：

```powershell
.\leb-server-windows-x64.exe --host 0.0.0.0
```

3. 终端会显示：

```
🌸 LAPLACE Event Bridge Server
🚀 Server running at http://0.0.0.0:9696
Waiting for connections...
```

这表示桥已启动，等待 Laplace Chat 的事件发送。

## 3. Node.js 推送脚本
在同一个文件夹中，创建 `index.js`，内容如下（新手可直接复制）：

```js
import WebSocket from "ws";
import https from "https";

// ==== 配置区域 ====
const BARK_KEY = "sWyDmeAHxQovoLaoBpSERj"; // 替换为你的 Bark Key
const BRIDGE_URL = "ws://localhost:9696/";   // 本地 Event Bridge 地址
// ==================

// 发送 Bark 通知函数，支持自定义头像
function sendBark(user, text, iconUrl) {
  const content = text ? `${user}: ${text}` : `${user} 有新事件`;
  const url = `https://api.day.app/${BARK_KEY}/B站直播/${encodeURIComponent(content)}${iconUrl ? `?icon=${encodeURIComponent(iconUrl)}` : ""}`;
  https.get(url, res => {
    console.log("已发送通知，状态码:", res.statusCode, `内容: ${content}`);
  }).on("error", e => console.error("发送通知失败:", e));
}

let ws;

// 连接 Event Bridge
function connectBridge() {
  ws = new WebSocket(BRIDGE_URL);

  ws.on("open", () => {
    console.log("已连接到本地 Event Bridge");
  });

  ws.on("message", msg => {
    try {
      const event = JSON.parse(msg.toString());
      console.log("收到事件:", event);

      let user = event.username || "系统";
      let text = "";
      let iconUrl = event.avatar || "";

      switch (event.type) {
        case "message":
          text = event.message;
          break;
        case "GIFT":
          text = `送礼 ${event.gift_name} x${event.num}`;
          break;
        case "SUPER_CHAT":
          text = `SC: ${event.message}`;
          break;
        case "interaction":
          text = "互动事件";
          break;
        default:
          text = event.type; // 其他事件类型
      }

      sendBark(user, text, iconUrl);

    } catch (e) {
      console.error("解析事件失败:", e);
    }
  });

  ws.on("close", () => {
    console.log("Event Bridge 连接关闭，5 秒后重连...");
    setTimeout(connectBridge, 5000);
  });

  ws.on("error", err => console.error("WebSocket 出错:", err));
}

// 启动连接
connectBridge();

```

## 4. 运行 Node.js 脚本
在终端运行：

```powershell
node index.js
```

如果一切配置正确，你会看到类似：

```
已连接到本地 Event Bridge
收到事件: { username: '贝偷分', type: 'message', message: '8', avatar: 'https://i2.hdslb.com/…' }
已发送通知，状态码: 200 内容: 贝偷分: 8
```

iPhone 将会立即收到通知，显示弹幕内容和头像。

# 总结
通过 **Laplace Chat + Event Bridge + Bark** 的组合，我们可以轻松把 B站直播间的弹幕、礼物、SC 和互动事件推送到手机，即使没有多显示器也不会错过重要消息。  

这种方式的优点：

- 完全可控，桥运行在本地，安全可靠
- 支持自定义头像
- 支持多种事件类型，所有事件都能通知
- 易于新手配置，只需几个步骤

新手可按照本文步骤，复制代码、运行终端，即可实现从 B站直播到 iPhone 的完整通知链路。


# 附件
## 准备 Node.js

1. 下载 Node.js 官方网站：[Node.js 官方下载](https://nodejs.org/)
2. 安装完成后，在终端验证：

```bash
node -v
npm -v
```
## 创建项目文件夹
```
mkdir laplace-bark
cd laplace-bark
```
## 初始化项目
```
npm init -y
```
## 修改生成的 package.json，内容如下（用于 ESM 模式）：
```
{
  "name": "laplace-bark",
  "version": "1.0.0",
  "type": "module",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "ws": "^8.18.3",
    "https": "^1.0.0"
  }
}

```
## 安装依赖
```
npm install ws https
```