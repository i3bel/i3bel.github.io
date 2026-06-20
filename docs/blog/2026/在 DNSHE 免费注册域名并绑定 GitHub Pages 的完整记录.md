---
title: 在 DNSHE 免费注册域名并绑定 GitHub Pages 的完整记录
date: '2026-06-20T10:12:03+08:00'
summary: 记录通过 DNSHE 免费注册 i3bel.cc.cd 域名，并解析到 i3bel.github.io 的全过程，包含配置步骤和一年续期提醒。
tags:
- 域名
- GitHub Pages
- DNSHE
- 博客
- 免费域名
- 建站
---

# 在 DNSHE 免费注册域名并绑定 GitHub Pages 的完整记录

&gt; 本文记录了我通过 DNSHE 免费注册域名 `i3bel.cc.cd`，并将其解析到 GitHub Pages 的全过程，作为个人博客的自定义域名使用。

---

## 背景

之前一直使用 `i3bel.github.io` 作为博客地址，虽然 GitHub Pages 本身免费且稳定，但默认的 `github.io` 子域名在记忆和个性化方面还是差了一些。正好了解到 [DNSHE](https://my.dnshe.com/) 提供永久免费的 `.cc.cd` 等后缀域名，于是决定折腾一下，给博客换一个更短、更有辨识度的域名。

DNSHE 是一个面向开发者和开源爱好者的免费域名与 DNS 服务平台，提供 `.de5.net`、`.us.ci`、`.cc.cd` 等免费二级域名，支持全功能 DNS 解析和全球 Anycast 网络。citeweb_search:2#6

---

## 注册域名

1. 访问 [DNSHE 注册页面](https://my.dnshe.com/)，使用用户名 `i3bel` 登录（密码保存在 Chrome 浏览器密码管理器中）。
2. 进入域名注册界面，选择 `.cc.cd` 后缀。
3. 输入前缀 `i3bel`，检查可用性后完成注册。
4. 注册成功后，在域名管理后台可以看到 `i3bel.cc.cd` 已生效。

---

## DNS 解析配置

由于我的博客托管在 GitHub Pages 上，需要将域名指向 `i3bel.github.io`。DNSHE 支持 CNAME 记录，配置步骤如下：

1. 进入 DNSHE 域名管理后台，找到 `i3bel.cc.cd` 的 DNS 解析设置。
2. 添加一条 **CNAME 记录**：
   - **主机记录**：`@`（或留空，表示根域名）
   - **记录类型**：`CNAME`
   - **记录值**：`i3bel.github.io`
   - **TTL**：默认即可
3. 保存配置，等待 DNS 生效（通常几分钟到几小时）。

&gt; **注意**：DNSHE 的免费域名需要**每年手动刷新**一次，否则会被回收。我会在下方设置提醒，一年后来续期。

---

## GitHub Pages 配置自定义域名

1. 打开博客对应的 GitHub 仓库（`i3bel/i3bel.github.io`）。
2. 进入 **Settings → Pages**。
3. 在 **Custom domain** 栏输入 `i3bel.cc.cd`，点击 **Save**。
4. GitHub 会自动进行 DNS 检查，验证通过后会自动生成 `CNAME` 文件。
5. 勾选 **Enforce HTTPS**，让 GitHub 自动申请 SSL 证书，实现 HTTPS 访问。citeweb_search:2#0

---

## 验证与访问

配置完成后，等待 DNS 传播生效（通常几分钟到 24 小时），然后：

- 在浏览器访问 `https://i3bel.cc.cd`，确认能正常打开博客首页。
- 检查地址栏是否显示安全锁标志（HTTPS 已启用）。
- 同时访问 `https://i3bel.github.io`，确认会自动跳转到 `i3bel.cc.cd`。

---

## 一年后续期提醒

⚠️ **DNSHE 免费域名需要每年手动刷新一次，否则会被系统回收。**

&gt; **下次续期时间：2027-06-20**

建议操作：
- 在日历中设置 2027 年 6 月的提醒。
- 登录 [DNSHE](https://my.dnshe.com/) 进入域名管理，找到续期/刷新按钮。
- 刷新成功后，DNS 解析记录通常会保留，无需重新配置。

---

## 总结

整个流程非常顺畅，从注册域名到解析生效大约花了 10 分钟。DNSHE 的免费域名对于个人博客、学习项目来说完全够用，配合 GitHub Pages 的免费托管，可以实现零成本建站。唯一需要注意的是每年手动刷新域名，避免被回收。

---

## 参考链接

- [DNSHE 免费域名注册](https://my.dnshe.com/)
- [GitHub Pages 自定义域名官方文档](https://docs.github.com/zh/pages/configuring-a-custom-domain-for-your-github-pages-site)