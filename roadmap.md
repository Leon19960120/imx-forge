# 🗺️ IMX-Forge Roadmap

> 本文件记录 IMX-Forge 的版本规划、里程碑目标与待办事项。  
> 状态图例：✅ 已完成 · 🚧 进行中 · 📋 规划中 · 💤 暂缓

---

## 📌 版本策略总览

```
v0.x  基础建设期     ──  linux-imx + NXP U-Boot，正点原子阿尔法可用
v1.x  能力扩展期     ──  多 Rootfs 完善，应用示例丰富，mainline 探索
v2.x  双轨成熟期     ──  mainline 成为推荐轨道，自制板标准化接入
v3.x  生态完善期     ──  OTA 框架、更多板卡、社区贡献规范成熟
```

---

## 🏗️ v0.x — 基础建设期

> **目标**：让正点原子阿尔法能用 IMX-Forge 从零构建并烧录一个可运行的最小系统。

### 0.1 · 仓库骨架 & 规范

- [ ] 确定目录结构，创建各模块占位
- [ ] 编写 `BOARD.yaml` 板卡描述规范与模板
- [ ] 编写 `METADATA.yaml` 驱动模块规范与模板
- [ ] 编写 `CONTRIBUTING.md` 贡献指南
- [ ] 确定 Patch 命名规范（`[linux-imx]` / `[mainline]` 前缀）
- [ ] 初始化 `meta/stats.json` 供徽章动态读取

### 0.2 · 构建环境

- [ ] ARM GNU Toolchain 版本选定并锁定（推荐 12.x / 13.x）
- [ ] `scripts/env-init.sh` —— 本地 Ubuntu x86_64 环境初始化
- [ ] `docker/Dockerfile` —— 构建环境容器化（基于 Ubuntu 22.04）
- [ ] Docker 镜像在 macOS (Apple Silicon / x86) 与 WSL2 下验证
- [ ] `devcontainer.json` —— VS Code Dev Container 支持（可选）

### 0.3 · 正点原子阿尔法板卡支持

- [ ] `boards/alpha/BOARD.yaml` 元数据
- [ ] SD 卡启动路径验证
- [ ] eMMC 启动路径验证
- [ ] `boards/alpha/dts/` —— 基础设备树（从 linux-imx 提取）
- [ ] `boards/alpha/configs/` —— kernel defconfig 快照
- [ ] DTB Overlay 机制验证（至少一个外设 overlay 示例）

### 0.4 · 内核 & U-Boot（linux-imx 轨道）

- [ ] linux-imx 版本选定（5.15-lts 优先）作为 git submodule 拉入
- [ ] NXP U-Boot fork 作为 git submodule 拉入
- [ ] `patches/linux-imx/` 补丁序列初始化（`series` 文件管理）
- [ ] `patches/uboot/` 补丁序列初始化
- [ ] 补丁可干净 apply 到对应版本验证

### 0.5 · Rootfs —— Buildroot

- [ ] 搭建 Buildroot 外部目录（`BR2_EXTERNAL`）结构
- [ ] `rootfs/buildroot/configs/imx6ull_alpha_defconfig`
- [ ] 最小系统可启动验证（串口登录）
- [ ] `packages.config` 分层模型设计（base / board / user）

### 0.6 · 构建 & 烧录脚本

- [ ] `scripts/build.sh` —— 统一构建入口（`--board` / `--rootfs` 参数）
- [ ] `scripts/flash.sh` —— SD / eMMC 烧录封装
- [ ] `scripts/menuconfig.sh` —— kernel / buildroot menuconfig 快捷入口
- [ ] `scripts/clean.sh` —— 清理构建产物

### 0.7 · CI 基础

- [ ] GitHub Actions：Patch apply 合法性校验
- [ ] GitHub Actions：Docker 构建环境镜像构建测试
- [ ] 徽章接入（Patch 数量动态统计）

---

## 🔧 v1.x — 能力扩展期

> **目标**：多 Rootfs 可用，应用示例丰富，mainline 内核初步探索，自制板接入标准化。

### 1.1 · Rootfs —— Debian / Ubuntu

- [ ] `rootfs/debian/` debootstrap 脚本（arm32 / armhf）
- [ ] 基础包配置（ssh、网络、基础工具）
- [ ] Qt5 运行时依赖集成
- [ ] 可登录并 apt install 验证

### 1.2 · Rootfs —— busybox 最小系统

- [ ] 手工构建流程文档
- [ ] `rootfs/busybox/` 构建脚本
- [ ] init 脚本与 inittab 配置
- [ ] 用于教学场景的详细中文注释

### 1.3 · 应用示例 —— Qt UI

- [ ] Qt5 Framebuffer Hello World（无 X11）
- [ ] 触摸屏输入事件处理示例
- [ ] Qt5 EGLFS 支持验证（若硬件支持）
- [ ] 示例附带完整编译说明（交叉编译 + 部署）

### 1.4 · 应用示例 —— 工业协议

- [ ] RS485 半双工收发示例（自动方向控制）
- [ ] CAN 总线收发示例（SocketCAN）
- [ ] Modbus RTU 从机示例（libmodbus）
- [ ] Modbus TCP 服务端示例

### 1.5 · 应用示例 —— 摄像头 / 传感器

- [ ] V4L2 摄像头采集示例（USB UVC）
- [ ] MJPEG 推流示例
- [ ] I²C 温湿度传感器示例（SHT3x / AHT20）
- [ ] SPI 传感器示例（ICM-42688 / BMI088）

### 1.6 · 驱动模块

- [ ] RS485 自动方向控制驱动（独立模块）
- [ ] 通用 GPIO 扩展驱动示例
- [ ] 每个驱动附带完整 `METADATA.yaml`
- [ ] 驱动在 linux-imx 轨道验证通过

### 1.7 · 自制板接入标准化

- [ ] `boards/custom-v1/BOARD.yaml`
- [ ] DTB Overlay 外设扩展标准文档
- [ ] 新板卡接入教程（中文 step-by-step）
- [ ] `BOARD.yaml` 校验脚本（CI 集成）

### 1.8 · mainline 内核探索（实验性）

- [ ] linux mainline 最新 LTS 版本可编译验证（不保证功能完整）
- [ ] `patches/linux-mainline/` 目录初始化
- [ ] 记录 mainline 与 linux-imx 的差异清单（已支持 / 待移植 / 上游已有）
- [ ] `[mainline]` 分支建立

### 1.9 · 文档建设

- [ ] `docs/01-快速开始.md`
- [ ] `docs/02-构建环境搭建.md`
- [ ] `docs/03-烧录指南.md`
- [ ] `docs/04-板卡接入规范.md`
- [ ] `docs/05-Patch管理规范.md`
- [ ] `docs/06-驱动开发规范.md`
- [ ] 每个 examples/ 目录附带独立 README

---

## 🚀 v2.x — 双轨成熟期

> **目标**：mainline 内核成为可用推荐轨道，自制板生态初步形成，CI 覆盖更全面。

### 2.1 · mainline 内核正式支持

- [ ] mainline 轨道在阿尔法板卡上全功能验证
  - [ ] 网络（以太网）
  - [ ] USB OTG / Host
  - [ ] eMMC / SD
  - [ ] UART / SPI / I²C
  - [ ] CAN / RS485（通过驱动模块）
- [ ] mainline 补丁整理并尝试向上游提交
- [ ] `ROADMAP.md` 中 mainline 状态更新

### 2.2 · U-Boot mainline 支持

- [ ] U-Boot mainline 版本在阿尔法板卡可用
- [ ] `patches/uboot-mainline/` 补丁集
- [ ] SPL + U-Boot proper 完整启动链验证

### 2.3 · 更多板卡

- [ ] 自制板 v1 完整支持
- [ ] 其他 i.MX6ULL 公版板支持（社区贡献）

### 2.4 · CI 增强

- [ ] 构建矩阵 CI（多 Rootfs × 多板卡自动构建）
- [ ] 驱动模块编译 CI（linux-imx + mainline 双轨）
- [ ] 镜像产物自动上传（GitHub Releases）

### 2.5 · 工具链增强

- [ ] `scripts/diff-bsp.sh` —— 对比 NXP 官方 BSP 与 mainline 差异，生成快速应用补丁

---

## 🌿 v3.x — 生态完善期

> **目标**：OTA 框架集成，社区规范成熟，项目可持续。

### 3.1 · OTA 框架

- [ ] SWUpdate 集成示例
- [ ] A/B 分区方案设计
- [ ] `examples/ota/` 完整文档

### 3.2 · 社区 & 规范

- [ ] Issue 模板（Bug / 新板卡请求 / 驱动请求）
- [ ] PR 模板
- [ ] 贡献者名单（`CONTRIBUTORS.md`）
- [ ] 版本 changelog 规范

### 3.3 · 长期探索（无时间表）

- [ ] i.MX6UL / i.MX6ULZ 同系列支持
- [ ] i.MX8MM 支持（更高性能，保持工业定位）
- [ ] Yocto layer 支持（`meta-imx-forge`）

---

## 📊 里程碑一览

| 里程碑 | 版本 | 核心交付物                        | 预期状态 |
| ------ | ---- | --------------------------------- | -------- |
| M1     | v0.3 | 阿尔法板 Buildroot 最小系统可烧录 | 📋 规划中 |
| M2     | v0.6 | 三种 Rootfs 均可构建，脚本完整    | 📋 规划中 |
| M3     | v1.4 | Qt + 工业协议示例全部可用         | 📋 规划中 |
| M4     | v1.8 | mainline 内核实验性可编译         | 📋 规划中 |
| M5     | v2.1 | mainline 全功能验证通过           | 📋 规划中 |
| M6     | v3.1 | OTA 框架集成完成                  | 💤 暂缓   |

---

## 🐛 已知问题 / 技术债

> 在开发过程中发现的遗留问题，会在合适的版本修复。

| 编号 | 描述 | 影响版本 | 优先级 |
| ---- | ---- | -------- | ------ |
| —    | 暂无 | —        | —      |

---

<div align="center">


*Roadmap 随项目发展持续更新。有想法？欢迎开 [Issue](https://github.com/yourname/imx-forge/issues) 讨论。*

</div>