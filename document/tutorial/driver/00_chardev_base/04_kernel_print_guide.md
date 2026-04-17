# 内核打印详解

## 内核里的"printf"去哪了？

当你第一次写内核模块时，最自然的冲动可能是写上一句：

```c
printf("Hello, kernel!\n");  // ❌ 编译错误！
```

然后你就会得到一个困惑的编译错误：`implicit declaration of function 'printf'`。

为什么？**因为内核里没有标准 C 库。**

这不是内核开发者故意刁难你，而是有深刻的技术原因。标准 C 库（glibc）是为用户空间程序设计的，它依赖用户空间的种种设施——而内核运行在一个完全不同的世界里。

所以，内核有自己的打印系统：**printk**。

---

## printk vs printf：名字的微妙差异

你可能会问：为什么不直接叫 `kprintf` 或者 `kernel_printf`，而是叫 `printk`？

这不是随意的命名，而是有深意的：

- **printf** = **print formatted**（格式化打印）
- **printk** = **print kernel**（内核打印）

那个 `k` 代表 kernel，提醒你：这不是普通的打印，这是在内核空间的打印。

更重要的是，`printk` 和 `printf` 有本质区别：

### 1. 日志级别机制

```c
// 用户空间的 printf
printf("Hello, world\n");  // 无日志级别概念

// 内核空间的 printk
printk(KERN_INFO "Hello, kernel\n");  // 有日志级别：INFO
printk(KERN_ERR "Something went wrong\n");  // 日志级别：ERROR
```

### 2. 输出目的地不同

- **printf**：标准输出（stdout）
- **printk**：内核日志缓冲区（通过 `dmesg` 查看）

### 3. 运行环境不同

- **printf**：用户空间，可以调用各种库函数
- **printk**：内核空间，不能睡眠，必须快速执行

---

## 日志级别：从紧急到调试

Linux 内核定义了 8 个日志级别，每个级别对应不同的紧急程度：

### 日志级别一览

| 级别 | 宏名称 | 数值 | 用途 | 示例场景 |
|------|--------|------|------|----------|
| 0 | `KERN_EMERG` | 0 | 紧急情况，系统不可用 | 内核崩溃、硬件故障 |
| 1 | `KERN_ALERT` | 1 | 必须立即采取行动 | 安全漏洞、关键数据损坏 |
| 2 | `KERN_CRIT` | 2 | 严重条件 | 硬件错误、文件系统损坏 |
| 3 | `KERN_ERR` | 3 | 错误条件 | 设备初始化失败、I/O 错误 |
| 4 | `KERN_WARNING` | 4 | 警告条件 | 使用了过时的 API、非致命错误 |
| 5 | `KERN_NOTICE` | 5 | 正常但重要 | 安全事件、重要状态变化 |
| 6 | `KERN_INFO` | 7 | 信息性消息 | 设备加载、正常操作 |
| 7 | `KERN_DEBUG` | 7 | 调试消息 | 详细调试信息、变量值 |

### 实际测试输出展示

让我们看看 `modern_print_kernel_base00_driver` 的实际输出，了解不同日志级别的效果：

```
[  276.787517] EMERGENCY: System is unusable (level 0)
[  276.787526] ALERT: Action must be taken immediately (level 1)
[  276.787534] CRITICAL: Critical conditions occurred (level 2)
[  276.787541] ERROR: Error condition detected (level 3)
[  276.787549] WARNING: Warning condition (level 4)
[  276.787556] NOTICE: Normal but significant condition (level 5)
[  276.787564] INFO: Informational message (level 6)
```

注意最后一行缺少了 DEBUG 级别的输出！这是因为默认的内核日志级别设置会过滤掉 DEBUG 消息。

---

## pr_* 宏：现代化的打印方式

直接使用 `printk` 虽然可以，但内核开发者提供了更便利的 `pr_*` 宏系列：

```c
// 传统方式
printk(KERN_INFO "Device initialized\n");

// 现代方式（推荐）
pr_info("Device initialized\n");

// 其他级别
pr_emerg("Emergency condition!\n");
pr_alert("Alert: action required!\n");
pr_crit("Critical error occurred!\n");
pr_err("Error: operation failed\n");
pr_warn("Warning: using fallback\n");
pr_notice("Notice: state changed\n");
pr_debug("Debug: variable value = %d\n", value);
```

### pr_* 宏的优势

1. **更简洁**：不需要手动添加 `KERN_XXX` 前缀
2. **更安全**：自动处理格式化字符串
3. **更易读**：代码更清晰
4. **支持前缀**：可以统一添加模块名前缀

---

## pr_fmt：统一前缀的魔法

你注意到前面的测试输出中，每条消息都有一个前缀：`modern_print_kernel_base00_driver:`

这个前缀是怎么来的？答案是：**`pr_fmt` 宏**。

### pr_fmt 的定义

```c
// 在驱动源码文件的开头定义
#define pr_fmt(fmt) "MY_DRIVER: " fmt

// 后续所有的 pr_* 宏都会自动添加这个前缀
pr_info("Device loaded\n");
// 实际输出：MY_DRIVER: Device loaded
```

### 实际案例

在 `modern_print_kernel_base00_driver` 中：

```c
#define pr_fmt(fmt) "MODERN_PRINT_KERNEL: " fmt

// 后续所有打印都自动加上这个前缀
pr_info("=== Modern Kernel Print Usage Demo ===\n");
// 输出：[   276.787452] MODERN_PRINT_KERNEL: === Modern Kernel Print Usage Demo ===
```

### 为什么要有统一前缀？

1. **日志过滤**：方便用 `grep` 过滤特定模块的日志
   ```bash
   dmesg | grep MODERN_PRINT_KERNEL
   ```

2. **调试定位**：快速找到问题发生的模块
3. **多模块区分**：在复杂系统中区分不同驱动的输出

---

## 高级打印功能

除了基本的 `pr_*` 宏，内核还提供了高级打印功能。

### 1. 一次性打印（*_once）

**问题**：有些消息你只想打印一次，比如初始化信息。如果模块被反复加载卸载，这些消息会重复出现，淹没日志。

**解决**：使用 `*_once` 宏

```c
pr_info_once("This message will only appear once\n");
pr_warn_once("Warning: deprecated API usage\n");
pr_err_once("Critical: configuration error\n");
```

### 实际测试输出

在我们的测试中，即使多次加载模块，`*_once` 消息只出现一次：

```
[  276.787594] This INFO_ONCE message will only appear once
[  276.787602] This WARN_ONCE message will only appear once
[  276.787610] This ERR_ONCE message will only appear once
```

### 2. 多行连续打印（pr_cont）

**问题**：有时候你想打印多行相关内容，但每行都加上时间戳和前缀会很乱。

**解决**：使用 `pr_cont` 继续上一行

```c
pr_info("Multi-line message example:\n");
pr_cont("  - Line 1: Continued line without prefix\n");
pr_cont("  - Line 2: Continued line without prefix\n");
pr_cont("  - Line 3: Continued line without prefix\n");
```

### 实际测试输出

```
[  276.787617] Multi-line message example:
[  276.787625]   - Line 1: Continued line without prefix
[  276.787636]   - Line 2: Continued line without prefix
[  276.787645]   - Line 3: Continued line without prefix
```

注意：`pr_cont` 输出的行没有 `[时间戳] 模块名:` 前缀！

### 3. 限速打印（*_ratelimited）

**问题**：在高频路径中（比如每秒调用1000次的函数），如果每次都打印，会导致日志洪水。

**解决**：使用 `*_ratelimited` 宏

```c
if (some_error_condition) {
    pr_err_ratelimited("Frequent error occurred\n");
}
```

内核会自动限制这类消息的输出频率，避免日志洪水。

---

## 模块参数：动态控制调试级别

`modern_print_kernel_base00_driver` 演示了一个重要特性：**模块参数**。

### 模块参数的定义

```c
static int debug_level = 1;
module_param(debug_level, int, 0644);
MODULE_PARM_DESC(debug_level, "Debug level (0=none, 1=info, 2=debug)");
```

### 不同参数的实测效果

让我们对比三种不同参数的输出：

#### 场景 1：默认参数（debug_level=1）

```
/lib/modules # insmod modern_print_kernel_base00_driver.ko
[  276.787477] Module loading with debug level: 1
...
[  276.787668] Debug level >= 1: Basic information enabled
```

#### 场景 2：详细调试（debug_level=2）

```
/lib/modules # insmod modern_print_kernel_base00_driver.ko debug_level=2
[  355.279715] Module loading with debug level: 2
...
[  355.279904] Debug level >= 1: Basic information enabled
```

#### 场景 3：最小输出（debug_level=0）

```
/lib/modules # insmod modern_print_kernel_base00_driver.ko debug_level=0
[  368.867581] Module loading with debug level: 0
...
[  368.867774] ========================
（注意：没有 "Debug level >= 1" 的输出）
```

### 关键观察

对比这三种输出，你会发现：

1. **debug_level=0**：没有"Debug level >= 1"输出，因为条件不满足
2. **debug_level=1**：显示基本信息输出
3. **debug_level=2**：显示更详细的调试信息（如果启用了 DEBUG 日志级别）

这种机制让你可以在不重新编译模块的情况下，动态调整输出的详细程度。

---

## 内核日志级别控制

你可能会问：为什么 `pr_debug` 默认不显示？

答案：**内核日志级别控制**。

### 查看当前日志级别

```bash
cat /proc/sys/kernel/printk
# 输出：4    4    1    7
#       │    │    │    │
#       │    │    │    └─ 默认日志级别
#       │    │    └────── 最小日志级别
#       │    └─────────── 控制台日志级别
#       └──────────────── 默认控制台日志级别
```

### 设置日志级别

```bash
# 临时设置（重启后失效）
echo 8 > /proc/sys/kernel/printk

# 永久设置（添加到 /etc/sysctl.conf）
kernel.printk = 8
```

### 日志级别含义

| 数值 | 显示的级别 |
|------|-----------|
| 0 | 只显示 EMERG |
| 1 | EMERG, ALERT |
| 2 | EMERG, ALERT, CRIT |
| 3 | EMERG, ALERT, CRIT, ERR |
| 4 | EMERG, ALERT, CRIT, ERR, WARNING |
| 5 | EMERG, ALERT, CRIT, ERR, WARNING, NOTICE |
| 6 | EMERG, ALERT, CRIT, ERR, WARNING, NOTICE, INFO |
| 7 | 所有级别（包括 DEBUG） |

**默认值通常是 4**，所以 `pr_debug` 消息不会显示。

### 实际测试

让我们测试一下不同日志级别的影响：

```bash
# 查看当前级别
cat /proc/sys/kernel/printk
# 输出：4 4 1 7

# 加载模块（不会显示 DEBUG 消息）
insmod modern_print_kernel_base00_driver.ko
dmesg | grep DEBUG
# 输出：（空）

# 设置日志级别为 8
echo 8 > /proc/sys/kernel/printk

# 重新加载模块（现在会显示 DEBUG 消息）
rmmod modern_print_kernel_base00_driver
insmod modern_print_kernel_base00_driver.ko debug_level=2
dmesg | grep DEBUG
# 输出：[   276.787572] DEBUG: Debug-level message (level 7)
```

---

## 条件编译：DEBUG 宏的妙用

除了运行时的日志级别控制，内核还支持**编译时的条件编译**。

### pr_debug 的特殊行为

```c
// 在代码中
pr_debug("This is a debug message: %d\n", value);
```

`pr_debug` 的行为取决于编译时选项：

- **如果定义了 `DEBUG`**：编译为 `printk(KERN_DEBUG ...)`
- **如果未定义 `DEBUG`**：编译为空（完全不生成代码）

### 如何启用 DEBUG

```makefile
# 在 Makefile 中添加
ccflags-y += -DDEBUG
```

或者：

```bash
# 编译时传递参数
make EXTRA_CFLAGS=-DDEBUG
```

### pr_devel 宏

还有一个类似的宏：`pr_devel`

```c
pr_devel("Development debug message\n");
```

`pr_devel` 总是编译为空，除非定义了 `DEBUG`。它比 `pr_debug` 更激进，即使在运行时启用 DEBUG 日志级别也不会显示。

---

## 实战技巧：dmesg 的高级用法

### 1. 实时监控日志

```bash
# 持续显示新的内核消息
dmesg -w

# 结合过滤使用
dmesg -w | grep MODERN_PRINT_KERNEL
```

### 2. 清空日志缓冲区

```bash
# 清空所有内核消息
dmesg -c

# 测试时很有用：先清空，加载模块，查看纯净的输出
dmesg -c
insmod my_driver.ko
dmesg
```

### 3. 查看特定级别的消息

```bash
# 只看错误和警告
dmesg -l err,warn

# 查看所有级别的名称
dmesg -l help
```

### 4. 时间戳显示

```bash
# 显示人类可读的时间戳
dmesg -T

# 显示精确时间戳
dmesg -t
```

### 5. 过滤特定模块

```bash
# 只看特定模块的输出
dmesg | grep MODERN_PRINT_KERNEL

# 或者使用 dmesg 的内置过滤（较新版本）
dmesg --facility=daemon
```

---

## 常见错误与最佳实践

### 错误 1：忘记添加换行符

```c
// ❌ 错误
pr_info("Loading module");
pr_info("Initialization complete");

// 输出：Loading moduleInitialization complete（连在一起）

// ✅ 正确
pr_info("Loading module\n");
pr_info("Initialization complete\n");
```

### 错误 2：在敏感路径使用 printk

```c
// ❌ 危险：在中断处理中使用可能睡眠的函数
irqreturn_t my_irq(int irq, void *dev_id) {
    pr_info("IRQ occurred\n");  // printk 可能睡眠！
    return IRQ_HANDLED;
}

// ✅ 使用快速版本（如果可用）或避免打印
irqreturn_t my_irq(int irq, void *dev_id) {
    // 使用原子变量记录，在安全时打印
    atomic_set(&irq_count, 1);
    return IRQ_HANDLED;
}
```

### 错误 3：过度使用 pr_debug

```c
// ❌ 在高频循环中使用 pr_debug
while (1) {
    pr_debug("Processing item %d\n", i++);  // 日志洪水！
}

// ✅ 使用 pr_debug_ratelimited 或条件打印
while (1) {
    if (unlikely(debug_enabled)) {
        pr_debug("Processing item %d\n", i++);
    }
}
```

### 最佳实践总结

1. **使用 pr_* 宏**：不要直接用 `printk`
2. **添加统一前缀**：使用 `pr_fmt` 宏
3. **选择合适的日志级别**：
   - 生产环境：主要使用 `pr_err`, `pr_warn`, `pr_info`
   - 开发调试：可使用 `pr_debug`
   - 关键错误：使用 `pr_emerg`, `pr_alert`, `pr_crit`
4. **考虑性能影响**：高频路径使用 `*_ratelimited`
5. **提供上下文**：错误消息要详细，包含足够的调试信息
6. **统一风格**：在整个驱动中使用一致的格式

---

## 实例对比：输出分析

让我们深入分析 `modern_print_kernel_base00_driver` 的完整输出，理解各种打印功能的实际效果。

### 完整输出解读

```
[  276.786728] modern_print_kernel_base00_driver: loading out-of-tree module taints kernel.
```

**解读**：
- `[  276.786728]`：时间戳（秒）
- `modern_print_kernel_base00_driver:`：模块名（自动添加）
- `loading out-of-tree module taints kernel`：内核警告，模块不是内核树的一部分

```
[  276.787452] === Modern Kernel Print Usage Demo ===
[  276.787477] Module loading with debug level: 1
[  276.787493] Demonstrating modern printk features in Linux kernel
```

**解读**：
- 注意时间戳的差异（毫秒级）
- 没有显示 `MODERN_PRINT_KERNEL:` 前缀（因为内核已经添加了模块名）
- `debug level: 1`：显示了传递的模块参数

```
[  276.787509] --- Demonstrating Kernel Log Levels ---
[  276.787517] EMERGENCY: System is unusable (level 0)
[  276.787526] ALERT: Action must be taken immediately (level 1)
...
```

**解读**：
- 所有 8 个日志级别的演示
- 注意：没有 DEBUG 级别的输出（被过滤了）

```
[  276.787587] --- Advanced printk Features ---
[  276.787594] This INFO_ONCE message will only appear once
[  276.787602] This WARN_ONCE message will only appear once
[  276.787610] This ERR_ONCE message will only appear once
```

**解读**：
- 一次性打印的演示
- 即使多次加载模块，这些消息只出现一次

```
[  276.787617] Multi-line message example:
[  276.787625]   - Line 1: Continued line without prefix
[  276.787636]   - Line 2: Continued line without prefix
[  276.787645]   - Line 3: Continued line without prefix
```

**解读**：
- `pr_cont` 的效果：后续行没有前缀
- 保持多行输出的整洁性

```
[  276.787668] Debug level >= 1: Basic information enabled
```

**解读**：
- 条件打印的演示
- 因为 `debug_level=1`，满足条件 `debug_level >= 1`

### 对比不同 debug_level 的输出

**debug_level=2 时**：
```
[  355.279904] Debug level >= 1: Basic information enabled
```
（和 debug_level=1 相同，因为 DEBUG 级别被过滤）

**debug_level=0 时**：
```
（没有 "Debug level >= 1" 的输出）
```
（因为不满足 `debug_level >= 1` 条件）

这个对比清楚地展示了模块参数如何控制输出行为。

---

## 小结

这一章，我们深入学习了 Linux 内核的打印系统：

### 核心概念
1. **printk vs printf**：内核没有标准 C 库，必须用 `printk`
2. **8 个日志级别**：从 EMERG(0) 到 DEBUG(7)
3. **pr_* 宏系列**：现代化的打印接口，推荐使用
4. **pr_fmt 宏**：统一添加模块前缀，方便日志过滤

### 高级功能
1. **一次性打印**：`*_once` 宏，避免重复消息
2. **多行打印**：`pr_cont`，保持输出整洁
3. **限速打印**：`*_ratelimited`，避免日志洪水
4. **条件编译**：`pr_debug` 的编译时控制

### 实战技能
1. **日志级别控制**：通过 `/proc/sys/kernel/printk` 调整
2. **dmesg 高级用法**：实时监控、过滤、清空
3. **模块参数**：动态控制调试级别
4. **输出分析**：理解实际测试输出的含义

### 下一步

现在你已经掌握了内核打印系统，下一步我们要学习：

**[04_kernel_module_mechanism.md - 内核模块机制](04_kernel_module_mechanism.md)**

在那里，我们会深入了解：
- 内核模块的生命周期
- 模块是如何加载和卸载的
- module_init 和 module_exit 的机制
- 模块参数和依赖管理

准备好探索内核模块的奥秘了吗？
