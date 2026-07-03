---
title: 5分钟极速上手：Cloud Code + DeepSeek V4 国产大模型接入全指南
date: '2026-07-03T14:56:00+08:00'
summary: 从零开始，5分钟完成 Cloud Code 命令行工具的安装、环境配置与 DeepSeek V4 国产大模型接入。涵盖 Node.js、Git、CC Switch 的安装步骤，配置文件修改，以及通过 Xcode 环境变量实现 Claude 协议对接 DeepSeek 的完整方案，助你快速构建个人 AI 自动化工作流。
tags:
- Cloud Code
- DeepSeek
- AI工具
- 命令行工具
- 国产大模型
- 自动化工作流
- 效率工具
- Node.js
- Git
- CC Switch
---

# 5分钟极速上手：Cloud Code + DeepSeek V4 国产大模型接入全指南

## 写在前面

**Cloud Code** 是一款功能强大的命令行 AI 工具，内置丰富的 Skills 插件系统。通过不同插件的组合，它能完成许多传统 AI 无法实现的自动化任务，显著提升工作与学习效率。

**典型应用场景包括：**
- 构建个人知识机器库，自动化整理学习笔记（支持增删改查）
- 按预设规则定时搜集行业资讯，自动整理成文稿
- 一键发布内容到各大社交媒体平台

本指南将带你从零开始，在 **5 分钟内**完成全套环境搭建与 DeepSeek V4 模型接入。

---

## 第一步：安装 Cloud Code 运行环境

### 1.1 安装 Node.js

Cloud Code 基于 Node.js 运行，需先安装运行环境。

1. 打开浏览器，搜索 **Node.js**，进入官网
2. 点击 **"获取 Node.js"**
3. 页面下滑，选择左侧的 **Windows 安装程序**
4. 下载安装包，双击运行，**一路点击"下一步"**完成安装

**验证安装是否成功：**

按 `Win` 键搜索 **CMD**，右键选择**"以管理员身份运行"**，依次输入以下命令：

```bash
node -v
npm -v
```

当显示版本号（如 `v20.x.x`），说明安装成功。

### 1.2 配置国内镜像源

为方便国内网络环境下的依赖安装，配置 npm 国内镜像：

```bash
npm config set registry https://registry.npmmirror.com
```

### 1.3 安装 Git

Git 是 Cloud Code 部分功能的依赖工具。

1. 浏览器搜索 **Git**，进入官网
2. 页面下滑至 **"在 Windows 下安装"** 区域
3. 点击链接进入下载页，选择对应版本的安装包（如 **Windows x64**）
4. 下载完成后双击安装，**一路点击"下一步"**

**验证 Git 安装：**

重新打开 CMD，输入：

```bash
git --version
```

显示版本号即表示安装成功。

### 1.4 安装 CC Switch

**CC Switch** 是 Cloud Code 的模型接入管理工具，通过它可以将自己的大模型 API 接入到 Cloud Code 中使用。

1. 打开 **GitHub**，搜索 **cc-switch**
2. 选择对应仓库，页面下滑，点击右侧的 **Releases**
3. 在列表中选择对应版本的安装包（推荐选择 **Windows MSI**）
4. 点击下载，完成后双击安装，**一路点击"下一步"**

---

## 第二步：安装并配置 Cloud Code

### 2.1 安装 Cloud Code

在命令行（CMD）中输入以下命令：

```bash
npm install -g @anthropic-ai/cloud-code
```

显示安装成功提示后，**关闭 CMD 并重新打开**，输入以下命令验证：

```bash
cloud --version
```

输出版本号说明安装成功。

### 2.2 启动 Cloud Code 控制台

输入以下命令启动：

```bash
cloud
```

首次启动会输出初始化信息。此时需要修改配置文件，**跳过登录步骤**。

### 2.3 修改配置文件

1. 打开**资源管理器**，在地址栏中输入 `%USERPROFILE%` 并回车
2. 若看不到隐藏文件，点击工具栏 **"查看" → "显示"**，勾选：
   - ✅ **文件扩展名**
   - ✅ **隐藏文件**
3. 找到并打开 **`.cloud.json`** 文件（右键选择"记事本"打开）
4. 在文件中增加以下内容：

```json
{
  "hasCompletedOnboarding": true
}
```

> ⚠️ **重要提示**：
> - 必须使用**英文标点符号**
> - 每个配置项后需加**英文逗号**分隔
> - 很多配置不生效的原因就是标点符号错误或使用了中文标点

5. **保存并关闭**文件

### 2.4 重新启动

回到 CMD，再次输入：

```bash
cloud
```

启动后会弹出选项询问是否信任当前文件夹，选择 **"相信"** 即可，成功跳过登录步骤。

---

## 第三步：接入 DeepSeek V4

### 3.1 获取 DeepSeek API Key

1. 打开 [DeepSeek 官网](https://www.deepseek.com)，进入 **API 开放平台**
2. 注册并登录账号（需保证账户有一定余额）
3. 选择右侧的 **API Keys**，滑到最底部
4. 点击 **"创建 API Key"**
5. 输入密钥名称（任意命名即可），点击创建
6. 弹出页面后，**立即点击"复制"**

> 🔒 **安全提醒**：
> - API Key 关闭页面后**无法再次获取**，必须重新创建
> - **切勿将 API Key 分享给他人**，否则将产生你的账户费用

### 3.2 在 CC Switch 中配置 DeepSeek

1. 打开 **CC Switch** 软件
2. 点击右上角 **"+"** 号添加新配置
3. 在**模型预设**下拉栏中选择 **DeepSeek**
4. 下滑填入刚才获取的 **API Key**
5. 将下方模型名称替换为：

```
deepseek-v4-pro【1m】
```

> 💡 `【1m】` 表示上下文窗口为 100 万 tokens。如果不加此标识，Cloud Code 会默认按 128K 上下文处理。

6. 配置完毕后，点击右下角 **"添加"** 按钮

### 3.3 验证模型接入

重新打开 CMD，输入：

```bash
cloud
```

在对话框中输入以下命令查看已配置的模型：

```
/models
```

也可以直接询问：

```
当前是什么模型？
```

确认返回 DeepSeek V4 相关信息，即表示接入成功。

---

## 第四步：使用 Cloud Code 做项目

### 4.1 创建项目文件夹

1. 在桌面新建一个文件夹（任意命名）
2. 打开文件夹，在上方地址栏中输入 `cmd` 并回车，打开命令提示符
3. 输入以下命令启动 Cloud Code：

```bash
cloud
```

4. 选择 **"信任当前文件夹"**

### 4.2 让 AI 生成项目

在对话框中输入你的需求，例如：

```
使用 HTML + JS + CSS 做一个 Todo 软件
```

按回车发送。运行途中 Cloud Code 会向你申请各种工具权限，点击 **Yes** 即可。

等待 AI 完成任务后会通知你，让它帮你打开即可查看效果。

> 📝 **提示**：当前生成的页面为基础版本。后续添加相关 Skills 插件后，功能会更加完善。

---

## 附录：Xcode 环境变量配置（Claude 协议对接 DeepSeek）

如果你需要在 Xcode 中配置 CC Switch 和 Claude 的文件，使用以下环境变量配置：

```json
{
  "env": {
    "ANTHROPIC_BASE_URL": "https://api.deepseek.com/anthropic",
    "ANTHROPIC_AUTH_TOKEN": "你的 DeepSeek API Key",
    "ANTHROPIC_MODEL": "deepseek-v4-pro【1m】",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "deepseek-v4-flash",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "deepseek-v4-flash",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "deepseek-v4-pro【1m】"
  },
  "includeCoAuthoredBy": false,
  "effortLevel": "max"
}
```

### 配置说明

| 环境变量 | 说明 |
|---------|------|
| `ANTHROPIC_BASE_URL` | DeepSeek 的 Anthropic 兼容接口地址 |
| `ANTHROPIC_AUTH_TOKEN` | 你的 DeepSeek API Key |
| `ANTHROPIC_MODEL` | 默认主模型（推荐 `deepseek-v4-pro【1m】`） |
| `ANTHROPIC_DEFAULT_HAIKU_MODEL` | 轻量级任务模型（推荐 `deepseek-v4-flash`） |
| `ANTHROPIC_DEFAULT_SONNET_MODEL` | 中等复杂度任务模型（推荐 `deepseek-v4-flash`） |
| `ANTHROPIC_DEFAULT_OPUS_MODEL` | 高复杂度任务模型（推荐 `deepseek-v4-pro【1m】`） |
| `includeCoAuthoredBy` | 是否包含共同作者信息 |
| `effortLevel` | AI 输出努力程度（`max` 为最高） |

---

## 常见问题速查

| 问题 | 解决方案 |
|------|---------|
| 配置文件修改后不生效 | 检查是否使用了中文标点，确认每个配置项后有英文逗号 |
| npm 安装速度慢 | 已配置国内镜像源，如仍慢可尝试更换其他镜像 |
| API Key 无法复制 | 关闭弹窗后需重新创建，务必第一时间复制 |
| Cloud Code 启动报错 | 确认 Node.js 和 Git 均已正确安装并重启 CMD |
| 模型回复不符合预期 | 检查 CC Switch 中模型名称是否包含 `【1m】` 标识 |

---

## 下一步

完成以上配置后，你可以：

1. **探索 Skills 插件**：Cloud Code 内置多种 Skills，尝试不同组合解锁更多自动化能力
2. **构建个人知识库**：利用 AI 自动整理、分类、检索你的学习笔记
3. **搭建内容自动化流**：设置定时任务，自动搜集行业资讯并生成发布文稿
4. **接入更多模型**：CC Switch 支持多模型管理，可按需配置不同场景的最优模型

---

> 📌 **本文档最后更新**：2026-07-03
