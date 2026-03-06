<div align="center">


```
██╗███╗   ███╗██╗  ██╗      ███████╗ ██████╗ ██████╗  ██████╗ ███████╗
██║████╗ ████║╚██╗██╔╝      ██╔════╝██╔═══██╗██╔══██╗██╔════╝ ██╔════╝
██║██╔████╔██║ ╚███╔╝ █████╗█████╗  ██║   ██║██████╔╝██║  ███╗█████╗  
██║██║╚██╔╝██║ ██╔██╗ ╚════╝██╔══╝  ██║   ██║██╔══██╗██║   ██║██╔══╝  
██║██║ ╚═╝ ██║██╔╝ ██╗      ██║     ╚██████╔╝██║  ██║╚██████╔╝███████╗
╚═╝╚═╝     ╚═╝╚═╝  ╚═╝      ╚═╝      ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚══════╝
```

**面向 NXP i.MX6ULL 开发板的开源锻造工坊 —— 驱动、补丁、Rootfs 配置与构建脚本，从正点原子阿尔法到自制板，一次集结，随时开打。**

🌐 语言: **中文** | [English](assets/README_EN.md)

[![License](https://img.shields.io/badge/License-MIT-orange?style=flat-square)](LICENSE)
[![Boards](https://img.shields.io/badge/Boards-IMX6ULL-blue?style=flat-square)](#支持的开发板)
[![Kernel Track](https://img.shields.io/badge/Kernel-linux--imx_%7C_mainline_(WIP)-blueviolet?style=flat-square)](#技术路线)
[![CI](https://img.shields.io/github/actions/workflow/status/yourname/imx-forge/ci-patch-validate.yml?label=Patch%20CI&style=flat-square)](https://github.com/yourname/imx-forge/actions)
[![Patches](https://img.shields.io/badge/dynamic/json?url=https://raw.githubusercontent.com/yourname/imx-forge/main/meta/stats.json&query=$.total_patches&label=Patches&style=flat-square&color=ff6600)](patches/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)](CONTRIBUTING.md)

</div>

---

## ⚒️ 什么是 IMX-Forge？

IMX-Forge 是一个**个人维护的开源工作空间**，专注于将 NXP i.MX6ULL 平台开发板快速引导成可运行的嵌入式系统。

它把那些通常散落在 NXP 官方 BSP、论坛帖子、正点原子教程、深夜串口调试记录里的内容统一整理起来：

- 🔩 **自研驱动** —— 独立内核模块，附带每块板卡的兼容性元数据
- 🩹 **内核与 U-Boot 补丁** —— 基于 `format-patch + series` 管理，区分 `[linux-imx]` 与 `[mainline]` 双轨，通过 CI 校验
- 📦 **Rootfs 配置** —— 覆盖 Buildroot / Debian / busybox 三种方案，支持包级补丁
- 🛠️ **构建工具脚本** —— 统一封装 build、flash、menuconfig 与环境初始化流程
- 🌲 **DTB Overlay 支持** —— 无需修改主 DTS，即可扩展外设，自制板友好
- 🖥️ **应用示例** —— Qt UI、工业协议（CAN/RS485/Modbus）、V4L2 摄像头、传感器驱动及 OTA 框架集成
- 🐳 **容器化构建环境** —— Docker / WSL2 / macOS 均可复现，彻底隔离宿主机依赖

> 不再翻找厂商 Wiki。`clone → source → build → flash` —— 这是约定。

---

## 🎯 支持的开发板

| 板卡                             | 芯片     | 存储      | 状态     | 备注                  |
| -------------------------------- | -------- | --------- | -------- | --------------------- |
| [正点原子 阿尔法](boards/alpha/) | i.MX6ULL | eMMC / SD | 🚧 进行中 | 首要支持目标          |
| 自制板 v1                        | i.MX6ULL | eMMC / SD | 📋 规划中 | 通过 DTB Overlay 接入 |

> 想接入自己的板？参阅 [boards/README.md](boards/README.md) 了解板卡描述规范（`BOARD.yaml`）。

---

## 🧭 技术路线

IMX-Forge 采用**双轨并行**策略，稳定优先，长期向上游靠拢：

```
                    ┌─────────────────────────────┐
                    │        v0.x  [当前]          │
                    │  linux-imx (NXP BSP 5.15)   │
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

## 📦 Rootfs 方案

| 方案                | 适用场景            | 说明                                  |
| ------------------- | ------------------- | ------------------------------------- |
| **Buildroot**       | 工业控制 / 最小系统 | 体积小，启动快，适合资源受限场景      |
| **Debian / Ubuntu** | Qt 应用 / 应用开发  | apt 生态，开发调试方便                |
| **busybox**         | 教学 / 极简验证     | 手工构建，适合深入理解 Linux 启动流程 |

---

## 🖥️ 应用示例方向

IMX-Forge 的示例层面向**工业控制 + 人机交互**两大场景，i.MX6ULL 没有 NPU/GPU，但它本就是工业主控的常客：

| 目录                   | 内容                                       |
| ---------------------- | ------------------------------------------ |
| `examples/qt/`         | Qt5 Framebuffer / EGLFS 示例，触摸屏 UI    |
| `examples/industrial/` | CAN、RS485、Modbus RTU/TCP 收发示例        |
| `examples/camera/`     | V4L2 摄像头采集与 MJPEG 推流               |
| `examples/sensors/`    | I²C / SPI 传感器驱动示例（温湿度、IMU 等） |
| `examples/ota/`        | SWUpdate 集成示例（规划中）                |

---

## 🔩 驱动模块

每个驱动模块须附带完整的 `METADATA.yaml`，格式如下：

```yaml
name: imx6ull-rs485
description: RS485 半双工驱动，支持自动方向控制
chip: imx6ull
boards:
  - alpha
  - custom-v1
kernel_tracks:
  - linux-imx
  - mainline       # 若已适配
license: GPL-2.0
maintainer: yourname
tested_on: 2025-01-01
```

---

## 🛠️ 快速开始

### 1. 克隆仓库

```bash
git clone --recurse-submodules https://github.com/yourname/imx-forge.git
cd imx-forge
```

### 2. 初始化构建环境

**方式一：Docker（推荐，跨平台）**

```bash
docker build -t imx-forge-env docker/
docker run -it --rm -v $(pwd):/workspace imx-forge-env
```

**方式二：本地 Ubuntu x86_64**

```bash
source scripts/env-init.sh
```

### 3. 选择板卡并构建

```bash
# 正点原子阿尔法 + Buildroot
./scripts/build.sh --board alpha --rootfs buildroot

# 正点原子阿尔法 + Debian
./scripts/build.sh --board alpha --rootfs debian
```

### 4. 烧录

```bash
./scripts/flash.sh --board alpha --image output/imx6ull-alpha.img --target /dev/sdX
```

---

## 📁 项目结构

```
imx-forge/
├── boards/
│   ├── alpha/              # 正点原子阿尔法
│   │   ├── BOARD.yaml      # 板卡元数据
│   │   ├── dts/            # 板级 DTS / DTB Overlay
│   │   └── configs/        # defconfig 快照
│   └── custom-v1/          # 自制板
├── patches/
│   ├── linux-imx/          # NXP BSP 内核补丁
│   ├── linux-mainline/     # mainline 轨道补丁（未来）
│   └── uboot/              # U-Boot 补丁集
├── rootfs/
│   ├── buildroot/          # BR2 外部目录结构
│   ├── debian/             # debootstrap + 后处理脚本
│   └── busybox/            # 手工构建最小系统
├── drivers/                # 独立内核模块
├── examples/               # 应用示例
│   ├── qt/
│   ├── industrial/
│   ├── camera/
│   ├── sensors/
│   └── ota/
├── scripts/                # build / flash / menuconfig 封装
├── docker/                 # 容器化构建环境
├── docs/                   # 中文文档
├── meta/                   # stats.json 等 CI 元数据
├── BOARD.yaml.template     # 板卡描述模板
├── CONTRIBUTING.md
├── ROADMAP.md
└── LICENSE
```

---

## 🚧 当前重点方向

- [ ] 正点原子阿尔法板卡支持完善（eMMC / SD 双存储路径）
- [ ] ARM GNU Toolchain 版本锁定 + Docker 构建环境
- [ ] Buildroot 外部目录结构搭建
- [ ] DTB Overlay 机制验证与示例
- [ ] 常用脚本整理（build / flash / menuconfig）
- [ ] 驱动模块 `METADATA.yaml` 规范确定
- [ ] RS485 / CAN 驱动示例
- [ ] Qt5 Framebuffer Hello World 示例
- [ ] Patch CI 校验流程（GitHub Actions）

完整路线图见 [ROADMAP.md](ROADMAP.md)。

---

## 🤝 贡献方式

欢迎提交 PR 与 Issue，请先阅读 [CONTRIBUTING.md](CONTRIBUTING.md)，特别注意：

- Patch 命名规范（`[linux-imx]` / `[mainline]` 前缀）
- 新增驱动必须附带完整的 `METADATA.yaml`
- 新增板卡必须附带完整的 `BOARD.yaml`
- 示例代码须在对应板卡上实测通过

---

## 📄 开源协议

MIT LICENSE —— 详见 [LICENSE](LICENSE)。

若补丁源自 GPL 授权的 linux-imx 或 NXP U-Boot，则保留其原始 GPL-2.0 许可证，并在对应 `METADATA.yaml` 中明确标注。

---

<div align="center">


**用 🔥 和无数串口终端堆出来的工程。希望我们可以更方便地自定义自己的 i.MX6ULL 系统。**

</div>