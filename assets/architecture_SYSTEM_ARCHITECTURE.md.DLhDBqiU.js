import{_ as n,o as a,c as p,a2 as l}from"./chunks/framework.C24VBsJ9.js";const o=JSON.parse('{"title":"IMX-Forge 系统架构文档","description":"","frontmatter":{},"headers":[],"relativePath":"architecture/SYSTEM_ARCHITECTURE.md","filePath":"architecture/SYSTEM_ARCHITECTURE.md","lastUpdated":1779069652000}'),e={name:"architecture/SYSTEM_ARCHITECTURE.md"};function i(r,s,c,b,t,u){return a(),p("div",null,[...s[0]||(s[0]=[l(`<h1 id="imx-forge-系统架构文档" tabindex="-1">IMX-Forge 系统架构文档 <a class="header-anchor" href="#imx-forge-系统架构文档" aria-label="Permalink to &quot;IMX-Forge 系统架构文档&quot;">​</a></h1><blockquote><p>文档版本: v1.0 最后更新: 2026-03-15 维护者: IMX-Forge 项目组</p></blockquote><hr><h2 id="文档概述" tabindex="-1">文档概述 <a class="header-anchor" href="#文档概述" aria-label="Permalink to &quot;文档概述&quot;">​</a></h2><p>本文档详细描述 IMX-Forge 项目的整体系统架构，包括模块组成、依赖关系、数据流向以及核心设计决策。通过本文档，开发者可以快速理解项目的组织结构，并有效地参与开发工作。</p><hr><h2 id="目录" tabindex="-1">目录 <a class="header-anchor" href="#目录" aria-label="Permalink to &quot;目录&quot;">​</a></h2><ul><li><a href="#1-整体架构概览">1. 整体架构概览</a></li><li><a href="#2-启动流程架构">2. 启动流程架构</a></li><li><a href="#3-双轨策略架构">3. 双轨策略架构</a></li><li><a href="#4-模块依赖关系">4. 模块依赖关系</a></li><li><a href="#5-数据流向说明">5. 数据流向说明</a></li><li><a href="#6-目录结构说明">6. 目录结构说明</a></li><li><a href="#7-设计决策记录">7. 设计决策记录</a></li><li><a href="#8-构建系统架构">8. 构建系统架构</a></li><li><a href="#9-扩展机制">9. 扩展机制</a></li></ul><hr><h2 id="_1-整体架构概览" tabindex="-1">1. 整体架构概览 <a class="header-anchor" href="#_1-整体架构概览" aria-label="Permalink to &quot;1. 整体架构概览&quot;">​</a></h2><h3 id="_1-1-架构图" tabindex="-1">1.1 架构图 <a class="header-anchor" href="#_1-1-架构图" aria-label="Permalink to &quot;1.1 架构图&quot;">​</a></h3><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>┌─────────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                         IMX-Forge 项目架构                           │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│                                                                      │</span></span>
<span class="line"><span>│  ┌─────────────┐    ┌──────────────┐    ┌─────────────────────┐   │</span></span>
<span class="line"><span>│  │  开发环境   │───▶│   构建系统   │───▶│     输出产物        │   │</span></span>
<span class="line"><span>│  │ Development │    │    Scripts   │    │   Output Artifacts  │   │</span></span>
<span class="line"><span>│  └─────────────┘    └──────────────┘    └─────────────────────┘   │</span></span>
<span class="line"><span>│         │                   │                        │              │</span></span>
<span class="line"><span>│         │                   │                        │              │</span></span>
<span class="line"><span>│         ▼                   ▼                        ▼              │</span></span>
<span class="line"><span>│  ┌─────────────┐    ┌──────────────┐    ┌─────────────────────┐   │</span></span>
<span class="line"><span>│  │  第三方源码 │    │   补丁管理   │    │  可烧录镜像文件     │   │</span></span>
<span class="line"><span>│  │Third-Party  │◀───│   Patches    │    │  - zImage           │   │</span></span>
<span class="line"><span>│  │  Sources    │    │              │    │  - u-boot.bin       │   │</span></span>
<span class="line"><span>│  │             │    │  ┌────────┐  │    │  - rootfs           │   │</span></span>
<span class="line"><span>│  │ ┌─────────┐ │    │  │linux-  │  │    │  - DTB              │   │</span></span>
<span class="line"><span>│  │ │linux-   │ │    │  │imx/    │  │    │                     │   │</span></span>
<span class="line"><span>│  │ │imx      │ │    │  │mainline│  │    │                     │   │</span></span>
<span class="line"><span>│  │ └─────────┘ │    │  │/uboot/ │  │    │                     │   │</span></span>
<span class="line"><span>│  │ ┌─────────┐ │    │  └────────┘  │    │                     │   │</span></span>
<span class="line"><span>│  │ │uboot-   │ │    └──────────────┘    │                     │   │</span></span>
<span class="line"><span>│  │ │imx      │ │           │              │                     │   │</span></span>
<span class="line"><span>│  │ └─────────┘ │           │              │                     │   │</span></span>
<span class="line"><span>│  │ ┌─────────┐ │           │              │                     │   │</span></span>
<span class="line"><span>│  │ │busybox  │ │           │              │                     │   │</span></span>
<span class="line"><span>│  │ └─────────┘ │           │              │                     │   │</span></span>
<span class="line"><span>│  └─────────────┘           │              │                     │   │</span></span>
<span class="line"><span>│                            │              │                     │   │</span></span>
<span class="line"><span>│  ┌─────────────┐           │              │                     │   │</span></span>
<span class="line"><span>│  │  板卡支持   │           │              │                     │   │</span></span>
<span class="line"><span>│  │   Boards    │───────────┘              │                     │   │</span></span>
<span class="line"><span>│  │             │                          │                     │   │</span></span>
<span class="line"><span>│  │ - alpha     │                          │                     │   │</span></span>
<span class="line"><span>│  │ - custom-v1 │                          │                     │   │</span></span>
<span class="line"><span>│  └─────────────┘                          │                     │   │</span></span>
<span class="line"><span>│                                            │                     │   │</span></span>
<span class="line"><span>│  ┌─────────────┐                          │                     │   │</span></span>
<span class="line"><span>│  │  文档教程   │                          ▼                     │   │</span></span>
<span class="line"><span>│  │  Documents  │◀─────────────────────────┘                     │   │</span></span>
<span class="line"><span>│  │             │                                                │   │</span></span>
<span class="line"><span>│  │ - tutorial  │                                                │   │</span></span>
<span class="line"><span>│  │ - roadmap   │                                                │   │</span></span>
<span class="line"><span>│  │ - architecture│                                               │   │</span></span>
<span class="line"><span>│  └─────────────┘                                                │   │</span></span>
<span class="line"><span>│                                                                  │   │</span></span>
<span class="line"><span>└──────────────────────────────────────────────────────────────────┘</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br><span class="line-number">42</span><br><span class="line-number">43</span><br><span class="line-number">44</span><br><span class="line-number">45</span><br><span class="line-number">46</span><br><span class="line-number">47</span><br></div></div><h3 id="_1-2-核心模块说明" tabindex="-1">1.2 核心模块说明 <a class="header-anchor" href="#_1-2-核心模块说明" aria-label="Permalink to &quot;1.2 核心模块说明&quot;">​</a></h3><table tabindex="0"><thead><tr><th>模块名称</th><th>路径</th><th>功能描述</th></tr></thead><tbody><tr><td>构建系统</td><td><code>scripts/</code></td><td>提供统一的构建入口，管理编译流程</td></tr><tr><td>第三方源码</td><td><code>third_party/</code></td><td>Git Submodule 管理的第三方源码</td></tr><tr><td>补丁管理</td><td><code>patches/</code></td><td>基于格式化补丁的修改管理</td></tr><tr><td>板卡支持</td><td><code>boards/</code></td><td>板级配置和设备树文件</td></tr><tr><td>文档教程</td><td><code>document/</code></td><td>项目文档和教程</td></tr><tr><td>驱动模块</td><td><code>driver/</code></td><td>自研驱动和设备树overlay</td></tr><tr><td>根文件系统</td><td><code>rootfs/</code></td><td>多种根文件系统实现</td></tr><tr><td>输出目录</td><td><code>out/</code></td><td>构建产物输出位置</td></tr></tbody></table><hr><h2 id="_2-启动流程架构" tabindex="-1">2. 启动流程架构 <a class="header-anchor" href="#_2-启动流程架构" aria-label="Permalink to &quot;2. 启动流程架构&quot;">​</a></h2><h3 id="_2-1-完整启动流程" tabindex="-1">2.1 完整启动流程 <a class="header-anchor" href="#_2-1-完整启动流程" aria-label="Permalink to &quot;2.1 完整启动流程&quot;">​</a></h3><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>┌──────────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                      i.MX6ULL 系统启动流程                            │</span></span>
<span class="line"><span>├──────────────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│                                                                       │</span></span>
<span class="line"><span>│  ┌──────────────┐                                                    │</span></span>
<span class="line"><span>│  │   上电复位   │                                                    │</span></span>
<span class="line"><span>│  │ Power On/Reset│                                                   │</span></span>
<span class="line"><span>│  └──────┬───────┘                                                    │</span></span>
<span class="line"><span>│         │                                                            │</span></span>
<span class="line"><span>│         ▼                                                            │</span></span>
<span class="line"><span>│  ┌──────────────┐                                                    │</span></span>
<span class="line"><span>│  │  ROM Code    │  ───▶  内部 BootROM，不可修改                       │</span></span>
<span class="line"><span>│  │  (芯片内部)  │       - 从 eMMC/SD 加载 SPL                         │</span></span>
<span class="line"><span>│  └──────┬───────┘       - 初始化基础硬件                             │</span></span>
<span class="line"><span>│         │                                                            │</span></span>
<span class="line"><span>│         ▼                                                            │</span></span>
<span class="line"><span>│  ┌──────────────┐                                                    │</span></span>
<span class="line"><span>│  │  SPL         │  ───▶  Secondary Program Loader                   │</span></span>
<span class="line"><span>│  │  (MLO/u-boot │       - 初始化 DDR                                 │</span></span>
<span class="line"><span>│  │   .spl)      │       - 加载完整 U-Boot                            │</span></span>
<span class="line"><span>│  └──────┬───────┘                                                    │</span></span>
<span class="line"><span>│         │                                                            │</span></span>
<span class="line"><span>│         ▼                                                            │</span></span>
<span class="line"><span>│  ┌──────────────┐                                                    │</span></span>
<span class="line"><span>│  │  U-Boot      │  ───▶  Universal Bootloader                       │</span></span>
<span class="line"><span>│  │  (引导加载器) │       - 硬件初始化                                 │</span></span>
<span class="line"><span>│  │              │       - 加载设备树 (DTB)                           │</span></span>
<span class="line"><span>│  │              │       - 加载内核镜像                               │</span></span>
<span class="line"><span>│  │              │       - 设置 bootargs                             │</span></span>
<span class="line"><span>│  └──────┬───────┘                                                    │</span></span>
<span class="line"><span>│         │                                                            │</span></span>
<span class="line"><span>│         ▼                                                            │</span></span>
<span class="line"><span>│  ┌──────────────┐                                                    │</span></span>
<span class="line"><span>│  │  Linux Kernel│  ───▶  操作系统内核                                │</span></span>
<span class="line"><span>│  │  (zImage)    │       - 内核初始化                                 │</span></span>
<span class="line"><span>│  │              │       - 驱动加载                                   │</span></span>
<span class="line"><span>│  │              │       - 挂载根文件系统                             │</span></span>
<span class="line"><span>│  └──────┬───────┘                                                    │</span></span>
<span class="line"><span>│         │                                                            │</span></span>
<span class="line"><span>│         ▼                                                            │</span></span>
<span class="line"><span>│  ┌──────────────┐                                                    │</span></span>
<span class="line"><span>│  │  Rootfs      │  ───▶  根文件系统                                  │</span></span>
<span class="line"><span>│  │  (根文件系统) │       - busybox / Buildroot / Debian              │</span></span>
<span class="line"><span>│  │              │       - 启动 init 进程                             │</span></span>
<span class="line"><span>│  │              │       - 运行用户应用                               │</span></span>
<span class="line"><span>│  └──────────────┘                                                    │</span></span>
<span class="line"><span>│                                                                       │</span></span>
<span class="line"><span>│  支持的启动介质: eMMC / SD 卡 / NFS 网络根文件系统                     │</span></span>
<span class="line"><span>│                                                                       │</span></span>
<span class="line"><span>└──────────────────────────────────────────────────────────────────────┘</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br><span class="line-number">42</span><br><span class="line-number">43</span><br><span class="line-number">44</span><br><span class="line-number">45</span><br><span class="line-number">46</span><br><span class="line-number">47</span><br><span class="line-number">48</span><br><span class="line-number">49</span><br><span class="line-number">50</span><br></div></div><h3 id="_2-2-组件来源与版本" tabindex="-1">2.2 组件来源与版本 <a class="header-anchor" href="#_2-2-组件来源与版本" aria-label="Permalink to &quot;2.2 组件来源与版本&quot;">​</a></h3><table tabindex="0"><thead><tr><th>组件</th><th>来源分支</th><th>版本策略</th><th>状态</th></tr></thead><tbody><tr><td>U-Boot</td><td><code>uboot-imx</code> (NXP fork)</td><td>跟随 NXP 官方 BSP</td><td>当前</td></tr><tr><td>Linux Kernel</td><td><code>linux-imx</code> (NXP fork)</td><td>跟随 NXP 官方 BSP</td><td>当前</td></tr><tr><td>Linux Kernel</td><td><code>mainline</code> (Torvalds)</td><td>实验性支持</td><td>规划中</td></tr><tr><td>BusyBox</td><td><code>mirror/busybox</code></td><td>官方稳定版</td><td>当前</td></tr></tbody></table><h3 id="_2-3-存储介质布局" tabindex="-1">2.3 存储介质布局 <a class="header-anchor" href="#_2-3-存储介质布局" aria-label="Permalink to &quot;2.3 存储介质布局&quot;">​</a></h3><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                    eMMC/SD 卡分区布局                        │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│  分区 0: Boot Partition (可启动硬件分区)                      │</span></span>
<span class="line"><span>│  ┌──────────────────────────────────────────┐               │</span></span>
<span class="line"><span>│  │  SPL / MLO                               │               │</span></span>
<span class="line"><span>│  │  (必需位于固定位置，ROM Code 可寻址)      │               │</span></span>
<span class="line"><span>│  └──────────────────────────────────────────┘               │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│  分区 1: U-Boot 分区                                          │</span></span>
<span class="line"><span>│  ┌──────────────────────────────────────────┐               │</span></span>
<span class="line"><span>│  │  u-boot.img / u-boot.bin                 │               │</span></span>
<span class="line"><span>│  │  (完整 U-Boot 镜像)                      │               │</span></span>
<span class="line"><span>│  └──────────────────────────────────────────┘               │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│  分区 2: 内核与设备树                                         │</span></span>
<span class="line"><span>│  ┌──────────────────────────────────────────┐               │</span></span>
<span class="line"><span>│  │  zImage (压缩内核镜像)                   │               │</span></span>
<span class="line"><span>│  │  *.dtb (设备树二进制文件)                │               │</span></span>
<span class="line"><span>│  └──────────────────────────────────────────┘               │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│  分区 3: 根文件系统                                           │</span></span>
<span class="line"><span>│  ┌──────────────────────────────────────────┐               │</span></span>
<span class="line"><span>│  │  Rootfs (ext4/squashfs/ubifs)            │               │</span></span>
<span class="line"><span>│  │  - busybox                               │               │</span></span>
<span class="line"><span>│  │  - Buildroot                             │               │</span></span>
<span class="line"><span>│  │  - 或 Debian/Ubuntu                      │               │</span></span>
<span class="line"><span>│  └──────────────────────────────────────────┘               │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│  可选: 数据分区                                               │</span></span>
<span class="line"><span>│  ┌──────────────────────────────────────────┐               │</span></span>
<span class="line"><span>│  │  用户数据 / 应用数据                     │               │</span></span>
<span class="line"><span>│  └──────────────────────────────────────────┘               │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br></div></div><hr><h2 id="_3-双轨策略架构" tabindex="-1">3. 双轨策略架构 <a class="header-anchor" href="#_3-双轨策略架构" aria-label="Permalink to &quot;3. 双轨策略架构&quot;">​</a></h2><h3 id="_3-1-策略总览" tabindex="-1">3.1 策略总览 <a class="header-anchor" href="#_3-1-策略总览" aria-label="Permalink to &quot;3.1 策略总览&quot;">​</a></h3><p>IMX-Forge 采用双轨并行策略，平衡稳定性与前沿性：</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>┌───────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                         双轨策略时间轴                             │</span></span>
<span class="line"><span>├───────────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│                                                                    │</span></span>
<span class="line"><span>│   ┌─────────────────────────────────────────────────────────┐     │</span></span>
<span class="line"><span>│   │  v0.x  [当前阶段]                                        │     │</span></span>
<span class="line"><span>│   │  ┌────────────────────────────────────────────────┐     │     │</span></span>
<span class="line"><span>│   │  │ linux-imx 轨道                                  │     │     │</span></span>
<span class="line"><span>│   │  │ - NXP BSP 6.12.3 基线                           │     │     │</span></span>
<span class="line"><span>│   │  │ - 完整驱动支持                                  │     │     │</span></span>
<span class="line"><span>│   │  │ - 稳定性优先                                    │     │     │</span></span>
<span class="line"><span>│   │  └────────────────────────────────────────────────┘     │     │</span></span>
<span class="line"><span>│   │                                                           │     │</span></span>
<span class="line"><span>│   │  ┌────────────────────────────────────────────────┐     │     │</span></span>
<span class="line"><span>│   │  │ mainline 轨道                                   │     │     │</span></span>
<span class="line"><span>│   │  │ - 实验性探索                                    │     │     │</span></span>
<span class="line"><span>│   │  │ - 差异分析记录                                  │     │     │</span></span>
<span class="line"><span>│   │  └────────────────────────────────────────────────┘     │     │</span></span>
<span class="line"><span>│   └─────────────────────────────────────────────────────────┘     │</span></span>
<span class="line"><span>│                              │                                     │</span></span>
<span class="line"><span>│                              │ 补丁向上游提交 / 移植                │</span></span>
<span class="line"><span>│                              ▼                                     │</span></span>
<span class="line"><span>│   ┌─────────────────────────────────────────────────────────┐     │</span></span>
<span class="line"><span>│   │  v1.x  [中期目标]                                        │     │</span></span>
<span class="line"><span>│   │  ┌────────────────────────────────────────────────┐     │     │</span></span>
<span class="line"><span>│   │  │ linux-imx 轨道                                  │     │     │</span></span>
<span class="line"><span>│   │  │ - 继续维护                                      │     │     │</span></span>
<span class="line"><span>│   │  │ - 生产环境推荐                                  │     │     │</span></span>
<span class="line"><span>│   │  └────────────────────────────────────────────────┘     │     │</span></span>
<span class="line"><span>│   │                                                           │     │</span></span>
<span class="line"><span>│   │  ┌────────────────────────────────────────────────┐     │     │</span></span>
<span class="line"><span>│   │  │ mainline 轨道                                   │     │     │</span></span>
<span class="line"><span>│   │  │ + 基础功能验证                                  │     │     │</span></span>
<span class="line"><span>│   │  │ + 关键驱动移植                                  │     │     │</span></span>
<span class="line"><span>│   │  └────────────────────────────────────────────────┘     │     │</span></span>
<span class="line"><span>│   └─────────────────────────────────────────────────────────┘     │</span></span>
<span class="line"><span>│                              │                                     │</span></span>
<span class="line"><span>│                              │ mainline 趋于稳定                   │</span></span>
<span class="line"><span>│                              ▼                                     │</span></span>
<span class="line"><span>│   ┌─────────────────────────────────────────────────────────┐     │</span></span>
<span class="line"><span>│   │  v2.x  [长期目标]                                        │     │</span></span>
<span class="line"><span>│   │  ┌────────────────────────────────────────────────┐     │     │</span></span>
<span class="line"><span>│   │  │ linux-imx 轨道                                  │     │     │</span></span>
<span class="line"><span>│   │  │ - 兼容性备选                                    │     │     │</span></span>
<span class="line"><span>│   │  │ - 向后兼容支持                                  │     │     │</span></span>
<span class="line"><span>│   │  └────────────────────────────────────────────────┘     │     │</span></span>
<span class="line"><span>│   │                                                           │     │</span></span>
<span class="line"><span>│   │  ┌────────────────────────────────────────────────┐     │     │</span></span>
<span class="line"><span>│   │  │ mainline 轨道                                   │     │     │</span></span>
<span class="line"><span>│   │  │ + 成为推荐轨道                                  │     │     │</span></span>
<span class="line"><span>│   │  │ + 全功能验证通过                                │     │     │</span></span>
<span class="line"><span>│   │  │ + 补丁向上游合并                                │     │     │</span></span>
<span class="line"><span>│   │  └────────────────────────────────────────────────┘     │     │</span></span>
<span class="line"><span>│   └─────────────────────────────────────────────────────────┘     │</span></span>
<span class="line"><span>│                                                                    │</span></span>
<span class="line"><span>└───────────────────────────────────────────────────────────────────┘</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br><span class="line-number">42</span><br><span class="line-number">43</span><br><span class="line-number">44</span><br><span class="line-number">45</span><br><span class="line-number">46</span><br><span class="line-number">47</span><br><span class="line-number">48</span><br><span class="line-number">49</span><br><span class="line-number">50</span><br><span class="line-number">51</span><br><span class="line-number">52</span><br><span class="line-number">53</span><br><span class="line-number">54</span><br><span class="line-number">55</span><br><span class="line-number">56</span><br></div></div><h3 id="_3-2-轨道对比" tabindex="-1">3.2 轨道对比 <a class="header-anchor" href="#_3-2-轨道对比" aria-label="Permalink to &quot;3.2 轨道对比&quot;">​</a></h3><table tabindex="0"><thead><tr><th>特性</th><th>linux-imx 轨道</th><th>mainline 轨道</th></tr></thead><tbody><tr><td>基线来源</td><td>NXP 官方 BSP</td><td>Torvalds 主线</td></tr><tr><td>驱动完整性</td><td>完整支持 i.MX 系列</td><td>需要适配验证</td></tr><tr><td>更新频率</td><td>跟随 NXP 发布</td><td>跟随内核主线</td></tr><tr><td>稳定性</td><td>生产可用</td><td>实验性</td></tr><tr><td>补丁标签</td><td><code>[linux-imx]</code></td><td><code>[mainline]</code></td></tr><tr><td>存储位置</td><td><code>patches/linux-imx/</code></td><td><code>patches/linux-mainline/</code></td></tr><tr><td>上游策略</td><td>NXP 特有补丁本地化</td><td>积极向上游合并</td></tr></tbody></table><h3 id="_3-3-补丁目录结构" tabindex="-1">3.3 补丁目录结构 <a class="header-anchor" href="#_3-3-补丁目录结构" aria-label="Permalink to &quot;3.3 补丁目录结构&quot;">​</a></h3><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>patches/</span></span>
<span class="line"><span>├── linux-imx/              # NXP BSP 轨道补丁</span></span>
<span class="line"><span>│   ├── series              # 补丁应用序列文件</span></span>
<span class="line"><span>│   ├── 0001-xxx.patch      # [linux-imx] 标签补丁</span></span>
<span class="line"><span>│   └── ...</span></span>
<span class="line"><span>├── linux-mainline/         # 主线内核轨道补丁</span></span>
<span class="line"><span>│   ├── series              # 补丁应用序列文件 (未来)</span></span>
<span class="line"><span>│   └── ...</span></span>
<span class="line"><span>├── uboot-imx/              # U-Boot NXP fork 补丁</span></span>
<span class="line"><span>│   └── charlies_board.patch</span></span>
<span class="line"><span>├── uboot/                  # U-Boot mainline 补丁 (未来)</span></span>
<span class="line"><span>└── busybox/                # BusyBox 补丁</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br></div></div><hr><h2 id="_4-模块依赖关系" tabindex="-1">4. 模块依赖关系 <a class="header-anchor" href="#_4-模块依赖关系" aria-label="Permalink to &quot;4. 模块依赖关系&quot;">​</a></h2><h3 id="_4-1-依赖关系图" tabindex="-1">4.1 依赖关系图 <a class="header-anchor" href="#_4-1-依赖关系图" aria-label="Permalink to &quot;4.1 依赖关系图&quot;">​</a></h3><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>┌─────────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                         模块依赖关系图                               │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│                                                                      │</span></span>
<span class="line"><span>│  scripts/ (构建系统)                                                 │</span></span>
<span class="line"><span>│  │                                                                   │</span></span>
<span class="line"><span>│  ├── lib/                                                           │</span></span>
<span class="line"><span>│  │   └── logging.sh  ◀─────── 被所有构建脚本引用                     │</span></span>
<span class="line"><span>│  │                                                                   │</span></span>
<span class="line"><span>│  ├── build_helper/                                                  │</span></span>
<span class="line"><span>│  │   ├── build-linux.sh  ────▶ third_party/linux-imx/              │</span></span>
<span class="line"><span>│  │   ├── build-uboot.sh   ────▶ third_party/uboot-imx/             │</span></span>
<span class="line"><span>│  │   └── build-busybox.sh ────▶ third_party/busybox/               │</span></span>
<span class="line"><span>│  │                                                                   │</span></span>
<span class="line"><span>│  ├── patch_maker.sh  ────▶ 生成 patches/*.patch                     │</span></span>
<span class="line"><span>│  │                                                                   │</span></span>
<span class="line"><span>│  ├── release_builder/  ────▶ 打包输出产物                            │</span></span>
<span class="line"><span>│  │                                                                   │</span></span>
<span class="line"><span>│  ├── third_party_install/                                           │</span></span>
<span class="line"><span>│  │   └── install_libc.sh  ────▶ rootfs/nfs/                         │</span></span>
<span class="line"><span>│  │                                                                   │</span></span>
<span class="line"><span>│  └── varified_rootfs_ok.sh  ────▶ rootfs/nfs/                       │</span></span>
<span class="line"><span>│                                   │                                   │</span></span>
<span class="line"><span>│                                   ▼                                   │</span></span>
<span class="line"><span>│  driver/device_tree/alpha-board/                                     │</span></span>
<span class="line"><span>│  │   ├── linux/  ────▶ third_party/linux-imx/arch/arm/boot/dts/     │</span></span>
<span class="line"><span>│  │   └── uboot/  ────▶ third_party/uboot-imx/arch/arm/dts/          │</span></span>
<span class="line"><span>│                                                                      │</span></span>
<span class="line"><span>│  patches/                                                            │</span></span>
<span class="line"><span>│  │   ├── linux-imx/  ────▶ third_party/linux-imx/                   │</span></span>
<span class="line"><span>│  │   ├── uboot-imx/   ────▶ third_party/uboot-imx/                  │</span></span>
<span class="line"><span>│  │   └── busybox/     ────▶ third_party/busybox/                    │</span></span>
<span class="line"><span>│                                                                      │</span></span>
<span class="line"><span>│  out/  ◀─── 所有构建脚本的输出目录                                    │</span></span>
<span class="line"><span>│                                                                      │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────────────┘</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br></div></div><h3 id="_4-2-脚本调用链" tabindex="-1">4.2 脚本调用链 <a class="header-anchor" href="#_4-2-脚本调用链" aria-label="Permalink to &quot;4.2 脚本调用链&quot;">​</a></h3><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>┌─────────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                        构建流程调用链                                │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│                                                                      │</span></span>
<span class="line"><span>│  用户命令                                                            │</span></span>
<span class="line"><span>│    │                                                                 │</span></span>
<span class="line"><span>│    ▼                                                                 │</span></span>
<span class="line"><span>│  ┌─────────────┐                                                    │</span></span>
<span class="line"><span>│  │ 构建入口脚本 │  (未来实现)                                        │</span></span>
<span class="line"><span>│  │ scripts/    │                                                    │</span></span>
<span class="line"><span>│  │ build.sh    │                                                    │</span></span>
<span class="line"><span>│  └──────┬──────┘                                                    │</span></span>
<span class="line"><span>│         │                                                            │</span></span>
<span class="line"><span>│         ├──▶ scripts/build_helper/build-linux.sh                    │</span></span>
<span class="line"><span>│         │        │                                                  │</span></span>
<span class="line"><span>│         │        ├── 1. source scripts/lib/logging.sh               │</span></span>
<span class="line"><span>│         │        ├── 2. check_host_dependencies()                   │</span></span>
<span class="line"><span>│         │        ├── 3. check_toolchain()                           │</span></span>
<span class="line"><span>│         │        ├── 4. apply patches/linux-imx/*.patch             │</span></span>
<span class="line"><span>│         │        ├── 5. do_configure()                              │</span></span>
<span class="line"><span>│         │        └── 6. do_build()                                  │</span></span>
<span class="line"><span>│         │                                                           │</span></span>
<span class="line"><span>│         ├──▶ scripts/build_helper/build-uboot.sh                     │</span></span>
<span class="line"><span>│         │        │                                                  │</span></span>
<span class="line"><span>│         │        └── (类似流程)                                     │</span></span>
<span class="line"><span>│         │                                                           │</span></span>
<span class="line"><span>│         └──▶ scripts/build_helper/build-busybox.sh                  │</span></span>
<span class="line"><span>│                  │                                                  │</span></span>
<span class="line"><span>│                  └── (类似流程)                                     │</span></span>
<span class="line"><span>│                                                                      │</span></span>
<span class="line"><span>│  Rootfs 构建                                                         │</span></span>
<span class="line"><span>│    │                                                                 │</span></span>
<span class="line"><span>│    ▼                                                                 │</span></span>
<span class="line"><span>│  scripts/varified_rootfs_ok.sh                                       │</span></span>
<span class="line"><span>│        │                                                             │</span></span>
<span class="line"><span>│        ├── check_directory_safe()                                   │</span></span>
<span class="line"><span>│        ├── check_required_dirs()                                    │</span></span>
<span class="line"><span>│        ├── create_rootfs_structure()                                │</span></span>
<span class="line"><span>│        ├── create_fstab()                                           │</span></span>
<span class="line"><span>│        ├── create_rcs()                                             │</span></span>
<span class="line"><span>│        ├── create_inittab()                                         │</span></span>
<span class="line"><span>│        └── run_third_party_installs()                               │</span></span>
<span class="line"><span>│               │                                                     │</span></span>
<span class="line"><span>│               └── scripts/third_party_install/*.sh                   │</span></span>
<span class="line"><span>│                                                                      │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────────────┘</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br><span class="line-number">42</span><br><span class="line-number">43</span><br><span class="line-number">44</span><br><span class="line-number">45</span><br><span class="line-number">46</span><br></div></div><h3 id="_4-3-git-submodule-管理" tabindex="-1">4.3 Git Submodule 管理 <a class="header-anchor" href="#_4-3-git-submodule-管理" aria-label="Permalink to &quot;4.3 Git Submodule 管理&quot;">​</a></h3><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>.gitmodules 配置:</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│  [submodule &quot;third_party/uboot-imx&quot;]                                │</span></span>
<span class="line"><span>│      path = third_party/uboot-imx                                   │</span></span>
<span class="line"><span>│      url = https://github.com/nxp-imx/uboot-imx.git                 │</span></span>
<span class="line"><span>│      ignore = dirty                                                 │</span></span>
<span class="line"><span>│                                                                      │</span></span>
<span class="line"><span>│  [submodule &quot;third_party/linux-imx&quot;]                                │</span></span>
<span class="line"><span>│      path = third_party/linux-imx                                   │</span></span>
<span class="line"><span>│      url = https://github.com/nxp-imx/linux-imx.git                 │</span></span>
<span class="line"><span>│      ignore = dirty                                                 │</span></span>
<span class="line"><span>│                                                                      │</span></span>
<span class="line"><span>│  [submodule &quot;third_party/busybox&quot;]                                  │</span></span>
<span class="line"><span>│      path = third_party/busybox                                     │</span></span>
<span class="line"><span>│      url = https://github.com/mirror/busybox.git                    │</span></span>
<span class="line"><span>│                                                                      │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────────────┘</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br></div></div><hr><h2 id="_5-数据流向说明" tabindex="-1">5. 数据流向说明 <a class="header-anchor" href="#_5-数据流向说明" aria-label="Permalink to &quot;5. 数据流向说明&quot;">​</a></h2><h3 id="_5-1-源码到补丁的流向" tabindex="-1">5.1 源码到补丁的流向 <a class="header-anchor" href="#_5-1-源码到补丁的流向" aria-label="Permalink to &quot;5.1 源码到补丁的流向&quot;">​</a></h3><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>┌─────────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                    源码修改 → 补丁 → 构建流程                        │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│                                                                      │</span></span>
<span class="line"><span>│  1. 源码修改阶段                                                    │</span></span>
<span class="line"><span>│     ┌────────────────────────────────────┐                          │</span></span>
<span class="line"><span>│     │ third_party/linux-imx/             │                          │</span></span>
<span class="line"><span>│     │   └── drivers/xxx/modified_file.c  │ ← 直接修改                │</span></span>
<span class="line"><span>│     └────────────────────────────────────┘                          │</span></span>
<span class="line"><span>│                      │                                              │</span></span>
<span class="line"><span>│                      ▼                                              │</span></span>
<span class="line"><span>│     ┌────────────────────────────────────┐                          │</span></span>
<span class="line"><span>│     │ Git 工作区                         │                          │</span></span>
<span class="line"><span>│     │   - Modified files                 │                          │</span></span>
<span class="line"><span>│     │   - New commits                    │                          │</span></span>
<span class="line"><span>│     └────────────────────────────────────┘                          │</span></span>
<span class="line"><span>│                                                                      │</span></span>
<span class="line"><span>│  2. 补丁生成阶段                                                    │</span></span>
<span class="line"><span>│                      │                                              │</span></span>
<span class="line"><span>│                      ▼                                              │</span></span>
<span class="line"><span>│     ┌────────────────────────────────────┐                          │</span></span>
<span class="line"><span>│     │ scripts/patch_maker.sh             │                          │</span></span>
<span class="line"><span>│     │   --submodule_path=linux-imx       │                          │</span></span>
<span class="line"><span>│     └────────────────────────────────────┘                          │</span></span>
<span class="line"><span>│                      │                                              │</span></span>
<span class="line"><span>│                      ▼                                              │</span></span>
<span class="line"><span>│     ┌────────────────────────────────────┐                          │</span></span>
<span class="line"><span>│     │ patches/linux-imx/                 │                          │</span></span>
<span class="line"><span>│     │   └── new-changes.patch            │ ← 生成补丁              │</span></span>
<span class="line"><span>│     └────────────────────────────────────┘                          │</span></span>
<span class="line"><span>│                                                                      │</span></span>
<span class="line"><span>│  3. 补丁应用阶段                                                    │</span></span>
<span class="line"><span>│                      │                                              │</span></span>
<span class="line"><span>│                      ▼                                              │</span></span>
<span class="line"><span>│     ┌────────────────────────────────────┐                          │</span></span>
<span class="line"><span>│     │ scripts/build_helper/build-linux.sh │                          │</span></span>
<span class="line"><span>│     │   quilt import / patch -p1         │ ← 应用补丁              │</span></span>
<span class="line"><span>│     └────────────────────────────────────┘                          │</span></span>
<span class="line"><span>│                      │                                              │</span></span>
<span class="line"><span>│                      ▼                                              │</span></span>
<span class="line"><span>│     ┌────────────────────────────────────�┐                          │</span></span>
<span class="line"><span>│     │ out/linux/                         │                          │</span></span>
<span class="line"><span>│     │   ├── zImage                       │ ← 编译输出              │</span></span>
<span class="line"><span>│     │   ├── vmlinux                      │                          │</span></span>
<span class="line"><span>│     │   └── *.dtb                        │                          │</span></span>
<span class="line"><span>│     └────────────────────────────────────┘                          │</span></span>
<span class="line"><span>│                                                                      │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────────────┘</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br><span class="line-number">42</span><br><span class="line-number">43</span><br><span class="line-number">44</span><br><span class="line-number">45</span><br><span class="line-number">46</span><br><span class="line-number">47</span><br><span class="line-number">48</span><br></div></div><h3 id="_5-2-配置文件影响构建的流向" tabindex="-1">5.2 配置文件影响构建的流向 <a class="header-anchor" href="#_5-2-配置文件影响构建的流向" aria-label="Permalink to &quot;5.2 配置文件影响构建的流向&quot;">​</a></h3><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>┌─────────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                     配置文件 → 构建参数流程                          │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│                                                                      │</span></span>
<span class="line"><span>│  板级配置 (未来)                                                     │</span></span>
<span class="line"><span>│  ┌────────────────────────────────────┐                             │</span></span>
<span class="line"><span>│  │ boards/alpha/BOARD.yaml            │                             │</span></span>
<span class="line"><span>│  │   name: &quot;Alpha Board&quot;              │                             │</span></span>
<span class="line"><span>│  │   defconfig: &quot;imx_aes_defconfig&quot;   │ ──────┐                    │</span></span>
<span class="line"><span>│  │   dtb: &quot;imx6ull-alpha.dtb&quot;         │       │                    │</span></span>
<span class="line"><span>│  └────────────────────────────────────┘       │                    │</span></span>
<span class="line"><span>│                                            解析                    │</span></span>
<span class="line"><span>│  Defconfig                                 │                       │</span></span>
<span class="line"><span>│  ┌────────────────────────────────────┐     │                      │</span></span>
<span class="line"><span>│  │ third_party/linux-imx/             │     │                      │</span></span>
<span class="line"><span>│  │   arch/arm/configs/               │     │                      │</span></span>
<span class="line"><span>│  │   imx_aes_defconfig                │ ←───┘                      │</span></span>
<span class="line"><span>│  └────────────────────────────────────┘                             │</span></span>
<span class="line"><span>│                      │                                              │</span></span>
<span class="line"><span>│                      ▼                                              │</span></span>
<span class="line"><span>│  ┌────────────────────────────────────┐                             │</span></span>
<span class="line"><span>│  │ make imx_aes_defconfig             │                             │</span></span>
<span class="line"><span>│  │   └──▶ .config                     │                             │</span></span>
<span class="line"><span>│  └────────────────────────────────────┘                             │</span></span>
<span class="line"><span>│                      │                                              │</span></span>
<span class="line"><span>│                      ▼                                              │</span></span>
<span class="line"><span>│  ┌────────────────────────────────────┐                             │</span></span>
<span class="line"><span>│  │ make -jN                           │                             │</span></span>
<span class="line"><span>│  │   └──▶ 构建输出                    │                             │</span></span>
<span class="line"><span>│  └────────────────────────────────────┘                             │</span></span>
<span class="line"><span>│                                                                      │</span></span>
<span class="line"><span>│  设备树配置                                                           │</span></span>
<span class="line"><span>│  ┌────────────────────────────────────┐                             │</span></span>
<span class="line"><span>│  │ driver/device_tree/alpha-board/    │                             │</span></span>
<span class="line"><span>│  │   linux/imx6ull-alpha.dts          │ ──────┐                    │</span></span>
<span class="line"><span>│  └────────────────────────────────────┘       │                    │</span></span>
<span class="line"><span>│                                            复制/编译                │</span></span>
<span class="line"><span>│  ┌────────────────────────────────────┐     │                      │</span></span>
<span class="line"><span>│  │ third_party/linux-imx/             │     │                      │</span></span>
<span class="line"><span>│  │   arch/arm/boot/dts/               │ ←───┘                      │</span></span>
<span class="line"><span>│  │   imx6ull-alpha.dts                │                            │</span></span>
<span class="line"><span>│  └────────────────────────────────────┘                             │</span></span>
<span class="line"><span>│                      │                                              │</span></span>
<span class="line"><span>│                      ▼                                              │</span></span>
<span class="line"><span>│  ┌────────────────────────────────────┐                             │</span></span>
<span class="line"><span>│  │ dtc -I dts -O dtb                  │                             │</span></span>
<span class="line"><span>│  │   └──▶ imx6ull-alpha.dtb           │                             │</span></span>
<span class="line"><span>│  └────────────────────────────────────┘                             │</span></span>
<span class="line"><span>│                                                                      │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────────────┘</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br><span class="line-number">42</span><br><span class="line-number">43</span><br><span class="line-number">44</span><br><span class="line-number">45</span><br><span class="line-number">46</span><br><span class="line-number">47</span><br><span class="line-number">48</span><br><span class="line-number">49</span><br><span class="line-number">50</span><br></div></div><h3 id="_5-3-rootfs-构建流向" tabindex="-1">5.3 Rootfs 构建流向 <a class="header-anchor" href="#_5-3-rootfs-构建流向" aria-label="Permalink to &quot;5.3 Rootfs 构建流向&quot;">​</a></h3><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>┌─────────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                      Rootfs 构建数据流                               │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│                                                                      │</span></span>
<span class="line"><span>│  BusyBox 编译                                                        │</span></span>
<span class="line"><span>│  ┌────────────────────────────────────┐                             │</span></span>
<span class="line"><span>│  │ third_party/busybox/               │                             │</span></span>
<span class="line"><span>│  └────────────────────────────────────┘                             │</span></span>
<span class="line"><span>│                      │                                              │</span></span>
<span class="line"><span>│                      ▼                                              │</span></span>
<span class="line"><span>│  ┌────────────────────────────────────┐                             │</span></span>
<span class="line"><span>│  │ scripts/build_helper/              │                             │</span></span>
<span class="line"><span>│  │   build-busybox.sh                 │                             │</span></span>
<span class="line"><span>│  └────────────────────────────────────┘                             │</span></span>
<span class="line"><span>│                      │                                              │</span></span>
<span class="line"><span>│                      ▼                                              │</span></span>
<span class="line"><span>│  ┌────────────────────────────────────┐                             │</span></span>
<span class="line"><span>│  │ out/busybox/busybox                │                             │</span></span>
<span class="line"><span>│  └────────────────────────────────────┘                             │</span></span>
<span class="line"><span>│                      │                                              │</span></span>
<span class="line"><span>│                      ▼                                              │</span></span>
<span class="line"><span>│  ┌────────────────────────────────────┐                             │</span></span>
<span class="line"><span>│  │ rootfs/nfs/bin/busybox             │ ← 复制到 rootfs            │</span></span>
<span class="line"><span>│  └────────────────────────────────────┘                             │</span></span>
<span class="line"><span>│                                                                      │</span></span>
<span class="line"><span>│  Rootfs 初始化                                                       │</span></span>
<span class="line"><span>│  ┌────────────────────────────────────┐                             │</span></span>
<span class="line"><span>│  │ scripts/varified_rootfs_ok.sh      │                             │</span></span>
<span class="line"><span>│  └────────────────────────────────────┘                             │</span></span>
<span class="line"><span>│                      │                                              │</span></span>
<span class="line"><span>│                      ├──▶ 创建目录结构                               │</span></span>
<span class="line"><span>│                      ├──▶ 生成配置文件                               │</span></span>
<span class="line"><span>│                      │    - etc/fstab                               │</span></span>
<span class="line"><span>│                      │    - etc/inittab                             │</span></span>
<span class="line"><span>│                      │    - etc/init.d/rcS                          │</span></span>
<span class="line"><span>│                      │                                              │</span></span>
<span class="line"><span>│                      └──▶ 运行第三方安装脚本                         │</span></span>
<span class="line"><span>│                           scripts/third_party_install/*.sh           │</span></span>
<span class="line"><span>│                                                                      │</span></span>
<span class="line"><span>│  最终 Rootfs 结构                                                    │</span></span>
<span class="line"><span>│  rootfs/nfs/                                                         │</span></span>
<span class="line"><span>│  ├── bin/busybox                                                     │</span></span>
<span class="line"><span>│  ├── lib/                                                           │</span></span>
<span class="line"><span>│  ├── etc/fstab                                                      │</span></span>
<span class="line"><span>│  ├── etc/inittab                                                    │</span></span>
<span class="line"><span>│  ├── etc/init.d/rcS                                                 │</span></span>
<span class="line"><span>│  └── linuxrc -&gt; bin/busybox                                          │</span></span>
<span class="line"><span>│                                                                      │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────────────┘</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br><span class="line-number">42</span><br><span class="line-number">43</span><br><span class="line-number">44</span><br><span class="line-number">45</span><br><span class="line-number">46</span><br><span class="line-number">47</span><br><span class="line-number">48</span><br><span class="line-number">49</span><br></div></div><hr><h2 id="_6-目录结构说明" tabindex="-1">6. 目录结构说明 <a class="header-anchor" href="#_6-目录结构说明" aria-label="Permalink to &quot;6. 目录结构说明&quot;">​</a></h2><h3 id="_6-1-完整目录树" tabindex="-1">6.1 完整目录树 <a class="header-anchor" href="#_6-1-完整目录树" aria-label="Permalink to &quot;6.1 完整目录树&quot;">​</a></h3><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>imx-forge/</span></span>
<span class="line"><span>├── .devcontainer/              # VS Code Dev Container 配置</span></span>
<span class="line"><span>├── .git/                       # Git 仓库</span></span>
<span class="line"><span>│   └── modules/                # Submodule 检出位置</span></span>
<span class="line"><span>├── .gitmodules                 # Submodule 配置文件</span></span>
<span class="line"><span>├── document/                   # 项目文档</span></span>
<span class="line"><span>│   ├── architecture/           # 架构文档 (本目录)</span></span>
<span class="line"><span>│   │   └── SYSTEM_ARCHITECTURE.md</span></span>
<span class="line"><span>│   ├── logo/                   # 项目 Logo 资源</span></span>
<span class="line"><span>│   ├── todo/                   # 待办事项文档</span></span>
<span class="line"><span>│   └── tutorial/               # 教程文档</span></span>
<span class="line"><span>│       ├── kernel/             # 内核相关教程</span></span>
<span class="line"><span>│       ├── practical/          # 实践教程</span></span>
<span class="line"><span>│       ├── rootfs/             # Rootfs 教程</span></span>
<span class="line"><span>│       ├── start/              # 入门教程</span></span>
<span class="line"><span>│       └── uboot/              # U-Boot 教程</span></span>
<span class="line"><span>├── driver/                     # 驱动模块</span></span>
<span class="line"><span>│   └── device_tree/            # 设备树文件</span></span>
<span class="line"><span>│       └── alpha-board/        # 阿尔法板设备树</span></span>
<span class="line"><span>│           ├── linux/          # 内核设备树</span></span>
<span class="line"><span>│           └── uboot/          # U-Boot 设备树</span></span>
<span class="line"><span>├── out/                        # 构建输出目录</span></span>
<span class="line"><span>│   ├── busybox/                # BusyBox 构建产物</span></span>
<span class="line"><span>│   ├── linux/                  # Linux 内核构建产物</span></span>
<span class="line"><span>│   └── uboot/                  # U-Boot 构建产物</span></span>
<span class="line"><span>├── patches/                    # 补丁管理</span></span>
<span class="line"><span>│   ├── busybox/                # BusyBox 补丁</span></span>
<span class="line"><span>│   ├── linux-imx/              # linux-imx 轨道补丁</span></span>
<span class="line"><span>│   │   └── linux-imx-patch_test-20260314.patch</span></span>
<span class="line"><span>│   ├── linux-mainline/         # mainline 轨道补丁 (未来)</span></span>
<span class="line"><span>│   ├── uboot/                  # U-Boot mainline 补丁 (未来)</span></span>
<span class="line"><span>│   └── uboot-imx/              # U-Boot NXP fork 补丁</span></span>
<span class="line"><span>│       └── charlies_board.patch</span></span>
<span class="line"><span>├── rootfs/                     # 根文件系统</span></span>
<span class="line"><span>│   ├── nfs/                    # NFS Rootfs</span></span>
<span class="line"><span>│   │   ├── bin/                # 可执行文件</span></span>
<span class="line"><span>│   │   ├── dev/                # 设备文件</span></span>
<span class="line"><span>│   │   ├── etc/                # 配置文件</span></span>
<span class="line"><span>│   │   │   ├── fstab           # 文件系统挂载表</span></span>
<span class="line"><span>│   │   │   ├── init.d/         # 初始化脚本</span></span>
<span class="line"><span>│   │   │   │   └── rcS         # 系统初始化脚本</span></span>
<span class="line"><span>│   │   │   └── inittab         # init 配置</span></span>
<span class="line"><span>│   │   ├── home/               # 用户目录</span></span>
<span class="line"><span>│   │   ├── lib/                # 库文件</span></span>
<span class="line"><span>│   │   ├── mnt/                # 挂载点</span></span>
<span class="line"><span>│   │   ├── proc/               # proc 文件系统</span></span>
<span class="line"><span>│   │   ├── root/               # root 用户目录</span></span>
<span class="line"><span>│   │   ├── sbin/               # 系统可执行文件</span></span>
<span class="line"><span>│   │   ├── sys/                # sys 文件系统</span></span>
<span class="line"><span>│   │   ├── tmp/                # 临时文件</span></span>
<span class="line"><span>│   │   └── usr/                # 用户程序</span></span>
<span class="line"><span>│   └── src/                    # Rootfs 源文件</span></span>
<span class="line"><span>├── scripts/                    # 构建和工具脚本</span></span>
<span class="line"><span>│   ├── build_helper/           # 构建辅助脚本</span></span>
<span class="line"><span>│   │   ├── build-busybox.sh    # BusyBox 构建脚本</span></span>
<span class="line"><span>│   │   ├── build-linux.sh      # Linux 内核构建脚本</span></span>
<span class="line"><span>│   │   └── build-uboot.sh      # U-Boot 构建脚本</span></span>
<span class="line"><span>│   ├── lib/                    # 公共库</span></span>
<span class="line"><span>│   │   └── logging.sh          # 日志工具库</span></span>
<span class="line"><span>│   ├── logo_helper/            # Logo 生成工具</span></span>
<span class="line"><span>│   ├── patch_maker.sh          # 补丁生成脚本</span></span>
<span class="line"><span>│   ├── release_builder/        # 发布构建脚本</span></span>
<span class="line"><span>│   ├── server_helper/          # 服务器辅助脚本</span></span>
<span class="line"><span>│   ├── third_party_install/    # 第三方依赖安装</span></span>
<span class="line"><span>│   │   ├── README.md           # 安装脚本说明</span></span>
<span class="line"><span>│   │   └── install_libc.sh     # libc 安装脚本</span></span>
<span class="line"><span>│   └── varified_rootfs_ok.sh   # Rootfs 验证脚本</span></span>
<span class="line"><span>├── third_party/                # 第三方源码 (Submodule)</span></span>
<span class="line"><span>│   ├── busybox/                # BusyBox 源码</span></span>
<span class="line"><span>│   ├── linux-imx/              # NXP Linux 内核 fork</span></span>
<span class="line"><span>│   └── uboot-imx/              # NXP U-Boot fork</span></span>
<span class="line"><span>├── tools/                      # 工具集合</span></span>
<span class="line"><span>│   └── third_party/            # 第三方工具</span></span>
<span class="line"><span>├── LICENSE                     # 开源协议</span></span>
<span class="line"><span>├── README.md                   # 项目说明</span></span>
<span class="line"><span>└── roadmap.md                  # 项目路线图</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br><span class="line-number">42</span><br><span class="line-number">43</span><br><span class="line-number">44</span><br><span class="line-number">45</span><br><span class="line-number">46</span><br><span class="line-number">47</span><br><span class="line-number">48</span><br><span class="line-number">49</span><br><span class="line-number">50</span><br><span class="line-number">51</span><br><span class="line-number">52</span><br><span class="line-number">53</span><br><span class="line-number">54</span><br><span class="line-number">55</span><br><span class="line-number">56</span><br><span class="line-number">57</span><br><span class="line-number">58</span><br><span class="line-number">59</span><br><span class="line-number">60</span><br><span class="line-number">61</span><br><span class="line-number">62</span><br><span class="line-number">63</span><br><span class="line-number">64</span><br><span class="line-number">65</span><br><span class="line-number">66</span><br><span class="line-number">67</span><br><span class="line-number">68</span><br><span class="line-number">69</span><br><span class="line-number">70</span><br><span class="line-number">71</span><br><span class="line-number">72</span><br><span class="line-number">73</span><br><span class="line-number">74</span><br><span class="line-number">75</span><br><span class="line-number">76</span><br></div></div><h3 id="_6-2-目录功能说明表" tabindex="-1">6.2 目录功能说明表 <a class="header-anchor" href="#_6-2-目录功能说明表" aria-label="Permalink to &quot;6.2 目录功能说明表&quot;">​</a></h3><table tabindex="0"><thead><tr><th>目录路径</th><th>用途</th><th>维护策略</th></tr></thead><tbody><tr><td><code>scripts/</code></td><td>构建系统核心</td><td>项目维护，版本控制</td></tr><tr><td><code>patches/</code></td><td>补丁管理</td><td>项目维护，版本控制</td></tr><tr><td><code>third_party/</code></td><td>第三方源码</td><td>Submodule，独立更新</td></tr><tr><td><code>out/</code></td><td>构建输出</td><td>.gitignore，本地生成</td></tr><tr><td><code>rootfs/</code></td><td>根文件系统</td><td>框架版本控制，内容由脚本生成</td></tr><tr><td><code>driver/</code></td><td>自研驱动</td><td>项目维护，版本控制</td></tr><tr><td><code>document/</code></td><td>项目文档</td><td>项目维护，版本控制</td></tr><tr><td><code>tools/</code></td><td>工具集合</td><td>项目维护，版本控制</td></tr></tbody></table><hr><h2 id="_7-设计决策记录" tabindex="-1">7. 设计决策记录 <a class="header-anchor" href="#_7-设计决策记录" aria-label="Permalink to &quot;7. 设计决策记录&quot;">​</a></h2><h3 id="_7-1-为什么选择-format-patch-与-series-规划" tabindex="-1">7.1 为什么选择 format-patch 与 series 规划 <a class="header-anchor" href="#_7-1-为什么选择-format-patch-与-series-规划" aria-label="Permalink to &quot;7.1 为什么选择 format-patch 与 series 规划&quot;">​</a></h3><blockquote><p>当前实现说明：项目现有自动补丁脚本仍采用“按文件名排序，仅应用最新 patch”的简化策略。<code>series</code> 是推荐架构和后续增强方向，用于未来管理多补丁顺序。</p></blockquote><p><strong>背景</strong></p><p>嵌入式开发中，对厂商 BSP 的修改管理是一个挑战。直接修改源码无法追踪、无法复用、难以贡献回上游。</p><p><strong>决策</strong></p><p>采用 Git <code>format-patch</code> 生成的标准补丁格式；后续可配合 <code>series</code> 文件管理应用顺序。</p><p><strong>理由</strong></p><table tabindex="0"><thead><tr><th>优势</th><th>说明</th></tr></thead><tbody><tr><td>标准化</td><td>Git 原生支持，无需额外工具</td></tr><tr><td>可追溯</td><td>每个补丁包含完整的提交信息和作者信息</td></tr><tr><td>可贡献</td><td>补丁格式与上游内核贡献格式一致</td></tr><tr><td>可复用</td><td>补丁可以在不同版本间尝试应用</td></tr><tr><td>可审查</td><td>纯文本格式，便于代码审查</td></tr><tr><td>灵活性</td><td>通过 series 文件控制应用顺序和条件</td></tr></tbody></table><p><strong>实现</strong></p><div class="language-bash vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 生成补丁</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">git</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> format-patch</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -o</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> patches/linux-imx/</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> base_commit..HEAD</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 应用补丁</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">quilt</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> import</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> patches/linux-imx/</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">*</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">.patch</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">quilt</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> push</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -a</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 或使用 patch 命令</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">cat</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> patches/linux-imx/series</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> while</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> read</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> patch</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">; </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">do</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    patch</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -p1</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> &lt;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;patches/linux-imx/</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">$patch</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">done</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br></div></div><h3 id="_7-2-为什么采用双轨策略" tabindex="-1">7.2 为什么采用双轨策略 <a class="header-anchor" href="#_7-2-为什么采用双轨策略" aria-label="Permalink to &quot;7.2 为什么采用双轨策略&quot;">​</a></h3><p><strong>背景</strong></p><ul><li>NXP 提供的 linux-imx 分支包含大量针对 i.MX 系列的优化和驱动</li><li>主线内核 (mainline) 代表 Linux 的发展方向，长期维护更佳</li><li>直接切换到 mainline 需要大量适配工作，存在风险</li></ul><p><strong>决策</strong></p><p>采用双轨并行策略：以 linux-imx 为当前稳定轨道，同时探索 mainline 轨道。</p><p><strong>理由</strong></p><table tabindex="0"><thead><tr><th>稳定性 (linux-imx)</th><th>前瞻性 (mainline)</th></tr></thead><tbody><tr><td>NXP 官方支持</td><td>代表 Linux 未来</td></tr><tr><td>驱动完整</td><td>代码质量更高</td></tr><tr><td>立即可用</td><td>长期维护更佳</td></tr><tr><td>适合生产环境</td><td>适合学习和贡献</td></tr></tbody></table><p><strong>长期目标</strong></p><ol><li>v0.x: 完善 linux-imx 轨道，确保基础功能稳定</li><li>v1.x: 开始 mainline 探索，记录差异和移植经验</li><li>v2.x: mainline 功能完整，成为推荐轨道</li><li>未来: 积极向上游贡献补丁，减少本地修改</li></ol><h3 id="_7-3-为什么使用-git-submodule" tabindex="-1">7.3 为什么使用 Git Submodule <a class="header-anchor" href="#_7-3-为什么使用-git-submodule" aria-label="Permalink to &quot;7.3 为什么使用 Git Submodule&quot;">​</a></h3><p><strong>背景</strong></p><p>项目需要集成多个第三方大型代码库：</p><ul><li>linux-imx (~1GB+)</li><li>uboot-imx (~500MB+)</li><li>busybox (~50MB+)</li></ul><p><strong>决策选项对比</strong></p><table tabindex="0"><thead><tr><th>方案</th><th>优点</th><th>缺点</th></tr></thead><tbody><tr><td>直接复制</td><td>简单</td><td>体积大，无法更新</td></tr><tr><td>Git Submodule</td><td>独立更新，精确版本</td><td>学习曲线</td></tr><tr><td>下载脚本</td><td>灵活</td><td>无版本锁定</td></tr><tr><td>Vendor 分支</td><td>完全控制</td><td>合并复杂</td></tr></tbody></table><p><strong>选择 Git Submodule 的理由</strong></p><ol><li><strong>精确版本控制</strong>: 通过 commit hash 锁定第三方库版本</li><li><strong>独立更新</strong>: 第三方库的更新与主项目分离</li><li><strong>节省空间</strong>: Submodule 使用对象共享，节省存储</li><li><strong>社区标准</strong>: 广泛使用的依赖管理方式</li><li><strong>灵活性</strong>: 可以随时切换到任意 commit 或分支</li></ol><p><strong>配置策略</strong></p><div class="language-ini vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">ini</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">[submodule &quot;third_party/linux-imx&quot;]</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    path</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> = third_party/linux-imx</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    url</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> = https://github.com/nxp-imx/linux-imx.git</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    ignore</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> = dirty  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 忽略工作区修改，仅追踪提交</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br></div></div><h3 id="_7-4-为什么输出目录独立" tabindex="-1">7.4 为什么输出目录独立 <a class="header-anchor" href="#_7-4-为什么输出目录独立" aria-label="Permalink to &quot;7.4 为什么输出目录独立&quot;">​</a></h3><p><strong>背景</strong></p><p>构建产物体积大，且大部分是二进制文件，不应纳入版本控制。</p><p><strong>决策</strong></p><p>使用独立的 <code>out/</code> 目录存放所有构建输出，并在 <code>.gitignore</code> 中排除。</p><p><strong>理由</strong></p><ol><li><strong>清洁仓库</strong>: 源码与产物分离</li><li><strong>可重建</strong>: 任何时候都可以从源码重建</li><li><strong>灵活性</strong>: 可以随时删除 out/ 释放空间</li><li><strong>并行构建</strong>: 不同组件输出到不同子目录，互不干扰</li></ol><p><strong>目录结构</strong></p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>out/</span></span>
<span class="line"><span>├── busybox/    # BusyBox 构建输出</span></span>
<span class="line"><span>├── linux/      # Linux 内核构建输出</span></span>
<span class="line"><span>└── uboot/      # U-Boot 构建输出</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br></div></div><h3 id="_7-5-为什么-rootfs-采用脚本生成" tabindex="-1">7.5 为什么 Rootfs 采用脚本生成 <a class="header-anchor" href="#_7-5-为什么-rootfs-采用脚本生成" aria-label="Permalink to &quot;7.5 为什么 Rootfs 采用脚本生成&quot;">​</a></h3><p><strong>背景</strong></p><p>Rootfs 需要包含库文件、配置文件、初始化脚本等，手动维护容易出错。</p><p><strong>决策</strong></p><p>通过 <code>scripts/varified_rootfs_ok.sh</code> 脚本自动生成 Rootfs 结构和配置。</p><p><strong>理由</strong></p><ol><li><strong>可重现</strong>: 脚本确保每次生成的 Rootfs 一致</li><li><strong>可验证</strong>: 脚本内置验证逻辑</li><li><strong>可扩展</strong>: 通过第三方安装脚本机制扩展功能</li><li><strong>安全性</strong>: 内置目录安全检查，防止误操作系统根目录</li></ol><p><strong>扩展机制</strong></p><div class="language-bash vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># scripts/third_party_install/ 目录下的所有 .sh 脚本</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 会在 Rootfs 构建时自动执行，支持:</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># - 安装额外的库文件</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># - 添加自定义配置</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># - 执行特定的初始化操作</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br></div></div><hr><h2 id="_8-构建系统架构" tabindex="-1">8. 构建系统架构 <a class="header-anchor" href="#_8-构建系统架构" aria-label="Permalink to &quot;8. 构建系统架构&quot;">​</a></h2><h3 id="_8-1-构建系统组件图" tabindex="-1">8.1 构建系统组件图 <a class="header-anchor" href="#_8-1-构建系统组件图" aria-label="Permalink to &quot;8.1 构建系统组件图&quot;">​</a></h3><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>┌─────────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                        构建系统架构                                  │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│                                                                      │</span></span>
<span class="line"><span>│  用户接口层                                                          │</span></span>
<span class="line"><span>│  ┌──────────────────────────────────────────────────────────────┐  │</span></span>
<span class="line"><span>│  │  scripts/build.sh (未来实现)                                  │  │</span></span>
<span class="line"><span>│  │    --board=alpha --rootfs=busybox --clean                    │  │</span></span>
<span class="line"><span>│  └──────────────────────────────────────────────────────────────┘  │</span></span>
<span class="line"><span>│                           │                                          │</span></span>
<span class="line"><span>│                           ▼                                          │</span></span>
<span class="line"><span>│  构建辅助层                                                        │</span></span>
<span class="line"><span>│  ┌──────────────────────────────────────────────────────────────┐  │</span></span>
<span class="line"><span>│  │  scripts/build_helper/                                       │  │</span></span>
<span class="line"><span>│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │  │</span></span>
<span class="line"><span>│  │  │build-linux  │  │build-uboot  │  │  build-busybox      │  │  │</span></span>
<span class="line"><span>│  │  │    .sh      │  │    .sh      │  │       .sh           │  │  │</span></span>
<span class="line"><span>│  │  └─────────────┘  └─────────────┘  └─────────────────────┘  │  │</span></span>
<span class="line"><span>│  └──────────────────────────────────────────────────────────────┘  │</span></span>
<span class="line"><span>│                           │                                          │</span></span>
<span class="line"><span>│                           ▼                                          │</span></span>
<span class="line"><span>│  公共服务层                                                        │</span></span>
<span class="line"><span>│  ┌──────────────────────────────────────────────────────────────┐  │</span></span>
<span class="line"><span>│  │  scripts/lib/                                                │  │</span></span>
<span class="line"><span>│  │  ┌────────────────────────────────────────────────────────┐ │  │</span></span>
<span class="line"><span>│  │  │ logging.sh - 统一日志接口                               │ │  │</span></span>
<span class="line"><span>│  │  │   - log_info(), log_error(), log_warn(), log_debug()   │ │  │</span></span>
<span class="line"><span>│  │  └────────────────────────────────────────────────────────┘ │  │</span></span>
<span class="line"><span>│  └──────────────────────────────────────────────────────────────┘  │</span></span>
<span class="line"><span>│                           │                                          │</span></span>
<span class="line"><span>│                           ▼                                          │</span></span>
<span class="line"><span>│  工具支持层                                                        │</span></span>
<span class="line"><span>│  ┌──────────────────────────────────────────────────────────────┐  │</span></span>
<span class="line"><span>│  │  scripts/patch_maker.sh - 补丁生成工具                        │  │</span></span>
<span class="line"><span>│  │  scripts/release_builder/ - 发布打包工具                      │  │</span></span>
<span class="line"><span>│  │  scripts/third_party_install/ - 依赖安装脚本                  │  │</span></span>
<span class="line"><span>│  └──────────────────────────────────────────────────────────────┘  │</span></span>
<span class="line"><span>│                                                                      │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────────────┘</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br></div></div><h3 id="_8-2-构建脚本依赖图" tabindex="-1">8.2 构建脚本依赖图 <a class="header-anchor" href="#_8-2-构建脚本依赖图" aria-label="Permalink to &quot;8.2 构建脚本依赖图&quot;">​</a></h3><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>┌─────────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                       脚本依赖关系图                                 │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│                                                                      │</span></span>
<span class="line"><span>│  build-linux.sh                                                     │</span></span>
<span class="line"><span>│      │                                                               │</span></span>
<span class="line"><span>│      ├──▶ source scripts/lib/logging.sh                             │</span></span>
<span class="line"><span>│      │                                                               │</span></span>
<span class="line"><span>│      ├──▶ check_host_dependencies()                                 │</span></span>
<span class="line"><span>│      │        │                                                     │</span></span>
<span class="line"><span>│      │        ├── check_cmd (gcc, make, bc, bison, flex...)        │</span></span>
<span class="line"><span>│      │        ├── check_dpkg (libssl-dev, libncurses-dev...)        │</span></span>
<span class="line"><span>│      │        └── check_python_module                               │</span></span>
<span class="line"><span>│      │                                                               │</span></span>
<span class="line"><span>│      ├──▶ check_toolchain()                                         │</span></span>
<span class="line"><span>│      │        │                                                     │</span></span>
<span class="line"><span>│      │        └── \${CROSS_COMPILE}gcc, objcopy, objdump...          │</span></span>
<span class="line"><span>│      │                                                               │</span></span>
<span class="line"><span>│      ├──▶ apply patches/linux-imx/*.patch                           │</span></span>
<span class="line"><span>│      │                                                               │</span></span>
<span class="line"><span>│      ├──▶ do_configure()                                            │</span></span>
<span class="line"><span>│      │        │                                                     │</span></span>
<span class="line"><span>│      │        └── make \${DEFCONFIG}                                 │</span></span>
<span class="line"><span>│      │                                                               │</span></span>
<span class="line"><span>│      └──▶ do_build()                                                │</span></span>
<span class="line"><span>│               │                                                     │</span></span>
<span class="line"><span>│               └── make -j\${NPROC}                                   │</span></span>
<span class="line"><span>│                                                                      │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────────────┘</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br></div></div><h3 id="_8-3-环境变量与配置" tabindex="-1">8.3 环境变量与配置 <a class="header-anchor" href="#_8-3-环境变量与配置" aria-label="Permalink to &quot;8.3 环境变量与配置&quot;">​</a></h3><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>┌─────────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                      配置变量说明                                    │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│                                                                      │</span></span>
<span class="line"><span>│  全局配置 (可在脚本中覆盖)                                           │</span></span>
<span class="line"><span>│  ┌──────────────────────────────────────────────────────────────┐  │</span></span>
<span class="line"><span>│  │  ARCH=arm                                                    │  │</span></span>
<span class="line"><span>│  │  CROSS_COMPILE=arm-none-linux-gnueabihf-                     │  │</span></span>
<span class="line"><span>│  │  NPROC=$(nproc)                                              │  │</span></span>
<span class="line"><span>│  │  PROJECT_ROOT=$(自动检测)                                     │  │</span></span>
<span class="line"><span>│  └──────────────────────────────────────────────────────────────┘  │</span></span>
<span class="line"><span>│                                                                      │</span></span>
<span class="line"><span>│  Linux 构建配置                                                      │</span></span>
<span class="line"><span>│  ┌──────────────────────────────────────────────────────────────┐  │</span></span>
<span class="line"><span>│  │  LINUX_SRC_DIR=\${PROJECT_ROOT}/third_party/linux-imx         │  │</span></span>
<span class="line"><span>│  │  OUTPUT_DIR=\${PROJECT_ROOT}/out/linux                        │  │</span></span>
<span class="line"><span>│  │  DEFCONFIG=imx_aes_defconfig                                 │  │</span></span>
<span class="line"><span>│  └──────────────────────────────────────────────────────────────┘  │</span></span>
<span class="line"><span>│                                                                      │</span></span>
<span class="line"><span>│  U-Boot 构建配置                                                     │</span></span>
<span class="line"><span>│  ┌──────────────────────────────────────────────────────────────┐  │</span></span>
<span class="line"><span>│  │  UBOOT_SRC_DIR=\${PROJECT_ROOT}/third_party/uboot-imx         │  │</span></span>
<span class="line"><span>│  │  OUTPUT_DIR=\${PROJECT_ROOT}/out/uboot                        │  │</span></span>
<span class="line"><span>│  │  DEFCONFIG=...                                               │  │</span></span>
<span class="line"><span>│  └──────────────────────────────────────────────────────────────┘  │</span></span>
<span class="line"><span>│                                                                      │</span></span>
<span class="line"><span>│  Rootfs 配置                                                         │</span></span>
<span class="line"><span>│  ┌──────────────────────────────────────────────────────────────┐  │</span></span>
<span class="line"><span>│  │  ROOTFS_DIR=\${PROJECT_ROOT}/rootfs/nfs                       │  │</span></span>
<span class="line"><span>│  │  CROSS_COMPILE=arm-none-linux-gnueabihf-                     │  │</span></span>
<span class="line"><span>│  └──────────────────────────────────────────────────────────────┘  │</span></span>
<span class="line"><span>│                                                                      │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────────────┘</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br></div></div><hr><h2 id="_9-扩展机制" tabindex="-1">9. 扩展机制 <a class="header-anchor" href="#_9-扩展机制" aria-label="Permalink to &quot;9. 扩展机制&quot;">​</a></h2><h3 id="_9-1-板卡接入扩展" tabindex="-1">9.1 板卡接入扩展 <a class="header-anchor" href="#_9-1-板卡接入扩展" aria-label="Permalink to &quot;9.1 板卡接入扩展&quot;">​</a></h3><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>┌─────────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                       新板卡接入流程                                 │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│                                                                      │</span></span>
<span class="line"><span>│  1. 创建板卡目录                                                    │</span></span>
<span class="line"><span>│  ┌──────────────────────────────────────────────────────────────┐  │</span></span>
<span class="line"><span>│  │  boards/custom-v1/                                           │  │</span></span>
<span class="line"><span>│  │    ├── BOARD.yaml          # 板卡元数据                      │  │</span></span>
<span class="line"><span>│  │    ├── configs/            # 板级配置                         │  │</span></span>
<span class="line"><span>│  │    │   └── kernel_defconfig                                   │  │</span></span>
<span class="line"><span>│  │    └── dts/                # 设备树源文件                     │  │</span></span>
<span class="line"><span>│  │        └── imx6ull-custom.dts                                 │  │</span></span>
<span class="line"><span>│  └──────────────────────────────────────────────────────────────┘  │</span></span>
<span class="line"><span>│                                                                      │</span></span>
<span class="line"><span>│  2. 配置板卡信息 (未来实现)                                          │</span></span>
<span class="line"><span>│  ┌──────────────────────────────────────────────────────────────┐  │</span></span>
<span class="line"><span>│  │  BOARD.yaml 内容:                                            │  │</span></span>
<span class="line"><span>│  │    name: &quot;Custom Board v1&quot;                                   │  │</span></span>
<span class="line"><span>│  │    chip: &quot;i.MX6ULL&quot;                                          │  │</span></span>
<span class="line"><span>│  │    storage: [&quot;eMMC&quot;, &quot;SD&quot;]                                   │  │</span></span>
<span class="line"><span>│  │    defconfig: &quot;custom_defconfig&quot;                             │  │</span></span>
<span class="line"><span>│  │    dtb: &quot;imx6ull-custom.dtb&quot;                                 │  │</span></span>
<span class="line"><span>│  └──────────────────────────────────────────────────────────────┘  │</span></span>
<span class="line"><span>│                                                                      │</span></span>
<span class="line"><span>│  3. 构建命令 (未来实现)                                              │</span></span>
<span class="line"><span>│     scripts/build.sh --board=custom-v1                              │</span></span>
<span class="line"><span>│                                                                      │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────────────┘</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br></div></div><h3 id="_9-2-rootfs-扩展机制" tabindex="-1">9.2 Rootfs 扩展机制 <a class="header-anchor" href="#_9-2-rootfs-扩展机制" aria-label="Permalink to &quot;9.2 Rootfs 扩展机制&quot;">​</a></h3><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>┌─────────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                   Rootfs 第三方安装脚本                              │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│                                                                      │</span></span>
<span class="line"><span>│  scripts/third_party_install/                                       │</span></span>
<span class="line"><span>│  │                                                                   │</span></span>
<span class="line"><span>│  ├── 10-install-libc.sh    # 安装 libc 库                          │</span></span>
<span class="line"><span>│  ├── 20-install-ssl.sh     # 安装 OpenSSL 库                       │</span></span>
<span class="line"><span>│  ├── 30-install-custom.sh  # 安装自定义库                          │</span></span>
<span class="line"><span>│  └── README.md             # 说明文档                              │</span></span>
<span class="line"><span>│                      │                                              │</span></span>
<span class="line"><span>│                      ▼                                              │</span></span>
<span class="line"><span>│  执行流程:                                                           │</span></span>
<span class="line"><span>│  1. 按文件名字母顺序执行                                             │</span></span>
<span class="line"><span>│  2. 导出环境变量: ROOTFS_DIR, PROJECT_ROOT                           │</span></span>
<span class="line"><span>│  3. 每个脚本独立运行，失败不影响其他脚本 (可选策略)                   │</span></span>
<span class="line"><span>│                                                                      │</span></span>
<span class="line"><span>│  脚本模板:                                                           │</span></span>
<span class="line"><span>│  ┌──────────────────────────────────────────────────────────────┐  │</span></span>
<span class="line"><span>│  │  #!/bin/bash                                                 │  │</span></span>
<span class="line"><span>│  │  : &quot;\${ROOTFS_DIR:=../../rootfs/nfs}&quot;                         │  │</span></span>
<span class="line"><span>│  │  set -e                                                      │  │</span></span>
<span class="line"><span>│  │  # 安装逻辑...                                               │  │</span></span>
<span class="line"><span>│  └──────────────────────────────────────────────────────────────┘  │</span></span>
<span class="line"><span>│                                                                      │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────────────┘</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br></div></div><h3 id="_9-3-驱动模块扩展" tabindex="-1">9.3 驱动模块扩展 <a class="header-anchor" href="#_9-3-驱动模块扩展" aria-label="Permalink to &quot;9.3 驱动模块扩展&quot;">​</a></h3><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>┌─────────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                       驱动模块组织                                   │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│                                                                      │</span></span>
<span class="line"><span>│  driver/                                                             │</span></span>
<span class="line"><span>│  │                                                                   │</span></span>
<span class="line"><span>│  ├── device_tree/           # 设备树 overlay                        │</span></span>
<span class="line"><span>│  │   └── alpha-board/                                              │</span></span>
<span class="line"><span>│  │       ├── linux/                                                 │</span></span>
<span class="line"><span>│  │       │   └── imx6ull-alpha.dts                                  │</span></span>
<span class="line"><span>│  │       └── uboot/                                                 │</span></span>
<span class="line"><span>│  │           └── imx6ull-alpha-u-boot.dts                            │</span></span>
<span class="line"><span>│  │                                                                   │</span></span>
<span class="line"><span>│  └── modules/               # 内核模块 (未来)                        │</span></span>
<span class="line"><span>│      ├── rs485-control/                                             │</span></span>
<span class="line"><span>│      │   ├── rs485_control.c                                        │</span></span>
<span class="line"><span>│      │   ├── Kconfig                                               │</span></span>
<span class="line"><span>│      │   └── Makefile                                              │</span></span>
<span class="line"><span>│      └── README.md                                                 │</span></span>
<span class="line"><span>│                                                                      │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────────────┘</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br></div></div><hr><h2 id="附录" tabindex="-1">附录 <a class="header-anchor" href="#附录" aria-label="Permalink to &quot;附录&quot;">​</a></h2><h3 id="a-快速参考" tabindex="-1">A. 快速参考 <a class="header-anchor" href="#a-快速参考" aria-label="Permalink to &quot;A. 快速参考&quot;">​</a></h3><h4 id="a-1-常用目录路径" tabindex="-1">A.1 常用目录路径 <a class="header-anchor" href="#a-1-常用目录路径" aria-label="Permalink to &quot;A.1 常用目录路径&quot;">​</a></h4><table tabindex="0"><thead><tr><th>路径</th><th>说明</th></tr></thead><tbody><tr><td><code>third_party/linux-imx</code></td><td>Linux 内核源码</td></tr><tr><td><code>third_party/uboot-imx</code></td><td>U-Boot 源码</td></tr><tr><td><code>third_party/busybox</code></td><td>BusyBox 源码</td></tr><tr><td><code>patches/linux-imx</code></td><td>Linux 补丁</td></tr><tr><td><code>patches/uboot-imx</code></td><td>U-Boot 补丁</td></tr><tr><td><code>out/linux</code></td><td>Linux 构建输出</td></tr><tr><td><code>out/uboot</code></td><td>U-Boot 构建输出</td></tr><tr><td><code>out/busybox</code></td><td>BusyBox 构建输出</td></tr><tr><td><code>rootfs/nfs</code></td><td>NFS Rootfs</td></tr><tr><td><code>driver/device_tree</code></td><td>设备树文件</td></tr></tbody></table><h4 id="a-2-常用脚本命令" tabindex="-1">A.2 常用脚本命令 <a class="header-anchor" href="#a-2-常用脚本命令" aria-label="Permalink to &quot;A.2 常用脚本命令&quot;">​</a></h4><div class="language-bash vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 构建 Linux 内核</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">scripts/build_helper/build-linux.sh</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 构建 U-Boot</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">scripts/build_helper/build-uboot.sh</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 构建 BusyBox</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">scripts/build_helper/build-busybox.sh</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 验证和完成 Rootfs</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">scripts/varified_rootfs_ok.sh</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 生成补丁</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">scripts/patch_maker.sh</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --submodule_path=linux-imx</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 快速构建 (跳过 distclean)</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">scripts/build_helper/build-linux.sh</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --fast-build</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br></div></div><h3 id="b-版本控制规范" tabindex="-1">B. 版本控制规范 <a class="header-anchor" href="#b-版本控制规范" aria-label="Permalink to &quot;B. 版本控制规范&quot;">​</a></h3><h4 id="b-1-补丁命名规范" tabindex="-1">B.1 补丁命名规范 <a class="header-anchor" href="#b-1-补丁命名规范" aria-label="Permalink to &quot;B.1 补丁命名规范&quot;">​</a></h4><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>格式: [轨道类型] 简短描述</span></span>
<span class="line"><span></span></span>
<span class="line"><span>轨道类型:</span></span>
<span class="line"><span>  - [linux-imx]   NXP BSP 轨道补丁</span></span>
<span class="line"><span>  - [mainline]    主线内核轨道补丁</span></span>
<span class="line"><span>  - [uboot-imx]   U-Boot NXP fork 补丁</span></span>
<span class="line"><span>  - [uboot-main]  U-Boot 主线补丁</span></span>
<span class="line"><span></span></span>
<span class="line"><span>示例:</span></span>
<span class="line"><span>  [linux-imx] drivers: add alpha board support</span></span>
<span class="line"><span>  [mainline] net: fec: add imx6ull support</span></span>
<span class="line"><span>  [uboot-imx] board: enable alpha board</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br></div></div><h4 id="b-2-commit-规范" tabindex="-1">B.2 Commit 规范 <a class="header-anchor" href="#b-2-commit-规范" aria-label="Permalink to &quot;B.2 Commit 规范&quot;">​</a></h4><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>格式: &lt;类型&gt;: &lt;简短描述&gt;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>类型:</span></span>
<span class="line"><span>  - feat:     新功能</span></span>
<span class="line"><span>  - fix:      Bug 修复</span></span>
<span class="line"><span>  - docs:     文档更新</span></span>
<span class="line"><span>  - style:    代码格式</span></span>
<span class="line"><span>  - refactor: 代码重构</span></span>
<span class="line"><span>  - test:     测试相关</span></span>
<span class="line"><span>  - chore:    构建/工具相关</span></span>
<span class="line"><span></span></span>
<span class="line"><span>示例:</span></span>
<span class="line"><span>  feat(build): add linux build script</span></span>
<span class="line"><span>  fix(patches): correct series file order</span></span>
<span class="line"><span>  docs(readme): update board support table</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br></div></div><h3 id="c-故障排查" tabindex="-1">C. 故障排查 <a class="header-anchor" href="#c-故障排查" aria-label="Permalink to &quot;C. 故障排查&quot;">​</a></h3><h4 id="c-1-常见问题" tabindex="-1">C.1 常见问题 <a class="header-anchor" href="#c-1-常见问题" aria-label="Permalink to &quot;C.1 常见问题&quot;">​</a></h4><table tabindex="0"><thead><tr><th>问题</th><th>可能原因</th><th>解决方案</th></tr></thead><tbody><tr><td>编译失败</td><td>缺少依赖</td><td>运行 <code>sudo apt install ...</code></td></tr><tr><td>补丁应用失败</td><td>版本不匹配</td><td>检查 submodule 版本</td></tr><tr><td>交叉编译错误</td><td>工具链未找到</td><td>检查 PATH 环境变量</td></tr><tr><td>Rootfs 启动失败</td><td>配置文件缺失</td><td>运行 <code>varified_rootfs_ok.sh</code></td></tr></tbody></table><h4 id="c-2-日志级别" tabindex="-1">C.2 日志级别 <a class="header-anchor" href="#c-2-日志级别" aria-label="Permalink to &quot;C.2 日志级别&quot;">​</a></h4><div class="language-bash vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 启用调试输出</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">DEBUG</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">1</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> scripts/build_helper/build-linux.sh</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 查看构建日志</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">cat</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> out/linux/build.log</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 查看补丁应用日志</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">quilt</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> push</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -v</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br></div></div><hr><h2 id="文档修订历史" tabindex="-1">文档修订历史 <a class="header-anchor" href="#文档修订历史" aria-label="Permalink to &quot;文档修订历史&quot;">​</a></h2><table tabindex="0"><thead><tr><th>版本</th><th>日期</th><th>作者</th><th>变更说明</th></tr></thead><tbody><tr><td>v1.0</td><td>2026-03-15</td><td>IMX-Forge</td><td>初始版本</td></tr></tbody></table><hr><h2 id="联系方式" tabindex="-1">联系方式 <a class="header-anchor" href="#联系方式" aria-label="Permalink to &quot;联系方式&quot;">​</a></h2><ul><li>项目主页: <a href="https://github.com/Awesome-Embedded-Learning-Studio/imx-forge" target="_blank" rel="noreferrer">GitHub</a></li><li>问题反馈: <a href="https://github.com/Awesome-Embedded-Learning-Studio/imx-forge/issues" target="_blank" rel="noreferrer">Issues</a></li></ul><hr><div align="center"><p><strong>IMX-Forge - 让 i.MX6ULL 开发更简单</strong></p></div>`,143)])])}const m=n(e,[["render",i]]);export{o as __pageData,m as default};
