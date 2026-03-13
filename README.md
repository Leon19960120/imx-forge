<div align="center">


```
██╗███╗   ███╗██╗  ██╗      ███████╗ ██████╗ ██████╗  ██████╗ ███████╗
██║████╗ ████║╚██╗██╔╝      ██╔════╝██╔═══██╗██╔══██╗██╔════╝ ██╔════╝
██║██╔████╔██║ ╚███╔╝ █████╗█████╗  ██║   ██║██████╔╝██║  ███╗█████╗  
██║██║╚██╔╝██║ ██╔██╗ ╚════╝██╔══╝  ██║   ██║██╔══██╗██║   ██║██╔══╝  
██║██║ ╚═╝ ██║██╔╝ ██╗      ██║     ╚██████╔╝██║  ██║╚██████╔╝███████╗
╚═╝╚═╝     ╚═╝╚═╝  ╚═╝      ╚═╝      ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚══════╝
```

**面向 NXP i.MX6ULL 开发板的开源锻造工坊 —— 补丁、构建脚本与教程文档，从正点原子阿尔法到自制板，一次集结，随时开打。**

🌐 语言: **中文** | [English](assets/README_EN.md)

[![License](https://img.shields.io/badge/License-MIT-orange?style=flat-square)](LICENSE)
[![Boards](https://img.shields.io/badge/Boards-IMX6ULL-blue?style=flat-square)](#支持的开发板)
[![Kernel Track](https://img.shields.io/badge/Kernel-linux--imx_%7C_mainline_(WIP)-blueviolet?style=flat-square)](#技术路线)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)](#贡献方式)

</div>

---

## ⚒️ 什么是 IMX-Forge？

IMX-Forge 是一个**个人维护的开源工作空间**，专注于将 NXP i.MX6ULL 平台开发板快速引导成可运行的嵌入式系统。

它把那些通常散落在 NXP 官方 BSP、论坛帖子、正点原子教程、深夜串口调试记录里的内容统一整理起来：

- 🩹 **内核与 U-Boot 补丁** —— 基于 `format-patch + series` 管理，区分 `[linux-imx]` 与 `[mainline]` 双轨
- 🛠️ **构建工具脚本** —— 统一封装 build、flash、menuconfig 与环境初始化流程
- 📖 **教程文档** —— 从工具链到 U-Boot 到内核的完整学习路径
- 📦 **第三方源码** —— Git Submodule 管理 U-Boot NXP fork

> 不再翻找厂商 Wiki。`clone → source → build → flash` —— 这是约定。

> 参考 [document/todo](document/todo/) 了解项目计划与待办事项

---

## 🎯 支持的开发板

| 板卡         | 芯片     | 存储      | 状态     | 备注                  |
| ------------ | -------- | --------- | -------- | --------------------- |
| 正点原子阿尔法 | i.MX6ULL | eMMC / SD | 🚧 进行中 | 首要支持目标          |
| 自制板 v1    | i.MX6ULL | eMMC / SD | 📋 规划中 | 通过 DTB Overlay 接入 |

---

## 🧭 技术路线

IMX-Forge 采用**双轨并行**策略，稳定优先，长期向上游靠拢：

```
                    ┌─────────────────────────────┐
                    │        v0.x  [当前]          │
                    │  linux-imx (NXP BSP 6.12.3)   │
                    │  U-Boot NXP fork             │
                    └──────────────┬──────────────┘
                                   │ 补丁向上游提交 / 移植
                    ┌──────────────▼──────────────┐
                    │        v1.x  [中期]          │
                    │  + mainline kernel 初步支持  │
                    │  + U-Boot mainline track     │
                    └──────────────┬──────────────┘
                                   │ mainline 趋于稳定
                    ┌──────────────▼──────────────┐
                    │        v2.x  [长期]          │
                    │  mainline 成为推荐轨道        │
                    │  linux-imx 作为兼容备选       │
                    └─────────────────────────────┘
```

补丁按来源打标区分，清晰可追溯：

```
patches/
├── linux-imx/          # [linux-imx] 标签，跟随 NXP BSP
├── linux-mainline/     # [mainline]  标签，面向上游（未来）
└── uboot/              # U-Boot 补丁集
```

---

## 🚧 当前重点方向

- [ ] 正点原子阿尔法板卡支持完善（eMMC / SD 双存储路径）
- [ ] ARM GNU Toolchain 版本锁定 + 构建环境配置
- [ ] U-Boot 发布包构建脚本完善
- [ ] 内核与 U-Boot 补丁规范确定
- [ ] 教程文档完善（工具链 → U-Boot → 内核）

完整路线图见 [roadmap.md](roadmap.md)。

---

## 🤝 贡献方式

欢迎提交 PR 与 Issue，特别注意：

- Patch 命名规范（`[linux-imx]` / `[mainline]` 前缀）

---

## 📄 开源协议

MIT LICENSE —— 详见 [LICENSE](LICENSE)。

若补丁源自 GPL 授权的 linux-imx 或 NXP U-Boot，则保留其原始 GPL-2.0 许可证。

---

<div align="center">


**用 🔥 和无数串口终端堆出来的工程。希望我们可以更方便地自定义自己的 i.MX6ULL 系统。**

</div>
