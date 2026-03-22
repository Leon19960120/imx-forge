# IMX-Forge 待办事项

> 优先级：🔴 高 · 🟡 中 · 🟢 低
> 状态：✅ 已完成 · 🚧 进行中 · 📋 待办

---

## 🔴 第一优先级 - 本地环境跑通（v0.x 核心）

### 1. 项目骨架搭建
- [x] 创建目录结构（driver/patches/rootfs/scripts/docs/examples）
- [ ] 创建 `BOARD.yaml` 板卡描述模板
- [ ] 创建 `METADATA.yaml` 驱动模块模板
- [ ] 初始化 `meta/stats.json`

### 2. 构建环境准备
- [x] 确定 ARM GNU Toolchain 版本（15.2.rel1）
- [ ] 创建 `scripts/env-init.sh` 环境初始化脚本
- [ ] 创建 `docker/Dockerfile` 构建环境容器
- [ ] 创建 `.devcontainer/devcontainer.json`（可选）

### 3. Linux-imx 内核拉取
- [x] 确定版本（6.12.3）
- [x] 添加为 git submodule
- [x] 创建 `patches/linux-imx/` 目录结构
- [x] 初始化 `series` 补丁序列文件

### 4. NXP U-Boot 拉取
- [x] 确定 NXP U-Boot fork 版本（2025-04）
- [x] 添加为 git submodule
- [x] 创建 `patches/uboot/` 目录结构
- [x] 初始化 `series` 补丁序列文件

### 5. Busybox 配置
- [x] 创建 `rootfs/` 目录
- [x] 添加 busybox 源码（git submodule）
- [x] 创建 busybox 配置脚本（.config）
- [x] 创建构建脚本（build-busybox.sh）

### 6. 正点原子阿尔法板卡配置
- [x] 创建 `driver/device_tree/alpha-board/` 目录
- [x] 创建板级设备树（Linux 和 U-Boot）
- [x] 创建板级配置文件

---

## 🟡 第二优先级 - 构建脚本与工具

### 7. 构建脚本
- [x] `scripts/release-all.sh` - 统一构建入口
- [ ] `scripts/flash.sh` - 烧录脚本
- [ ] `scripts/menuconfig.sh` - menuconfig 快捷入口
- [ ] `scripts/clean.sh` - 清理脚本
- [x] `scripts/build_helper/build-uboot.sh` - U-Boot 构建
- [x] `scripts/build_helper/build-linux.sh` - 内核构建
- [x] `scripts/build_helper/build-mainline-linux.sh` - Mainline 内核构建
- [x] `scripts/build_helper/build-busybox.sh` - BusyBox 构建

### 8. Rootfs 方案
- [x] BusyBox Rootfs（overlay 支持）
- [ ] Buildroot Rootfs
- [ ] Debian Rootfs

---

## 🟢 第三优先级 - 文档与 CI

### 9. 文档编写
- [x] `document/tutorial/` 完整教程体系（30+ 篇）
  - [x] 工具链安装教程
  - [x] U-Boot 移植教程（9 篇）
  - [x] 内核开发教程（8 篇）
  - [x] Rootfs 构建教程（6 篇）
  - [x] 驱动开发教程（7 篇）
  - [x] 实战教程（4 篇）
- [x] `QUICK_START.md`
- [x] `README.md`
- [ ] `docs/04-板卡接入规范.md`
- [x] Mainline 内核迁移文档

### 10. CI 基础
- [ ] GitHub Actions - Patch apply 校验
- [ ] GitHub Actions - Docker 构建测试

---

## 📋 新增已完成项目

### v0.5 里程碑
- [x] Mainline 内核迁移（patches/linux_mainline/）
- [x] GT911 触摸屏驱动支持
- [x] QT6 交叉编译流水线（qt-compile-pipeline）
- [x] 网络启动支持（TFTP/NFS）
- [x] 补丁自动化工具（patch_maker.sh）
- [x] WSL2 Mirrored 网络模式支持

---

## 🚧 后续规划（v1.x+）
- [ ] QT6 + GT911 完整应用示例
- [ ] 自制板 v1 支持（DTB Overlay）
- [ ] Debian Rootfs
- [ ] 更多驱动模块开发
- [x] Mainline 内核完善（i.MX6ULL 适配）
