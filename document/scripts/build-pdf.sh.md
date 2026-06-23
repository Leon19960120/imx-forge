# build-pdf.sh 说明文档

> **文件路径**: `scripts/build-pdf.sh`
> **脚本类型**: 固化入口（PDF 导出）
> **状态**: 稳定

## 概述

一键生成 IMX-Forge **整站教程**的单本 PDF,采用纯 Python 链路:**pandoc**(markdown → html5,带目录与代码高亮)+ **WeasyPrint**(html → pdf,CSS Paged Media)。

该脚本绕开 VitePress / 构建出的网站 / Chromium,直接把 `document/` 下的 markdown 源渲染成「一本书」。`build-pdf.sh` 本身只是**固化入口**:负责把工作目录切到仓库根,然后用 `uv` 按需拉取依赖(`pypandoc-binary` 内置 pandoc;`weasyprint` 需系统库 pango/cairo)并执行真正的核心脚本 [scripts/build_pdf.py](../../../scripts/build_pdf.py)。CI 中由 [.github/workflows/pdf-export.yml](../../../.github/workflows/pdf-export.yml) 手动触发调用。

## 使用方法

```bash
# 基本用法(在仓库任意目录下均可,脚本会自动 cd 到仓库根)
./scripts/build-pdf.sh

# 本地免 root 运行(uv 负责按需拉取 Python 依赖)
uv run --no-project --with pypandoc-binary --with weasyprint \
  python3 scripts/build_pdf.py
```

> 说明:`build-pdf.sh` 自身不接受任何参数,它只是把所有命令行参数(`"$@"`)原样转发给 `build_pdf.py`;而 `build_pdf.py` 目前也无参数,行为由源码内的常量(输出路径、卷顺序、封面元信息等)决定。

## 参数说明

`build-pdf.sh` 不接受参数。脚本内部执行的命令:

| 命令片段 | 说明 |
|----------|------|
| `set -euo pipefail` | 严格模式:遇错即退出、未定义变量报错、管道任一环节失败即整体失败 |
| `cd "$(dirname "$0")/.."` | 切到仓库根目录,保证相对路径(`document/`、`scripts/`、`dist-pdf/`)正确 |
| `exec uv run --no-project --with pypandoc-binary --with weasyprint` | 用 `uv` 在隔离环境按需拉取依赖,`--no-project` 表示不依赖本项目的虚拟环境 |
| `python3 scripts/build_pdf.py "$@"` | 执行核心渲染脚本,转发额外参数 |

## 执行流程

1. **初始化**:开启 `set -euo pipefail`,切到仓库根目录。
2. **拉依赖**:由 `uv` 按需安装 `pypandoc-binary`(含 pandoc)与 `weasyprint`。
3. **收集章节**(`build_pdf.py`):按「卷顺序 → sidebar.ts 的 sortEntries/LEARNING_ORDER → 字典序」DFS 遍历 `document/`,得到符合网站侧边栏阅读顺序的 markdown 列表。
4. **预处理 markdown**:剥离 YAML frontmatter 与 VitePress 专属语法(Vue 组件标签、`<ChapterLink>` 转列表项等),得到 pandoc 能干净处理的 md。
5. **pandoc 转换**:markdown → html5,生成目录(`--toc`,深度 3)、tango 代码高亮,保留 raw HTML。
6. **注入封面与样式**:移除 pandoc 默认标题块,插入美化封面(眉题/书名/副标题/作者/生成日期);挂载 [scripts/book.css](../../../scripts/book.css) 的 CSS Paged Media 样式。
7. **WeasyPrint 渲染**:html → pdf,按卷分页(`part-break` / `chapter-break`)输出到 `dist-pdf/imx-forge.pdf`,打印体积。

## 依赖关系

### 依赖的脚本与文件
- [scripts/build_pdf.py](../../../scripts/build_pdf.py) — 核心渲染逻辑(章节收集、预处理、pandoc + WeasyPrint 调用)
- [scripts/book.css](../../../scripts/book.css) — PDF 排版样式(CSS Paged Media:封面、分页、代码高亮等)
- `document/` — 被渲染的 markdown 源(`scripts/`、`tutorial/` 等卷目录)

> 阅读顺序**复刻**(而非运行时读取)`site/.vitepress/config/sidebar.ts` 的排序逻辑:想调整 PDF 内章节顺序 = 改 `document/` 里的目录名/数字前缀(与网站侧边栏保持一致),无需改本脚本。

### 依赖的工具
- `uv` — Astral 的 Python 运行器,负责按需拉取/隔离依赖
- `python3` — 解释器
- `pypandoc-binary`(uv 拉取)— 内置 pandoc,markdown → html5
- `weasyprint`(uv 拉取)— html → pdf,需系统库支持:
  - `libpango-1.0-0`、`libpangoft2-1.0-0`、`libharfbuzz0b`
  - `libcairo2`、`libgdk-pixbuf-2.0-0`
  - 中文字体:`fonts-noto-cjk`(否则中文渲染为方块)

> 本机已预装上述系统库;CI 里由 `pdf-export.yml` 的 `apt-get` 步骤安装。

## 环境变量

无特殊环境变量要求。依赖完全由 `uv` 在隔离环境内管理,不污染本机 Python 环境。

## 输出产物

- **本地/CI 产物**:`dist-pdf/imx-forge.pdf`(文件名固定)
- **CI 上传**:GitHub Actions artifact(名 `imx-forge-pdf`,14 天质检留存)
- **CI 发布**:独立轻量 PDF Release,asset 名固定 `imx-forge.pdf`,供稳定下载链接指向:
  ```
  https://github.com/Awesome-Embedded-Learning-Studio/imx-forge/releases/latest/download/imx-forge.pdf
  ```

## 故障排除

### 常见错误

**错误**: WeasyPrint 报缺库 / 中文显示为方块(■)
**原因**: 系统缺少 pango/cairo/harfbuzz 等库,或缺中文字体 `fonts-noto-cjk`
**解决**:
```bash
sudo apt-get install -y \
  libpango-1.0-0 libpangoft2-1.0-0 libharfbuzz0b \
  libcairo2 libgdk-pixbuf-2.0-0 fonts-noto-cjk
```

**错误**: `uv: command not found`
**原因**: 本机未安装 `uv`
**解决**: 安装 [uv](https://docs.astral.sh/uv/)(如 `curl -LsSf https://astral.sh/uv/install.sh | sh`)

**错误**: 报 `未在 document/ 找到任何 markdown`
**原因**: 未在仓库根运行,或 `document/` 目录缺失
**解决**: 用 `./scripts/build-pdf.sh`(脚本会自动 `cd` 到仓库根),并确认 `document/` 存在

**错误**: VitePress 专属组件(如 `<RoadMap>`)残留在 PDF 里
**原因**: 新增的 Vue 组件名未加入预处理器的白名单
**解决**: 在 [scripts/build_pdf.py](../../../scripts/build_pdf.py) 的 `VUE_WRAP_LINE` / `RESIDUAL_COMP` 正则里补上该组件名

## 设计理念

1. **纯 Python 链路** — 仅靠 pandoc + WeasyPrint,绕开 VitePress / 网站 / Chromium,本地与 CI 行为一致且轻量。
2. **阅读顺序与网站同步** — 章节顺序复刻 `sidebar.ts`,调 `document/` 目录命名即可同时影响网站侧边栏与 PDF,单一数据源。
3. **入口与逻辑分离** — `build-pdf.sh` 只做固化入口(cd + uv 拉依赖 + exec),核心逻辑集中在 `build_pdf.py`,便于维护。
4. **CI 与发版解耦** — `pdf-export.yml` 手动触发、独立轻量 Release,不挂在 push/tag/release 上,不影响发版流水线。

## 更新日志

| 日期 | 版本 | 更新内容 |
|------|------|----------|
| 2026-06-23 | 1.0 | 初始版本,补充完整说明(pandoc + WeasyPrint 整站 PDF 导出入口) |

---

> **文档生成时间**: 2026-06-23
> **对应提交**: `feat(pdf): add pandoc + WeasyPrint whole-site tutorial PDF export (#83)`
