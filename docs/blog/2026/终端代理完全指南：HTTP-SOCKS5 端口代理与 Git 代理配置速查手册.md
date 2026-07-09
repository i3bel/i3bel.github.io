---
title: 终端代理完全指南：HTTP/SOCKS5 端口代理与 Git 代理配置速查手册
date: '2026-07-03T15:17:00+08:00'
summary: 一份面向开发者的终端代理配置速查手册，涵盖 HTTP/SOCKS5 代理（端口 6789）在 Windows、macOS、Linux 三大平台的设置与取消命令，以及 Git 全局/局部代理、SSH 代理的完整配置方案，附带一键脚本与常见问题排查。
tags:
- 终端代理
- Git代理
- HTTP代理
- SOCKS5代理
- 网络配置
- 开发环境
- 命令行工具
- 网络调试
- 速查手册
---

# 终端代理完全指南：HTTP/SOCKS5 端口代理与 Git 代理配置速查手册

## 写在前面

在开发工作中，终端代理是绕不开的基础配置。无论是拉取 GitHub 代码、下载 npm 依赖，还是访问海外 API，一个正确配置的终端代理能节省大量时间。

本文假设你的代理工具运行在本地，监听端口为 **6789**，协议支持 **HTTP** 和 **SOCKS5**。以下命令覆盖 **Windows（CMD/PowerShell）**、**macOS** 和 **Linux** 三大平台。

---

## 第一部分：终端 HTTP 代理配置（端口 6789）

### 1.1 临时设置（仅当前终端会话生效）

#### Windows CMD

```batch
set HTTP_PROXY=http://127.0.0.1:6789
set HTTPS_PROXY=http://127.0.0.1:6789
```

#### Windows PowerShell

```powershell
$env:HTTP_PROXY="http://127.0.0.1:6789"
$env:HTTPS_PROXY="http://127.0.0.1:6789"
```

#### macOS / Linux (Bash/Zsh)

```bash
export HTTP_PROXY=http://127.0.0.1:6789
export HTTPS_PROXY=http://127.0.0.1:6789
```

#### 验证代理是否生效

```bash
curl -I https://www.google.com
# 或
curl -v https://www.google.com 2>&1 | grep -i proxy
```

### 1.2 临时取消代理

#### Windows CMD

```batch
set HTTP_PROXY=
set HTTPS_PROXY=
```

#### Windows PowerShell

```powershell
Remove-Item Env:HTTP_PROXY
Remove-Item Env:HTTPS_PROXY
```

#### macOS / Linux

```bash
unset HTTP_PROXY
unset HTTPS_PROXY
```

### 1.3 永久设置（写入配置文件）

#### Windows（系统环境变量）

```batch
setx HTTP_PROXY "http://127.0.0.1:6789"
setx HTTPS_PROXY "http://127.0.0.1:6789"
```

> 设置后需**重启终端**生效。

#### macOS / Linux（写入 Shell 配置文件）

**Bash 用户**（`~/.bashrc`）：

```bash
echo 'export HTTP_PROXY=http://127.0.0.1:6789' >> ~/.bashrc
echo 'export HTTPS_PROXY=http://127.0.0.1:6789' >> ~/.bashrc
source ~/.bashrc
```

**Zsh 用户**（`~/.zshrc`）：

```bash
echo 'export HTTP_PROXY=http://127.0.0.1:6789' >> ~/.zshrc
echo 'export HTTPS_PROXY=http://127.0.0.1:6789' >> ~/.zshrc
source ~/.zshrc
```

### 1.4 永久取消代理

#### Windows

```batch
setx HTTP_PROXY ""
setx HTTPS_PROXY ""
```

#### macOS / Linux

编辑 `~/.bashrc` 或 `~/.zshrc`，删除或注释掉以下两行：

```bash
# export HTTP_PROXY=http://127.0.0.1:6789
# export HTTPS_PROXY=http://127.0.0.1:6789
```

然后执行：

```bash
source ~/.bashrc
# 或
source ~/.zshrc
```

---

## 第二部分：终端 SOCKS5 代理配置（端口 6789）

### 2.1 临时设置

SOCKS5 代理通常用于支持 SOCKS 协议的工具（如 `curl`、`git`、`ssh`）。

#### Windows CMD

```batch
set ALL_PROXY=socks5://127.0.0.1:6789
```

#### Windows PowerShell

```powershell
$env:ALL_PROXY="socks5://127.0.0.1:6789"
```

#### macOS / Linux

```bash
export ALL_PROXY=socks5://127.0.0.1:6789
```

### 2.2 临时取消

#### Windows CMD

```batch
set ALL_PROXY=
```

#### Windows PowerShell

```powershell
Remove-Item Env:ALL_PROXY
```

#### macOS / Linux

```bash
unset ALL_PROXY
```

### 2.3 使用 SOCKS5 代理执行命令

```bash
# curl 通过 SOCKS5 代理访问
curl --socks5 127.0.0.1:6789 https://www.google.com

# 或设置环境变量后使用
curl -x socks5://127.0.0.1:6789 https://www.google.com
```

---

## 第三部分：Git 代理配置

### 3.1 Git HTTP 代理（端口 6789）

#### 设置全局代理

```bash
git config --global http.proxy http://127.0.0.1:6789
git config --global https.proxy http://127.0.0.1:6789
```

#### 验证 Git 代理设置

```bash
git config --global --get http.proxy
git config --global --get https.proxy
```

#### 取消 Git 全局代理

```bash
git config --global --unset http.proxy
git config --global --unset https.proxy
```

### 3.2 Git SOCKS5 代理（端口 6789）

```bash
git config --global http.proxy socks5://127.0.0.1:6789
git config --global https.proxy socks5://127.0.0.1:6789
```

### 3.3 Git 局部代理（仅对特定仓库生效）

进入你的 Git 仓库目录，执行：

```bash
git config http.proxy http://127.0.0.1:6789
git config https.proxy http://127.0.0.1:6789
```

> 局部配置优先级高于全局配置，且仅对当前仓库生效。

#### 取消局部代理

```bash
git config --unset http.proxy
git config --unset https.proxy
```

### 3.4 Git SSH 代理配置

如果你使用 SSH 协议克隆仓库（如 `git@github.com:...`），需要配置 SSH 代理。

#### 编辑 SSH 配置文件

```bash
# macOS / Linux
nano ~/.ssh/config

# Windows
notepad %USERPROFILE%\.ssh\config
```

#### 添加以下内容

```text
Host github.com
    HostName github.com
    User git
    ProxyCommand nc -X 5 -x 127.0.0.1:6789 %h %p
```

> 如果 `nc` 命令不可用，Windows 用户可安装 Git Bash 或使用 `connect.exe`。

#### 替代方案：使用 HTTPS 代替 SSH

```bash
git config --global url."https://github.com/".insteadOf "git@github.com:"
```

---

## 第四部分：一键开关脚本

### 4.1 macOS / Linux 一键脚本

创建 `proxy.sh`：

```bash
#!/bin/bash

PROXY_PORT=6789

proxy_on() {
    export HTTP_PROXY=http://127.0.0.1:${PROXY_PORT}
    export HTTPS_PROXY=http://127.0.0.1:${PROXY_PORT}
    export ALL_PROXY=socks5://127.0.0.1:${PROXY_PORT}
    echo "✅ 代理已开启 (端口: ${PROXY_PORT})"
    echo "   HTTP_PROXY  = ${HTTP_PROXY}"
    echo "   HTTPS_PROXY = ${HTTPS_PROXY}"
    echo "   ALL_PROXY   = ${ALL_PROXY}"
}

proxy_off() {
    unset HTTP_PROXY
    unset HTTPS_PROXY
    unset ALL_PROXY
    echo "❌ 代理已关闭"
}

proxy_status() {
    echo "HTTP_PROXY  = ${HTTP_PROXY:-未设置}"
    echo "HTTPS_PROXY = ${HTTPS_PROXY:-未设置}"
    echo "ALL_PROXY   = ${ALL_PROXY:-未设置}"
}

case "$1" in
    on)  proxy_on ;;
    off) proxy_off ;;
    status) proxy_status ;;
    *)   echo "用法: source proxy.sh [on|off|status]" ;;
esac
```

**使用方法：**

```bash
# 开启代理
source proxy.sh on

# 关闭代理
source proxy.sh off

# 查看状态
source proxy.sh status
```

### 4.2 Windows PowerShell 一键脚本

创建 `proxy.ps1`：

```powershell
$ProxyPort = 6789

function Proxy-On {
    $env:HTTP_PROXY = "http://127.0.0.1:$ProxyPort"
    $env:HTTPS_PROXY = "http://127.0.0.1:$ProxyPort"
    $env:ALL_PROXY = "socks5://127.0.0.1:$ProxyPort"
    Write-Host "✅ 代理已开启 (端口: $ProxyPort)" -ForegroundColor Green
    Write-Host "   HTTP_PROXY  = $($env:HTTP_PROXY)"
    Write-Host "   HTTPS_PROXY = $($env:HTTPS_PROXY)"
    Write-Host "   ALL_PROXY   = $($env:ALL_PROXY)"
}

function Proxy-Off {
    Remove-Item Env:HTTP_PROXY -ErrorAction SilentlyContinue
    Remove-Item Env:HTTPS_PROXY -ErrorAction SilentlyContinue
    Remove-Item Env:ALL_PROXY -ErrorAction SilentlyContinue
    Write-Host "❌ 代理已关闭" -ForegroundColor Red
}

function Proxy-Status {
    Write-Host "HTTP_PROXY  = $($env:HTTP_PROXY)"
    Write-Host "HTTPS_PROXY = $($env:HTTPS_PROXY)"
    Write-Host "ALL_PROXY   = $($env:ALL_PROXY)"
}

switch ($args[0]) {
    "on"     { Proxy-On }
    "off"    { Proxy-Off }
    "status" { Proxy-Status }
    default  { Write-Host "用法: .\proxy.ps1 [on|off|status]" }
}
```

**使用方法：**

```powershell
# 开启代理
.\proxy.ps1 on

# 关闭代理
.\proxy.ps1 off

# 查看状态
.\proxy.ps1 status
```

---

## 第五部分：npm / pip / curl / wget 等工具代理

### 5.1 npm 代理

```bash
# 设置
npm config set proxy http://127.0.0.1:6789
npm config set https-proxy http://127.0.0.1:6789

# 取消
npm config delete proxy
npm config delete https-proxy
```

### 5.2 pip 代理

```bash
# 单次使用
pip install <package> --proxy http://127.0.0.1:6789

# 全局设置
pip config set global.proxy http://127.0.0.1:6789
```

### 5.3 curl 代理

```bash
# HTTP 代理
curl -x http://127.0.0.1:6789 https://www.google.com

# SOCKS5 代理
curl --socks5 127.0.0.1:6789 https://www.google.com
```

### 5.4 wget 代理

```bash
wget -e use_proxy=yes -e http_proxy=127.0.0.1:6789 https://example.com/file.zip
```

---

## 第六部分：常见问题排查

| 问题 | 排查步骤 |
|------|---------|
| 代理设置后不生效 | 1. 确认代理工具已启动并监听 6789 端口<br>2. 检查防火墙是否放行<br>3. 使用 `netstat -ano | findstr 6789`（Windows）或 `lsof -i :6789`（macOS/Linux）确认端口占用 |
| Git 克隆仍然超时 | 1. 确认使用的是 HTTPS 还是 SSH 协议<br>2. SSH 协议需额外配置 `~/.ssh/config`<br>3. 尝试 `git config --global url."https://".insteadOf "git://"` |
| 部分网站无法访问 | 检查是否需要排除国内地址，设置 `NO_PROXY`：<br>`export NO_PROXY="localhost,127.0.0.1,.cn,.com.cn"` |
| 代理速度很慢 | 1. 切换代理节点<br>2. 检查是否为 DNS 污染，尝试 `export DNS_SERVER=8.8.8.8`<br>3. 使用 `curl -w` 分析耗时 |
| Windows 下 `nc` 命令不存在 | 安装 Git for Windows，使用 Git Bash 终端，或安装 Nmap（内含 `ncat`） |
| PowerShell 执行策略限制 | 以管理员运行：`Set-ExecutionPolicy RemoteSigned` |

---

## 附录：环境变量速查表

| 变量名 | 作用范围 | 示例值 |
|--------|---------|--------|
| `HTTP_PROXY` | HTTP 请求 | `http://127.0.0.1:6789` |
| `HTTPS_PROXY` | HTTPS 请求 | `http://127.0.0.1:6789` |
| `ALL_PROXY` | 所有协议（SOCKS5） | `socks5://127.0.0.1:6789` |
| `NO_PROXY` | 不走代理的地址 | `localhost,127.0.0.1,.cn` |
| `http_proxy` | 小写兼容（部分工具） | `http://127.0.0.1:6789` |
| `https_proxy` | 小写兼容（部分工具） | `http://127.0.0.1:6789` |

---

## 下一步

1. **将一键脚本加入 Shell 启动文件**，实现自动开关代理
2. **配置 IDE 代理**：VS Code、JetBrains 系列等需在设置中同步代理配置
3. **Docker 代理**：修改 `~/.docker/config.json` 或在 Daemon 设置中添加代理
4. **系统级代理**：在 macOS/Windows 系统网络设置中配置全局代理，终端自动继承

---

> 📌 **本文档最后更新**：2026-07-03
