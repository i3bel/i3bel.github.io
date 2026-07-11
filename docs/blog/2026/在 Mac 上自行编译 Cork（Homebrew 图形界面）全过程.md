---
title: 在 Mac 上自行编译 Cork（Homebrew 图形界面）全过程
date: '2026-07-11T00:00:00+08:00'
summary: 记录用 Xcode 26.5 在 Mac 上从源码编译开源 Homebrew GUI 工具 Cork 的完整过程，包括 Tuist/Mise 环境搭建、签名配置与常见的"编译很慢"问题排查。
tags:
- macOS
- Cork
- Homebrew
- Xcode
- Tuist
- 建站
---

# 在 Mac 上自行编译 Cork（Homebrew 图形界面）全过程

> 本文记录了如何在 macOS 上从源码编译 [Cork](https://github.com/buresdv/Cork) —— 一个用 SwiftUI 写的 Homebrew 图形界面工具。Cork 官方提供付费预编译版本，但源码是公开的，个人自行编译使用完全免费（License 为 Commons Clause，不能出售或分发编译产物，但自用没问题）。全程使用 Xcode 26.5 测试通过。

---

## 背景

Cork 项目用 [Tuist](https://tuist.io/) 来生成 Xcode 工程，而不是直接提交 `.xcodeproj`，目的是加快团队协作时的工程生成速度。这意味着编译前需要先装好 Tuist 及其版本管理工具 Mise，再用命令行生成工程，最后在 Xcode 里手动调整签名配置才能正常 Archive 打包。

---

## 环境要求

- macOS Ventura 或更新版本
- Xcode 16 及以上（本文使用 Xcode 26.5）
- Git
- Homebrew

---

## 第一步：准备 Apple Developer 账号

编译 Cork 需要用本地签名证书，免费的 Apple ID 即可，不需要付费开发者账号。

1. 前往 [developer.apple.com](https://developer.apple.com/) 用 Apple ID 注册开发者账号（免费）
2. 终端执行，让命令行工具指向 Xcode：

```bash
sudo xcode-select -s /Applications/Xcode.app
```

3. Xcode 菜单栏 `Xcode → Settings → Accounts`，添加你的 Apple 账号
4. 账号出现在左侧列表后选中它，点底部的 `Manage Certificates...`
5. 左下角点 **+**，选择 `Apple Development`，生成一个本地开发证书
6. 出现证书后点 `Done` 关闭窗口

---

## 第二步：安装 Mise

Cork 用 Mise 来锁定 Tuist 版本，避免团队成员之间版本不一致导致工程生成结果不同。

```bash
curl https://mise.run | sh
```

安装完成后终端会提示一条激活命令，**必须使用终端里实际显示的那一条**，路径因人而异：

```bash
echo "eval \"\$(/Users/你的用户名/.local/bin/mise activate zsh)\"" >> "/Users/你的用户名/.zshrc"
```

执行后让配置立即生效：

```bash
source ~/.zshrc
```

验证是否安装成功：

```bash
mise --version
```

有版本号输出（如 `2026.7.5 macos-arm64`）即表示成功。

> **提示**：如果不确定自己用的是什么 shell，运行 `echo $SHELL` 查看，macOS 默认是 zsh。

---

## 第三步：安装 Tuist

```bash
mise install tuist
```

这一步会下载安装 Tuist，耐心等待即可。

---

## 第四步：克隆源码并生成工程

建议先去 [Cork 的 Releases 页面](https://github.com/buresdv/Cork/releases) 确认最新的正式版本号（如 `v1.7.5`），编译 `main` 分支最新提交可能会遇到未完成的功能或已知 bug。

```bash
git clone https://github.com/buresdv/Cork.git
cd Cork
mise exec tuist@4.50.2 -- tuist install
mise exec tuist@4.50.2 -- tuist generate --no-binary-cache
```

**这几条命令分别做了什么：**

| 命令 | 作用 |
| --- | --- |
| `git clone` | 下载 Cork 源码 |
| `cd Cork` | 进入项目目录 |
| `tuist install` | 下载 Cork 的所有依赖（Swift Package 等） |
| `tuist generate --no-binary-cache` | 生成 Xcode 工程并自动打开，`--no-binary-cache` 表示依赖全部从源码编译，不使用预编译缓存 |

Mise 首次运行会询问是否信任本地的 `.mise.toml` 文件，选 Yes 或 No 都可以（选 Yes 会在当前目录固定使用 Tuist 4.50.2）。

命令跑完后 Xcode 会自动打开生成好的工程。

---

## 第五步：在 Xcode 里配置本地签名

这一步是整个流程里**最容易出错、也最关键**的一步。

1. 左侧文件导航栏，点最顶部的 `Cork`（App Store 图标那一项，代表工程本身）
2. 右侧面板顶部点 `Signing & Capabilities`
3. `Signing` 下，把 `Team` 下拉框改成 `None`
4. `Signing → macOS` 下，把 `Signing Certificate` 改成 `Sign to Run Locally`
5. 确认 Xcode 工具栏里的 Build Scheme 已经选中 `Self-Compiled`

> **警告**：如果 Build Scheme 没有选对，编译出来的 Cork 运行时会一直提示要求输入 License。这是官方特意设计的机制，用来区分"付费预编译版"和"自行编译版"。

另外，官方 README 特别提醒：**除了上面这几项，不要改动 Xcode 里任何其他设置，也不要点"接受"任何 Xcode 弹出的推荐修复（Recommended Fixes）**，否则可能导致编译产物无法正常运行。

---

## 第六步：Archive 打包

1. 菜单栏 `Product → Archive`，开始编译打包
2. 编译完成后会弹出一个新窗口，选中列表最上面那一行（也就是刚编译出来的这次 Archive）
3. 点右侧 `Distribute App`
4. 弹窗里选 `Custom`，点右下角 `Next`
5. 点 `Copy App`
6. 打开系统弹出的文件夹，把里面的 `Cork.app` 拖到 `/Applications/` 目录

完成后就可以像正常 App 一样在启动台里打开 Cork 了。

---

## 踩坑记录：Archive 编译进度卡住不动

第一次 Archive 时会看到类似 `Building 2046/2531` 这样的进度长时间停在原地，很容易以为卡死了，实际上大概率是正常现象。

**原因**：`tuist generate` 命令带了 `--no-binary-cache` 参数，所有依赖模块都要从源码重新编译，不走任何预编译缓存，首次全量编译一个 SwiftUI 项目通常需要 **10～30 分钟**，具体取决于 Mac 性能。

**排查方法**：打开"活动监视器"（Activity Monitor），查看 `swift-frontend`、`clang`、`xcodebuild` 这几个进程的 CPU 占用：

- CPU 占用较高（几十到上百 %）→ 仍在正常编译，耐心等待即可
- CPU 占用接近 0，且持续卡住超过 5～10 分钟 → 可能是签名或依赖出了问题，需要单独排查

顺带一提，编译期间风扇狂转、机身发热也是正在全力编译的正常表现。

---

## License 说明

Cork 使用 [Commons Clause](https://commonsclause.com) 协议：源码开放，可以自由查看、修改、贡献代码，但**不能出售或对外分发**编译好的版本（包括修改版）；如果想分发编译产物需要先联系作者本人。个人自行编译、自己使用完全没有限制。

---

## 参考链接

- [Cork GitHub 仓库](https://github.com/buresdv/Cork)
- [Cork 官网](https://corkmac.app)
- [Tuist 官方文档](https://tuist.io/)
- [Mise 官方文档](https://mise.jdx.dev/)
