# IMX-Forge 待办事项

> 优先级：🔴 高 · 🟡 中 · 🟢 低
> 状态：✅ 已完成 · 🚧 进行中 · 📋 待办

---

## 🔴 第一优先级 - 本地环境跑通（v0.x 核心）

### 1. 项目骨架搭建
- [ ] 创建目录结构（boards/patches/rootfs/scripts/docker/docs/drivers/examples）
- [ ] 创建 `BOARD.yaml` 板卡描述模板
- [ ] 创建 `METADATA.yaml` 驱动模块模板
- [ ] 初始化 `meta/stats.json`

### 2. 构建环境准备
- [ ] 确定 ARM GNU Toolchain 版本（推荐 12.x/13.x）
- [ ] 创建 `scripts/env-init.sh` 环境初始化脚本
- [ ] 创建 `docker/Dockerfile` 构建环境容器
- [ ] 创建 `.devcontainer/devcontainer.json`（可选）

### 3. Linux-imx 内核拉取
- [ ] 确定版本（5.15-lts 优先）
- [ ] 添加为 git submodule
- [ ] 创建 `patches/linux-imx/` 目录结构
- [ ] 初始化 `series` 补丁序列文件

### 4. NXP U-Boot 拉取
- [ ] 确定 NXP U-Boot fork 版本
- [ ] 添加为 git submodule
- [ ] 创建 `patches/uboot/` 目录结构
- [ ] 初始化 `series` 补丁序列文件

### 5. Busybox 配置
- [ ] 创建 `rootfs/busybox/` 目录
- [ ] 添加 busybox 源码或下载脚本
- [ ] 创建 busybox 配置脚本（.config）
- [ ] 创建构建脚本

### 6. 正点原子阿尔法板卡配置
- [ ] 创建 `boards/alpha/BOARD.yaml`
- [ ] 创建 `boards/alpha/dts/` 目录
- [ ] 创建 `boards/alpha/configs/` 目录
- [ ] 添加板级设备树

---

## 🟡 第二优先级 - 构建脚本与工具

### 7. 构建脚本
- [ ] `scripts/build.sh` - 统一构建入口
- [ ] `scripts/flash.sh` - 烧录脚本
- [ ] `scripts/menuconfig.sh` - menuconfig 快捷入口
- [ ] `scripts/clean.sh` - 清理脚本

### 8. Buildroot Rootfs
- [ ] 创建 `rootfs/buildroot/` BR2 外部目录
- [ ] 创建 `imx6ull_alpha_defconfig`
- [ ] 验证最小系统可启动

---

## 🟢 第三优先级 - 文档与 CI

### 9. 文档编写
- [ ] `docs/01-快速开始.md`
- [ ] `docs/02-构建环境搭建.md`
- [ ] `docs/03-烧录指南.md`
- [ ] `docs/04-板卡接入规范.md`
- [ ] `docs/05-Patch管理规范.md`
- [ ] `CONTRIBUTING.md`

### 10. CI 基础
- [ ] GitHub Actions - Patch apply 校验
- [ ] GitHub Actions - Docker 构建测试

---

## 📋 后续规划（v1.x+）
- Debian Rootfs
- Qt 应用示例
- 驱动模块开发
- Mainline 内核探索
