# 内核调试技术

## 在黑暗中寻找光亮

在前面的章节中，我们学习了内核打印、模块机制等基础知识。但你很快会发现：**知道怎么打印消息，和知道怎么高效调试，是两回事。**

当你写的驱动加载失败、系统崩溃、或者行为异常时，你需要的是一套系统的调试方法论。这一章，我们要成为内核调试专家。

---

## dmesg：内核的日记本

`dmesg` 是你最重要的调试工具。内核把所有消息写入一个环形缓冲区，`dmesg` 就是查看这个缓冲区的窗口。

### 基础用法

```bash
# 查看所有内核消息
dmesg

# 只看最后 N 行
dmesg | tail -20

# 只看最前 N 行
dmesg | head -20

# 持续监控新消息
dmesg -w
```

### 实时监控调试

**场景**：你想监控驱动加载时的所有消息

```bash
# 终端 1：持续监控
dmesg -w | grep my_driver

# 终端 2：加载驱动
insmod my_driver.ko
```

### 清空日志缓冲区

**场景**：日志太混乱，你想看纯净的输出

```bash
# 清空所有消息
dmesg -c

# 加载模块
insmod my_driver.ko

# 查看纯净输出
dmesg
```

**注意**：`dmesg -c` 会清空整个缓冲区，不仅仅是过滤！

### 时间戳显示

```bash
# 人类可读的时间戳
dmesg -T

# 精确时间戳
dmesg -t

# 带时间戳的输出示例
[Wed Apr 16 10:30:45 2026] my_driver: Device loaded
[Wed Apr 16 10:30:46 2026] my_driver: Initialization complete
```

### 日志级别过滤

```bash
# 只看错误和警告
dmesg -l err,warn

# 只看特定级别
dmesg -l emerg,alert,crit,err,warn,notice,info,debug

# 查看所有可用的级别
dmesg -l help
```

### 实用技巧组合

```bash
# 组合使用：实时监控 + 时间戳 + 过滤
dmesg -wT | grep -E "my_driver|error|fail"

# 统计错误数量
dmesg | grep -i error | wc -l

# 查找最近的 Oops（内核崩溃）
dmesg | grep -A 20 "Oops"
```

---

## 内核日志级别控制

在[03_kernel_print_guide.md](03_kernel_print_guide.md)中，我们简单提到了日志级别。现在让我们深入理解。

### 查看当前日志级别

```bash
cat /proc/sys/kernel/printk
# 输出：4 4 1 7
```

这四个数字的含义：

1. **控制台日志级别**：哪些消息显示到控制台
2. **默认控制台日志级别**：没有指定级别的消息的默认级别
3. **最小日志级别**：允许设置的最小级别
4. **默认控制台日志级别**：默认的控制台级别

### 临时修改日志级别

```bash
# 显示所有级别（包括 DEBUG）
echo 8 > /proc/sys/kernel/printk

# 只显示错误和更严重的
echo 3 > /proc/sys/kernel/printk

# 验证修改
cat /proc/sys/kernel/printk
```

### 永久修改日志级别

```bash
# 方法 1：使用 sysctl
echo "kernel.printk = 8" >> /etc/sysctl.conf
sysctl -p

# 方法 2：内核启动参数
# 编辑 /etc/default/grub
GRUB_CMDLINE_LINUX="printk.time=1 printk=8"

# 更新 grub
update-grub
```

### 不同日志级别的实际效果

让我们对比不同日志级别下的输出：

**日志级别 = 4（默认）**
```bash
echo 4 > /proc/sys/kernel/printk
insmod modern_print_kernel_base00_driver.ko
dmesg | tail -15
```

输出：
```
[  276.787517] EMERGENCY: System is unusable (level 0)
[  276.787526] ALERT: Action must be taken immediately (level 1)
[  276.787534] CRITICAL: Critical conditions occurred (level 2)
[  276.787541] ERROR: Error condition detected (level 3)
[  276.787549] WARNING: Warning condition (level 4)
```

注意：**没有显示 INFO、NOTICE、DEBUG 级别的消息**！

**日志级别 = 8（显示所有）**
```bash
echo 8 > /proc/sys/kernel/printk
rmmod modern_print_kernel_base00_driver
insmod modern_print_kernel_base00_driver.ko
dmesg | tail -20
```

输出：
```
[  276.787517] EMERGENCY: System is unusable (level 0)
[  276.787526] ALERT: Action must be taken immediately (level 1)
[  276.787534] CRITICAL: Critical conditions occurred (level 2)
[  276.787541] ERROR: Error condition detected (level 3)
[  276.787549] WARNING: Warning condition (level 4)
[  276.787556] NOTICE: Normal but significant condition (level 5)
[  276.787564] INFO: Informational message (level 6)
```

现在显示了 NOTICE 和 INFO，但 DEBUG 仍然没有显示（需要重新编译模块或启用动态调试）。

---

## 动态调试：运行时控制打印

传统的调试方式需要在编译时决定是否包含调试代码，但 Linux 内核提供了更强大的机制：**动态调试（Dynamic Debug）**。

### 什么是动态调试？

动态调试允许你在**运行时**控制哪些 `pr_debug()` 和 `dev_dbg()` 消息被打印，而不需要重新编译模块。

### 检查内核是否支持动态调试

```bash
# 查看内核配置
cat /boot/config-$(uname -r) | grep DYNAMIC_DEBUG
# 或
zcat /proc/config.gz | grep DYNAMIC_DEBUG

# 应该看到：
# CONFIG_DYNAMIC_DEBUG=y
# CONFIG_DYNAMIC_DEBUG_CORE=y
```

### 动态调试的使用

#### 1. 查看可用的调试点

```bash
# 查看所有动态调试点
cat /sys/kernel/debug/dynamic_debug/control | head -20

# 查看特定模块的调试点
cat /sys/kernel/debug/dynamic_debug/control | grep my_module
```

输出示例：
```
filename:drivers/my_module/my_driver.c  func:my_init  line:42  "Initializing device\n"
filename:drivers/my_module/my_driver.c  func:my_read  line:78  "Reading %d bytes\n"
```

#### 2. 启用调试

```bash
# 启用所有调试
echo "module my_module +p" > /sys/kernel/debug/dynamic_debug/control

# 启用特定文件的调试
echo "file my_driver.c +p" > /sys/kernel/debug/dynamic_debug/control

# 启用特定函数的调试
echo "func my_read +p" > /sys/kernel/debug/dynamic_debug/control

# 启用特定行的调试
echo "file my_driver.c line 78 +p" > /sys/kernel/debug/dynamic_debug/control
```

#### 3. 禁用调试

```bash
# 禁用所有调试
echo "module my_module -p" > /sys/kernel/debug/dynamic_debug/control

# 禁用特定文件的调试
echo "file my_driver.c -p" > /sys/kernel/debug/dynamic_debug/control
```

#### 4. 查看当前状态

```bash
# 查看所有已启用的调试点
cat /sys/kernel/debug/dynamic_debug/control | grep "=p"

# 查看特定模块的调试状态
cat /sys/kernel/debug/dynamic_debug/control | grep my_module
```

### 动态调试的实际应用

```bash
# 1. 加载模块
insmod my_module.ko

# 2. 启用模块的动态调试
echo "module my_module +p" > /sys/kernel/debug/dynamic_debug/control

# 3. 使用模块，查看调试输出
dmesg -w | grep my_module

# 4. 禁用调试
echo "module my_module -p" > /sys/kernel/debug/dynamic_debug/control
```

### 动态调试的高级用法

```bash
# 只在特定函数中启用调试
echo "func my_read +p; func my_write +p" > /sys/kernel/debug/dynamic_debug/control

# 启用调试并添加自定义前缀
echo "file my_driver.c +p \"[MY_DEBUG] \"" > /sys/kernel/debug/dynamic_debug/control

# 组合条件
echo "file my_driver.c func my_read +p" > /sys/kernel/debug/dynamic_debug/control
```

---

## 常见问题排查流程

### 问题 1：模块加载失败

**症状**：
```bash
insmod my_module.ko
# 错误：insmod: ERROR: could not insert module my_module: Invalid module format
```

**排查步骤**：

```bash
# 1. 查看内核日志
dmesg | tail -20

# 2. 检查内核版本匹配
uname -r
modinfo my_module.ko | grep vermagic

# 3. 检查模块依赖
modinfo my_module.ko | grep depends
lsmod | grep dependency_module

# 4. 重新编译
make clean
make -C /lib/modules/$(uname -r)/build M=$(pwd) modules
```

### 问题 2：模块加载成功但设备不工作

**症状**：
```bash
insmod my_module.ko
# 成功加载，但设备没有响应
```

**排查步骤**：

```bash
# 1. 检查设备注册
cat /proc/devices | grep my_module
ls -l /dev/my_device

# 2. 检查模块参数
cat /sys/module/my_module/parameters/*
cat /sys/module/my_module/refcnt

# 3. 检查内核消息
dmesg | grep my_module

# 4. 测试设备
echo "test" > /dev/my_device
cat /dev/my_device

# 5. 查看模块状态
cat /sys/module/my_module/initstate
```

### 问题 3：系统崩溃（Oops/Panic）

**症状**：
```bash
# 系统冻结或重启
dmesg | grep "Oops"
```

**排查步骤**：

```bash
# 1. 查找崩溃信息
dmesg | grep -A 30 "Oops\|Panic"

# 2. 保存崩溃日志
dmesg > crash_log.txt

# 3. 分析崩溃位置
# 查看调用栈（Call Trace）
dmesg | grep "Call Trace"

# 4. 检查常见原因
# - 空指针解引用
# - 内存访问越界
# - 死锁
# - 栈溢出

# 5. 使用 ksymoops 解析符号（如果可用）
ksymoops < crash_log.txt
```

### 问题 4：内存泄漏

**症状**：
```bash
# 系统运行一段时间后内存不足
free -h  # 显示内存持续减少
```

**排查步骤**：

```bash
# 1. 查看模块内存使用
cat /proc/modules | grep my_module

# 2. 使用 slabtop 查看 slab 分配器
slabtop | grep my_module

# 3. 启用内核内存调试
# 在内核启动参数中添加：
slab_debug
# 或
slub_debug

# 4. 使用 kmemleak（需要启用 CONFIG_DEBUG_KMEMLEAK）
echo scan > /sys/kernel/debug/kmemleak
cat /sys/kernel/debug/kmemleak
```

---

## 内核调试工具箱

除了 `dmesg` 和动态调试，还有很多强大的内核调试工具。

### 1. trace-cmd：ftrace 的前端

**用途**：追踪内核函数调用

```bash
# 安装
apt-get install trace-cmd

# 记录函数调用
trace-cmd record -p function -g do_sys_open

# 查看记录
trace-cmd report

# 实时显示
trace-cmd show
```

### 2. perf：性能分析工具

**用途**：性能分析和热点定位

```bash
# 记录性能数据
perf record -g ./my_test_program

# 查看报告
perf report

# 实时监控
perf top
```

### 3. crash：内核崩溃分析

**用途**：分析内核崩溃转储

```bash
# 安装
apt-get install crash

# 加载内核调试符号
crash /usr/lib/debug/lib/modules/$(uname -r)/vmlinux /proc/kcore

# 常用命令
crash> bt          # 回溯
crash> ps          # 进程列表
crash> mod -s my_module  # 模块信息
```

### 4. kgdb：内核调试器

**用途**：远程调试内核（类似 gdb）

```bash
# 内核启动参数
kgdboc=ttyS0,115200 kgdbwait

# 在另一个终端
gdb vmlinux
(gdb) target remote /dev/ttyS0
(gdb) break my_function
(gdb) continue
```

### 5. /proc 和 /sys 文件系统

**用途**：运行时查看内核状态

```bash
# 查看模块信息
cat /proc/modules
ls /sys/module/

# 查看设备信息
cat /proc/devices
ls /sys/class/

# 查看内存信息
cat /proc/meminfo
cat /proc/iomem

# 查看中断信息
cat /proc/interrupts
```

---

## 调试技巧和最佳实践

### 技巧 1：渐进式调试

不要一次性打印太多信息，要循序渐进：

```c
// ❌ 不好：太多调试信息
pr_debug("Variable a=%d, b=%d, c=%d, d=%d, e=%d\n", a, b, c, d, e);

// ✅ 好：逐步增加
pr_debug("Step 1: a=%d\n", a);
pr_debug("Step 2: b=%d\n", b);
```

### 技巧 2：使用标识符

在调试消息中添加唯一标识符，方便搜索：

```c
#define DEBUG_TAG "[MY_DRV:%s:%d]"

pr_debug(DEBUG_TAG "Entering function\n", __func__, __LINE__);
pr_debug(DEBUG_TAG "Value = %d\n", __func__, __LINE__, value);
```

### 技巧 3：条件编译

使用宏进行条件编译，避免生产环境的性能影响：

```c
#ifdef DEBUG
    pr_debug("Detailed debug info\n");
#endif
```

或者使用 `pr_debug()`，它只在定义了 `DEBUG` 时才编译。

### 技巧 4：断言检查

使用 `BUG_ON()` 和 `WARN_ON()` 检测关键错误：

```c
// 检查指针有效性
BUG_ON(ptr == NULL);

// 检查状态错误
WARN_ON(status != 0);

// 更友好的警告
WARN(1, "This should not happen!\n");
```

### 技巧 5：使用 dump_stack()

打印调用栈，了解执行路径：

```c
static void my_function(void) {
    if (something_wrong) {
        pr_err("Error detected!\n");
        dump_stack();  // 打印调用栈
    }
}
```

### 技巧 6：hex dump 调试

使用 `print_hex_dump()` 查看二进制数据：

```c
void debug_buffer(const void *buf, size_t len) {
    print_hex_dump(KERN_DEBUG, "", DUMP_PREFIX_OFFSET,
                   16, 1, buf, len, true);
}
```

---

## 实战案例：调试一个简单的驱动

让我们通过一个实际案例，综合运用这些调试技巧。

### 问题场景

驱动加载成功，但读取设备时返回错误。

### 调试过程

#### 1. 确认问题

```bash
# 加载驱动
insmod my_driver.ko

# 尝试读取
cat /dev/my_device
# 错误：cat: read error: Invalid argument
```

#### 2. 检查内核日志

```bash
# 查看最近的内核消息
dmesg | tail -20

# 输出：
# [ 123.45] my_driver: Device loaded
# [ 124.56] my_driver: Device opened
# [ 125.67] my_driver: Read called with count=4096
# [ 125.68] my_driver: Error in read function
```

看到错误发生在 read 函数中。

#### 3. 启用动态调试

```bash
# 启用驱动的动态调试
echo "module my_driver +p" > /sys/kernel/debug/dynamic_debug/control

# 再次测试
cat /dev/my_device

# 查看详细输出
dmesg | tail -30
```

#### 4. 分析代码

查看代码，发现问题：

```c
static ssize_t my_read(struct file *filp, char __user *buf,
                        size_t count, loff_t *ppos)
{
    pr_debug("Read called with count=%zu\n", count);
    
    if (count > 1024) {
        pr_debug("Count too large\n");
        return -EINVAL;  // 问题：返回了错误码
    }
    
    // 正常读取逻辑...
}
```

#### 5. 修复问题

```c
static ssize_t my_read(struct file *filp, char __user *buf,
                        size_t count, loff_t *ppos)
{
    pr_debug("Read called with count=%zu\n", count);
    
    if (count > 1024) {
        pr_debug("Adjusting count from %zu to 1024\n", count);
        count = 1024;  // 修复：调整大小而不是返回错误
    }
    
    // 正常读取逻辑...
}
```

#### 6. 验证修复

```bash
# 重新编译和加载
rmmod my_driver
make
insmod my_driver.ko

# 测试
cat /dev/my_device
# 成功！
```

---

## 小结

这一章，我们系统学习了内核调试技术：

### 核心工具
1. **dmesg**：查看内核日志，支持过滤、监控、清空
2. **动态调试**：运行时控制调试输出，无需重新编译
3. **日志级别**：控制哪些消息显示到控制台

### 调试流程
1. **问题定位**：查看日志、检查状态
2. **启用调试**：动态调试或提高日志级别
3. **分析问题**：使用调试工具定位根本原因
4. **验证修复**：修复后重新测试

### 高级工具
1. **trace-cmd**：函数调用追踪
2. **perf**：性能分析
3. **crash**：崩溃分析
4. **kgdb**：远程调试

### 最佳实践
1. **渐进式调试**：逐步增加调试信息
2. **使用标识符**：方便搜索和过滤
3. **条件编译**：避免生产环境性能影响
4. **断言检查**：检测关键错误
5. **调用栈分析**：了解执行路径

### 下一步

现在你已经掌握了内核调试技术，准备好进入实际的字符设备驱动开发了！

**[07_new_chardev_api.md - 开发步骤](07_new_chardev_api.md)**

在那里，我们将：
- 学习字符设备的注册与注销
- 实现 file_operations
- 处理设备节点
- 编写完整的字符设备驱动

准备好开始编写真正的驱动了吗？
