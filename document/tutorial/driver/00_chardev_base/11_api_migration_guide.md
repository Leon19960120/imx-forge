# 字符设备驱动 API 迁移指南

## 从老内核（4.1.15）到新内核（6.12.49 / 7.0.0-rc4）的完整迁移路径

说实话，我刚看到这套新 API 的时候，内心是崩溃的。好好的 `register_chrdev` 一行搞定的事情，为什么要拆成三四个函数？但随着写的驱动越来越多，我逐渐理解了内核开发者的良苦用心——老的 API 确实太粗暴了，直接占掉一整个主设备号下面的 256 个次设备号，不管你用不用得上。

如果你现在手头有老内核的驱动代码需要迁移到新内核，或者你是从老教程学过来的，这篇文档就是专门为你准备的。我们会把每个 API 的迁移路径讲清楚，告诉你为什么这样改，以及新方式的好处在哪里。

---

## 内核版本说明

我们对比的三个内核版本：

- **老内核**：Linux 4.1.15（NXP i.MX 官方 SDK）
- **linux-imx 内核**：Linux 6.12.49（NXP 维护的 i.MX 优化版本）
- **mainline 内核**：Linux 7.0.0-rc4（社区主线版本）

好消息是：linux-imx 和 mainline 在字符设备 API 方面基本一致，你写一套代码在两个内核上都能跑。

---

## 迁移路线图

从老内核到新内核，我们需要改五个地方：

1. **字符设备注册方式**：从简单的 `register_chrdev` 到分离式注册
2. **设备节点创建**：从手动 `mknod` 到自动创建
3. **file_operations 结构体**：了解新增的字段和特性
4. **模块信息**：添加更完善的模块描述
5. **错误处理**：更规范的返回值处理

---

## 1. 字符设备注册方式

### 老内核方式（简单粗暴）

```c
#include <linux/fs.h>

#define CHRDEVBASE_MAJOR    200
#define CHRDEVBASE_NAME     "chrdevbase"

static int __init chrdevbase_init(void)
{
    int retvalue = 0;

    /* 一行代码注册整个主设备号（256个次设备号） */
    retvalue = register_chrdev(CHRDEVBASE_MAJOR, CHRDEVBASE_NAME, &chrdevbase_fops);
    if(retvalue < 0) {
        printk("chrdevbase driver register failed\r\n");
    }

    return 0;
}

static void __exit chrdevbase_exit(void)
{
    /* 一行代码注销 */
    unregister_chrdev(CHRDEVBASE_MAJOR, CHRDEVBASE_NAME);
}
```

这种方式的问题是：你只用了 1 个设备（`chrdevbase`），但 `register_chrdev` 会占掉整个主设备号 200 下面所有的 256 个次设备号（200.0, 200.1, ..., 200.255）。这在设备紧缺的嵌入式系统里是种浪费。

### 新内核推荐方式（精细控制）

```c
#include <linux/fs.h>
#include <linux/cdev.h>

#define CHRDEVBASE_NAME     "chrdevbase"

/* 全局变量 */
static dev_t dev_num;                    /* 设备号 */
static struct cdev chrdevbase_cdev;       /* 字符设备结构体 */

static int __init chrdevbase_init(void)
{
    int retvalue = 0;

    /* 第一步：动态分配设备号（只申请 1 个设备号） */
    retvalue = alloc_chrdev_region(&dev_num, 0, 1, CHRDEVBASE_NAME);
    if(retvalue < 0) {
        printk("alloc_chrdev_region failed\r\n");
        return retvalue;
    }

    /* 第二步：初始化 cdev 结构体并绑定 file_operations */
    cdev_init(&chrdevbase_cdev, &chrdevbase_fops);
    chrdevbase_cdev.owner = THIS_MODULE;

    /* 第三步：添加字符设备到系统 */
    retvalue = cdev_add(&chrdevbase_cdev, dev_num, 1);
    if(retvalue < 0) {
        printk("cdev_add failed\r\n");
        goto failed_cdev_add;
    }

    printk("chrdevbase init success, major=%d, minor=%d\r\n",
           MAJOR(dev_num), MINOR(dev_num));
    return 0;

failed_cdev_add:
    unregister_chrdev_region(dev_num, 1);
    return retvalue;
}

static void __exit chrdevbase_exit(void)
{
    /* 第一步：删除字符设备 */
    cdev_del(&chrdevbase_cdev);

    /* 第二步：释放设备号 */
    unregister_chrdev_region(dev_num, 1);

    printk("chrdevbase exit\r\n");
}
```

这样写的好处是：

1. **精确控制资源占用**：只申请 1 个设备号，不浪费
2. **动态分配主设备号**：不用手动指定 200，内核自动分配空闲的号
3. **更符合现代内核设计**：分离了设备号管理和设备注册两个职责

### 静态分配设备号（如果需要）

如果你确实需要指定主设备号（比如为了兼容老系统），可以这样写：

```c
/* 静态指定设备号为 200.0 */
dev_num = MKDEV(200, 0);
retvalue = register_chrdev_region(dev_num, 1, CHRDEVBASE_NAME);
```

---

## 2. 设备节点创建

### 老内核方式：手动 mknod

```bash
# 在开发板上手动创建设备节点
mknod /dev/chrdevbase c 200 0
```

这种方式的问题是：
- 每次重启都要重新创建
- 容易忘记创建，导致应用层打不开设备
- 设备号可能变化时需要手动调整

### 新内核推荐方式：自动创建

```c
#include <linux/device.h>

/* 全局变量 */
static struct class *chrdevbase_class;
static struct device *chrdevbase_device;

static int __init chrdevbase_init(void)
{
    /* ... 前面的 cdev 初始化代码 ... */

    /* 创建设备类（会在 /sys/class/ 下创建目录） */
    chrdevbase_class = class_create(THIS_MODULE, "chrdevbase_class");
    if(IS_ERR(chrdevbase_class)) {
        printk("class_create failed\r\n");
        retvalue = PTR_ERR(chrdevbase_class);
        goto failed_class_create;
    }

    /* 创建设备（会自动创建 /dev/chrdevbase 节点） */
    chrdevbase_device = device_create(chrdevbase_class, NULL, dev_num,
                                      NULL, "chrdevbase");
    if(IS_ERR(chrdevbase_device)) {
        printk("device_create failed\r\n");
        retvalue = PTR_ERR(chrdevbase_device);
        goto failed_device_create;
    }

    return 0;

failed_device_create:
    class_destroy(chrdevbase_class);
failed_class_create:
    cdev_del(&chrdevbase_cdev);
    unregister_chrdev_region(dev_num, 1);
    return retvalue;
}

static void __exit chrdevbase_exit(void)
{
    /* 删除设备 */
    device_destroy(chrdevbase_class, dev_num);

    /* 删除设备类 */
    class_destroy(chrdevbase_class);

    /* ... 后面的清理代码 ... */
}
```

这种方式的好处是：
- **自动创建设备节点**：系统启动后自动在 `/dev/` 下创建设备文件
- **支持 udev 规则**：可以配合 udev 设置权限、创建符号链接等
- **更好的资源管理**：驱动卸载时自动清理设备节点

---

## 3. file_operations 结构体变化

### 老内核（4.1.15）的 file_operations

```c
struct file_operations {
    struct module *owner;
    loff_t (*llseek) (struct file *, loff_t, int);
    ssize_t (*read) (struct file *, char __user *, size_t, loff_t *);
    ssize_t (*write) (struct file *, const char __user *, size_t, loff_t *);
    // ... 其他字段 ...
    int (*open) (struct inode *, struct file *);
    int (*release) (struct inode *, struct file *);
};
```

### 新内核（6.12.49 / 7.0.0-rc4）的 file_operations

```c
struct file_operations {
    struct module *owner;
    fop_flags_t fop_flags;          /* 新增：文件操作标志位 */
    loff_t (*llseek) (struct file *, loff_t, int);
    ssize_t (*read) (struct file *, char __user *, size_t, loff_t *);
    ssize_t (*write) (struct file *, const char __user *, size_t, loff_t *);
    ssize_t (*read_iter) (struct kiocb *, struct iov_iter *);      /* 新增 */
    ssize_t (*write_iter) (struct kiocb *, struct iov_iter *);     /* 新增 */
    int (*iopoll)(struct kiocb *kiocb, struct io_comp_batch *,     /* 新增 */
                 unsigned int flags);
    int (*iterate_shared) (struct file *, struct dir_context *);  /* 新增 */
    __poll_t (*poll) (struct file *, struct poll_table_struct *);
    long (*unlocked_ioctl) (struct file *, unsigned int, unsigned long);
    long (*compat_ioctl) (struct file *, unsigned int, unsigned long);
    int (*mmap) (struct file *, struct vm_area_struct *);
    int (*open) (struct inode *, struct file *);
    int (*flush) (struct file *, fl_owner_t id);
    int (*release) (struct inode *, struct file *);
    int (*fsync) (struct file *, loff_t, loff_t, int datasync);
    int (*fasync) (int, struct file *, int);
    int (*lock) (struct file *, int, struct file_lock *);
    unsigned long (*get_unmapped_area)(struct file *, unsigned long,
                                      unsigned long, unsigned long,
                                      unsigned long);
    int (*check_flags)(int);
    int (*flock) (struct file *, int, struct file_lock *);
    ssize_t (*splice_write)(struct pipe_inode_info *, struct file *,
                           loff_t *, size_t, unsigned int);
    ssize_t (*splice_read)(struct file *, loff_t *,
                          struct pipe_inode_info *, size_t, unsigned int);
    void (*splice_eof)(struct file *file);                          /* 新增 */
    int (*setlease)(struct file *, int, struct file_lease **, void **);
    long (*fallocate)(struct file *file, int mode, loff_t offset,
                     loff_t len);
    void (*show_fdinfo)(struct seq_file *m, struct file *f);
    ssize_t (*copy_file_range)(struct file *, loff_t, struct file *,   /* 新增 */
                              loff_t, size_t, unsigned int);
    loff_t (*remap_file_range)(struct file *file_in, loff_t pos_in,   /* 新增 */
                              struct file *file_out, loff_t pos_out,
                              loff_t len, unsigned int remap_flags);
    int (*fadvise)(struct file *, loff_t, loff_t, int);               /* 新增 */
    int (*uring_cmd)(struct io_uring_cmd *ioucmd,                     /* 新增 */
                    unsigned int issue_flags);
    int (*uring_cmd_iopoll)(struct io_uring_cmd *,                     /* 新增 */
                           struct io_comp_batch *,
                           unsigned int poll_flags);
} __randomize_layout;                                                 /* 新增属性 */
```

### 关键变化说明

1. **`fop_flags_t`**：文件操作标志位，用于优化性能
2. **`__randomize_layout`**：结构体布局随机化，增强安全性
3. **异步 I/O 支持**：`read_iter`、`write_iter`、`iopoll` 用于高性能异步 I/O
4. **io_uring 支持**：`uring_cmd` 和 `uring_cmd_iopoll` 用于最新的 io_uring 异步 I/O 框架
5. **文件操作增强**：`copy_file_range`、`remap_file_range` 等高级文件操作

### 迁移建议

对于基本的字符设备驱动，你不需要实现所有这些新函数。核心的 `open`、`read`、`write`、`release` 保持不变，其他新的函数指针可以为 `NULL`。

```c
static struct file_operations chrdevbase_fops = {
    .owner = THIS_MODULE,
    .open = chrdevbase_open,
    .read = chrdevbase_read,
    .write = chrdevbase_write,
    .release = chrdevbase_release,
};
```

这个写法在新老内核上都能正常工作。

---

## 4. 完整迁移示例

### 迁移前（老内核 4.1.15）

```c
#include <linux/module.h>
#include <linux/fs.h>

#define CHRDEVBASE_MAJOR    200
#define CHRDEVBASE_NAME     "chrdevbase"

static struct file_operations chrdevbase_fops = {
    .owner = THIS_MODULE,
    .open = chrdevbase_open,
    .read = chrdevbase_read,
    .write = chrdevbase_write,
    .release = chrdevbase_release,
};

static int __init chrdevbase_init(void)
{
    int retvalue = 0;
    retvalue = register_chrdev(CHRDEVBASE_MAJOR, CHRDEVBASE_NAME,
                              &chrdevbase_fops);
    if(retvalue < 0) {
        printk("chrdevbase driver register failed\r\n");
    }
    return 0;
}

static void __exit chrdevbase_exit(void)
{
    unregister_chrdev(CHRDEVBASE_MAJOR, CHRDEVBASE_NAME);
}

module_init(chrdevbase_init);
module_exit(chrdevbase_exit);
MODULE_LICENSE("GPL");
```

### 迁移后（新内核 6.12.49 / 7.0.0-rc4）

```c
#include <linux/module.h>
#include <linux/fs.h>
#include <linux/cdev.h>
#include <linux/device.h>

#define CHRDEVBASE_NAME     "chrdevbase"

/* 全局变量 */
static dev_t dev_num;
static struct cdev chrdevbase_cdev;
static struct class *chrdevbase_class;
static struct device *chrdevbase_device;

static struct file_operations chrdevbase_fops = {
    .owner = THIS_MODULE,
    .open = chrdevbase_open,
    .read = chrdevbase_read,
    .write = chrdevbase_write,
    .release = chrdevbase_release,
};

static int __init chrdevbase_init(void)
{
    int retvalue = 0;

    /* 1. 动态分配设备号 */
    retvalue = alloc_chrdev_region(&dev_num, 0, 1, CHRDEVBASE_NAME);
    if(retvalue < 0) {
        printk("alloc_chrdev_region failed\r\n");
        return retvalue;
    }

    /* 2. 初始化并添加 cdev */
    cdev_init(&chrdevbase_cdev, &chrdevbase_fops);
    chrdevbase_cdev.owner = THIS_MODULE;
    retvalue = cdev_add(&chrdevbase_cdev, dev_num, 1);
    if(retvalue < 0) {
        printk("cdev_add failed\r\n");
        goto failed_cdev_add;
    }

    /* 3. 创建设备类和设备 */
    chrdevbase_class = class_create(THIS_MODULE, "chrdevbase_class");
    if(IS_ERR(chrdevbase_class)) {
        printk("class_create failed\r\n");
        retvalue = PTR_ERR(chrdevbase_class);
        goto failed_class_create;
    }

    chrdevbase_device = device_create(chrdevbase_class, NULL, dev_num,
                                      NULL, "chrdevbase");
    if(IS_ERR(chrdevbase_device)) {
        printk("device_create failed\r\n");
        retvalue = PTR_ERR(chrdevbase_device);
        goto failed_device_create;
    }

    printk("chrdevbase init success, major=%d, minor=%d\r\n",
           MAJOR(dev_num), MINOR(dev_num));
    return 0;

failed_device_create:
    class_destroy(chrdevbase_class);
failed_class_create:
    cdev_del(&chrdevbase_cdev);
failed_cdev_add:
    unregister_chrdev_region(dev_num, 1);
    return retvalue;
}

static void __exit chrdevbase_exit(void)
{
    device_destroy(chrdevbase_class, dev_num);
    class_destroy(chrdevbase_class);
    cdev_del(&chrdevbase_cdev);
    unregister_chrdev_region(dev_num, 1);
    printk("chrdevbase exit\r\n");
}

module_init(chrdevbase_init);
module_exit(chrdevbase_exit);
MODULE_LICENSE("GPL");
MODULE_AUTHOR("your_name");
MODULE_DESCRIPTION("A simple char device driver");
```

---

## 5. 编译和测试

### 编译命令（针对 linux-imx 内核）

```bash
# 指定内核源码路径和架构
make -C ../third_party/linux-imx M=$(pwd) modules
```

### 编译命令（针对 mainline 内核）

```bash
# 指定内核源码路径和架构
make -C ../third_party/linux_mainline M=$(pwd) modules
```

### 测试步骤

```bash
# 1. 加载模块
insmod chrdevbase.ko

# 2. 检查设备号
cat /proc/devices | grep chrdevbase

# 3. 检查设备节点
ls -l /dev/chrdevbase

# 4. 运行测试程序
./chrdevbaseApp /dev/chrdevbase

# 5. 卸载模块
rmmod chrdevbase
```

---

## 6. 常见问题

### Q1: 为什么要从 `register_chrdev` 迁移到新 API？

**A**: 主要是资源管理和灵活性的考虑。`register_chrdev` 会占用整个主设备号的 256 个次设备号，而新 API 可以精确控制。此外，新 API 支持动态分配设备号，避免冲突。

### Q2: 老的 `register_chrdev` 在新内核上还能用吗？

**A**: 可以，内核保留了向后兼容性。但不推荐新驱动使用它。

### Q3: 如何知道动态分配的设备号是多少？

**A**: 有三种方式：
1. `printk` 在初始化时打印（`MAJOR(dev_num)`, `MINOR(dev_num)`）
2. `cat /proc/devices | grep chrdevbase`
3. `ls -l /dev/chrdevbase` 会显示设备号

### Q4: `class_create` 和 `device_create` 必须要用吗？

**A**: 不是强制的，但强烈推荐。它们可以自动创建设备节点，避免手动 `mknod` 的麻烦。

---

## 7. 迁移过程中的注意事项

实际迁移的时候，有几个地方特别容易踩坑，我在这里单独拎出来强调一下。

首先，别忘了把老的 `register_chrdev` 替换成新的三步走：`alloc_chrdev_region` + `cdev_init` + `cdev_add`。这个替换不是简单的语法替换，你得理解为什么要拆开——老 API 一次性占掉 256 个次设备号，新 API 可以精确控制。

其次，加上 `class_create` 和 `device_create`。这两个函数不是强制要求的，但我强烈建议你加上。想象一下，每次重启都要手动 `mknod` 创建设备节点，那种感觉真的很糟糕。自动创建设备节点不仅省事，还能配合 udev 做更多事情，比如设置权限、创建符号链接。

然后是错误处理。新的 API 调用链比较长，任何一个步骤失败都要把之前创建的资源清理掉。这里 `goto` 语句就派上用场了。我知道有人不喜欢 `goto`，但在内核的错误处理中，它是标准做法。如果你不用 `goto`，代码会变得很冗余，而且容易出错。

还有模块信息。老代码可能只有 `MODULE_LICENSE("GPL")`，但建议你加上 `MODULE_AUTHOR` 和 `MODULE_DESCRIPTION`。这些信息在 `modinfo` 命令下能看到，对于维护驱动很有帮助。

最后，一定要在真实环境下测试。编译通过不代表能正常工作，你得：
- 在开发板上加载模块
- 检查 `/proc/devices` 确认设备号
- 验证 `/dev/` 下设备节点是否自动创建
- 用测试程序实际读写设备
- 查看 `dmesg` 确认没有错误信息

这一套流程跑下来，基本就能确认迁移成功了。

---

## 总结

从老内核迁移到新内核，核心是理解内核开发者对资源管理和代码组织的改进思路。虽然代码量增加了，但换来的是更精细的控制、更好的可维护性和更现代的设计理念。

这套新 API 可能一开始会觉得繁琐，但相信我，写多了之后你会爱上它的。特别是当你需要管理多个设备或者需要动态分配资源时，新 API 的优势就会非常明显。

**记住**：内核开发的核心原则之一就是**精确控制资源**，新 API 正是这一原则的体现。

---

**相关文档**：
- [字符设备驱动简介](01_introduction.md)
- [开发步骤](07_new_chardev_api.md)
- [实验代码](08_experiment_code.md)
- [内核特性对比](12_kernel_comparison.md)
