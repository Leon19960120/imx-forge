# 老API实战：LED硬件驱动

## 从虚拟设备到真实硬件

上一节我们实现了一个虚拟字符设备，它只是在内核和用户空间之间传递数据。但这不是驱动的真正用途——驱动的使命是**控制硬件**。

这一节，我们要控制真实的硬件：点亮一盏LED。

这个过程表面上是在写代码，实际上是在把 Linux 内核的驱动模型和底层的硬件连接打通。我们会用到前面学过的所有知识：MMU、ioremap、readl/writel，以及老API（`register_chrdev`）。

---

## 一、硬件平台

### 1.1 硬件连接

我们使用 i.MX 6ULL 开发板，LED 连接在 **GPIO1_IO03** 引脚上。

**硬件原理（简化版）：**
- GPIO1_IO03 是芯片的一个引脚
- 通过写寄存器控制这个引脚的输出电平
- 高电平（1）→ 灯灭
- 低电平（0）→ 灯亮
- 这是"低电平点亮"的设计

### 1.2 为什么需要寄存器？

CPU不能直接说"点亮LED"，它必须通过**寄存器**来控制硬件。

寄存器是什么？你可以把它理解为**硬件的控制面板**：
- 每个寄存器都有一个地址（物理地址）
- 向这个地址写入数据，就能控制硬件
- 从这个地址读取数据，就能获取硬件状态

**停下来想一想**：
这和内存很像，但有两点不同：
1. 寄存器控制的是**硬件行为**，不是存储数据
2. 寄存器的地址是**固定的**，由芯片厂商决定

---

## 二、寄存器地址映射

### 2.1 物理地址

从芯片手册中，我们找到这些寄存器的物理地址：

```c
/* 寄存器物理地址 */
#define CCM_CCGR1_BASE          (0X020C406C)  /* 时钟控制寄存器 */
#define SW_MUX_GPIO1_IO03_BASE  (0X020E0068)  /* 复用寄存器 */
#define SW_PAD_GPIO1_IO03_BASE  (0X020E02F4)  /* 属性寄存器 */
#define GPIO1_DR_BASE           (0X0209C000)  /* 数据寄存器 */
#define GPIO1_GDIR_BASE         (0X0209C004)  /* 方向寄存器 */
```

这些数字是从芯片手册里抄出来的，每一个数字都对应着芯片内部的一个物理地址。但请记住，**你不能在 C 语言里直接把 `0X020C406C` 当成指针去解引用**。

我们需要把这些地址「翻译」一下。

### 2.2 虚拟地址映射

```c
/* 映射后的寄存器虚拟地址指针 */
static void __iomem *IMX6U_CCM_CCGR1;
static void __iomem *SW_MUX_GPIO1_IO03;
static void __iomem *SW_PAD_GPIO1_IO03;
static void __iomem *GPIO1_DR;
static void __iomem *GPIO1_GDIR;
```

注意那个 `__iomem` 标记。这不仅仅是一个注释，它是内核的一个宏，用来告诉静态分析工具：「嘿，这指针指向的是 I/O 内存，不是普通的 RAM，别随便乱优化。」

---

## 三、核心控制逻辑

在写那些枯燥的 `open`、`read` 之前，我们先写最有趣的部分——怎么控制灯：

```c
#define LEDOFF  0  /* 关灯 */
#define LEDON   1  /* 开灯 */

void led_switch(u8 sta)
{
    u32 val = 0;

    if(sta == LEDON) {
        val = readl(GPIO1_DR);      // 读出当前寄存器的值
        val &= ~(1 << 3);            // 清除第 3 位（Bit 3），置 0，点亮 LED
        writel(val, GPIO1_DR);      // 写回去
    } else if(sta == LEDOFF) {
        val = readl(GPIO1_DR);      // 读出当前寄存器的值
        val |= (1 << 3);             // 设置第 3 位，置 1，熄灭 LED
        writel(val, GPIO1_DR);      // 写回去
    }
}
```

**细节1：为什么要先读再写？**

你可能会想，直接 `writel(0xFFFFFFF7, GPIO1_DR)` 不就行了吗？不行。

因为 `GPIO1_DR` 寄存器控制了 32 个引脚（GPIO1_IO0 到 GPIO1_IO31）。如果你直接覆盖写入，虽然把 IO3 弄好了，但把其他 31 个引脚的状态全冲掉了。在嵌入式 Linux 这种多任务环境下，其他引脚可能正被别的驱动（比如网络、串口）占用着。你这一笔下去，系统可能就崩了。

所以，**读-改-写** 是操作寄存器的铁律。

**细节2：逻辑是反的吗？**

正点原子的开发板 LED 是低电平点亮的。所以：
- `val &= ~(1 << 3)` 把第 3 位清零，灯亮
- `val |= (1 << 3)` 把第 3 位置 1，灯灭

如果你换了一块板子，这里可能就要反过来。这提醒我们：**硬件连接是软件逻辑的基石，原理图不能丢。**

---

## 四、完整的驱动代码

### 4.1 头文件与宏定义

```c
#include <linux/types.h>
#include <linux/kernel.h>
#include <linux/delay.h>
#include <linux/ide.h>
#include <linux/init.h>
#include <linux/module.h>
#include <linux/errno.h>
#include <linux/gpio.h>
#include <linux/cdev.h>
#include <linux/device.h>
#include <asm/mach/map.h>
#include <asm/uaccess.h>
#include <asm/io.h>

#define LED_MAJOR   200           /* 主设备号 */
#define LED_NAME    "led"         /* 设备名字 */

#define LEDOFF      0             /* 关灯 */
#define LEDON       1             /* 开灯 */
```

### 4.2 寄存器地址映射

```c
/* 寄存器物理地址 */
#define CCM_CCGR1_BASE          (0X020C406C)
#define SW_MUX_GPIO1_IO03_BASE  (0X020E0068)
#define SW_PAD_GPIO1_IO03_BASE  (0X020E02F4)
#define GPIO1_DR_BASE           (0X0209C000)
#define GPIO1_GDIR_BASE         (0X0209C004)

/* 映射后的寄存器虚拟地址指针 */
static void __iomem *IMX6U_CCM_CCGR1;
static void __iomem *SW_MUX_GPIO1_IO03;
static void __iomem *SW_PAD_GPIO1_IO03;
static void __iomem *GPIO1_DR;
static void __iomem *GPIO1_GDIR;
```

### 4.3 file_operations 实现

```c
static int led_open(struct inode *inode, struct file *filp)
{
    return 0;
}

static ssize_t led_read(struct file *filp, char __user *buf,
                        size_t cnt, loff_t *offt)
{
    return 0;
}

static ssize_t led_write(struct file *filp, const char __user *buf,
                         size_t cnt, loff_t *offt)
{
    int retvalue;
    unsigned char databuf[1];
    unsigned char ledstat;

    retvalue = copy_from_user(databuf, buf, cnt);
    if(retvalue < 0) {
        printk("kernel write failed!\\r\\n");
        return -EFAULT;
    }

    ledstat = databuf[0];          /* 获取状态值 */
    if(ledstat == LEDON) {
        led_switch(LEDON);         /* 打开LED灯 */
    } else if(ledstat == LEDOFF) {
        led_switch(LEDOFF);        /* 关闭LED灯 */
    }
    return 0;
}

static int led_release(struct inode *inode, struct file *filp)
{
    return 0;
}

/* 设备操作函数 */
static struct file_operations led_fops = {
    .owner = THIS_MODULE,
    .open = led_open,
    .read = led_read,
    .write = led_write,
    .release = led_release,
};
```

### 4.4 模块加载与卸载

#### 模块加载（初始化）

```c
static int __init led_init(void)
{
    int retvalue = 0;
    u32 val = 0;

    /* 1、寄存器地址映射 */
    IMX6U_CCM_CCGR1 = ioremap(CCM_CCGR1_BASE, 4);
    SW_MUX_GPIO1_IO03 = ioremap(SW_MUX_GPIO1_IO03_BASE, 4);
    SW_PAD_GPIO1_IO03 = ioremap(SW_PAD_GPIO1_IO03_BASE, 4);
    GPIO1_DR = ioremap(GPIO1_DR_BASE, 4);
    GPIO1_GDIR = ioremap(GPIO1_GDIR_BASE, 4);
```

还记得那个比喻吗？**`ioremap` 就是去内核的页表里填了一行，告诉 MMU：「以后有人访问这个虚拟地址，就把它转到这个物理地址去。」**

```c
    /* 2、使能GPIO1 时钟 */
    val = readl(IMX6U_CCM_CCGR1);
    val &= ~(3 << 26);  /* 清除以前的设置 */
    val |= (3 << 26);   /* 设置新值 */
    writel(val, IMX6U_CCM_CCGR1);
```

又是经典的**读-改-写**。CCM_CCGR1 寄存器的第 26、27 位控制着 GPIO1 的时钟。在 i.MX6U 里，`3`（二进制 `11`）表示「永远开启」。

千万别忘了这一步，**很多驱动调试了半天没反应，最后发现是因为忘了开时钟**——硬件在睡觉，你是叫不醒它的。

```c
    /* 3、设置GPIO1_IO03 的复用功能 */
    writel(5, SW_MUX_GPIO1_IO03);

    /* 寄存器SW_PAD_GPIO1_IO03 设置IO属性 */
    writel(0x10B0, SW_PAD_GPIO1_IO03);
```

寄存器 `SW_MUX` 设为 `5` 代表 `ALT5` 模式，也就是 GPIO。至于 `SW_PAD` 的 `0x10B0`，这是配置压摆率和驱动强度的，通常抄个常用值就行。

```c
    /* 4、设置GPIO1_IO03 为输出功能 */
    val = readl(GPIO1_GDIR);
    val &= ~(1 << 3);   /* 清除以前的设置 */
    val |= (1 << 3);    /* 设置为输出 */
    writel(val, GPIO1_GDIR);

    /* 5、默认关闭LED */
    val = readl(GPIO1_DR);
    val |= (1 << 3);
    writel(val, GPIO1_DR);
```

方向寄存器 `GDIR`：`1` 是输出，`0` 是输入。我们是要控制 LED，当然设为输出。

```c
    /* 6、注册字符设备驱动 */
    retvalue = register_chrdev(LED_MAJOR, LED_NAME, &led_fops);
    if(retvalue < 0){
        printk("register chrdev failed!\\r\\n");
        return -EIO;
    }
    return 0;
}
```

最后这一步至关重要。前面的硬件初始化都是「准备工作」，只有调用了 `register_chrdev`，这个驱动才真正在内核里有了「户口」。

#### 模块卸载（退出）

```c
static void __exit led_exit(void)
{
    /* 取消映射 */
    iounmap(IMX6U_CCM_CCGR1);
    iounmap(SW_MUX_GPIO1_IO03);
    iounmap(SW_PAD_GPIO1_IO03);
    iounmap(GPIO1_DR);
    iounmap(GPIO1_GDIR);

    /* 注销字符设备驱动 */
    unregister_chrdev(LED_MAJOR, LED_NAME);
}

module_init(led_init);
module_exit(led_exit);

MODULE_LICENSE("GPL");
MODULE_AUTHOR("Charliechen114514");
MODULE_DESCRIPTION("LED Driver with Legacy API");
MODULE_VERSION("1.0");
```

**`MODULE_LICENSE("GPL")` 是必须的。** 如果你写成了 `Proprietary`（私有协议），内核在加载你的模块时可能会报 tainted pollution（被污染）警告。

---

## 五、测试程序

驱动写完了，内核只是准备好了，但没人用。我们需要一个「用户」来验证它。

```c
#include "stdio.h"
#include "unistd.h"
#include "sys/types.h"
#include "sys/stat.h"
#include "fcntl.h"
#include "stdlib.h"
#include "string.h"

int main(int argc, char *argv[])
{
    int fd, retvalue;
    char *filename;
    unsigned char databuf[1];

    if(argc != 3){
        printf("Error Usage!\\r\\n");
        return -1;
    }

    filename = argv[1];

    fd = open(filename, O_RDWR);
    if(fd < 0){
        printf("file %s open failed!\\r\\n", argv[1]);
        return -1;
    }

    databuf[0] = atoi(argv[2]); /* 要执行的操作：打开或关闭 */

    /* 向/dev/led 文件写入数据 */
    retvalue = write(fd, databuf, sizeof(databuf));
    if(retvalue < 0){
        printf("LED Control Failed!\\r\\n");
        close(fd);
        return -1;
    }

    retvalue = close(fd);
    if(retvalue < 0){
        printf("file %s close failed!\\r\\n", argv[1]);
        return -1;
    }

    return 0;
}
```

看，这就是 Linux 驱动的魅力所在。用户程序只需调用标准的 `open` 和 `write`，至于底层是 GPIO、SPI 还是网络，它完全不需要关心。

---

## 六、编译与运行

### 6.1 编译驱动

**Makefile**：

```makefile
KERNELDIR := /home/charliechen/imx-forge/third_party/linux-imx
CURRENT_PATH := $(shell pwd)
obj-m := led.o

build: kernel_modules

kernel_modules:
\t$(MAKE) -C $(KERNELDIR) M=$(CURRENT_PATH) modules

clean:
\t$(MAKE) -C $(KERNELDIR) M=$(CURRENT_PATH) clean
```

运行 `make`，你会得到一个 `led.ko` 文件。

### 6.2 编译测试APP

```bash
arm-linux-gnueabihf-gcc ledApp.c -o ledApp
```

### 6.3 运行与调试

把 `led.ko` 和 `ledApp` 拷贝到开发板。

⚠️ **踩坑预警**：
如果你用的是正点原子的出厂系统，LED 灯可能一直在闪烁。**这不是你的驱动有问题，而是系统自带的 heartbeat（心跳灯）机制在搞鬼。**

在加载你的驱动前，先把它关掉：

```bash
echo none > /sys/class/leds/sys-led/trigger
```

然后加载驱动：

```bash
depmod            // 第一次加载新驱动前必须运行
modprobe led.ko   // 加载驱动模块
```

老API的**缺点显现了**：用户空间还看不见设备节点，我们需要手动创建：

```bash
mknod /dev/led c 200 0
```

这条命令的意思是：创建一个字符设备（`c`），主设备号 `200`，次设备号 `0`，名字叫 `led`。

见证奇迹的时刻：

```bash
./ledApp /dev/led 1   # 打开 LED
./ledApp /dev/led 0   # 关闭 LED
```

---

## 七、常见错误

### 错误1：忘记开时钟

```c
/* ❌ 错误：直接配置GPIO，忘记开时钟 */
writel(5, SW_MUX_GPIO1_IO03);
```

**后果**：GPIO 不工作，因为外设时钟没有使能。

### 错误2：直接覆盖寄存器值

```c
/* ❌ 错误：直接写寄存器 */
writel(0x08, GPIO1_GDIR);
```

**后果**：把其他 31 个引脚的配置全冲掉了，可能导致系统异常。

### 错误3：忘记 iounmap

```c
/* ❌ 错误：exit函数里忘记释放映射 */
static void __exit led_exit(void) {
    unregister_chrdev(LED_MAJOR, LED_NAME);
    // 忘记 iounmap
}
```

**后果**：内存泄漏，重复加载驱动可能失败。

### 错误4：直接访问用户空间指针

```c
/* ❌ 错误：直接解引用用户空间指针 */
static ssize_t led_write(...) {
    unsigned char ledstat = *buf;  // 危险！
    ...
}
```

**后果**：内核崩溃，因为用户空间的指针不可信。

---

## 八、本章小结

通过本章的学习，你已经掌握了：
1. 如何使用 `ioremap` 建立物理地址到虚拟地址的映射
2. 如何使用 `readl`/`writel` 安全访问硬件寄存器
3. 如何实现 LED 驱动的完整流程
4. 如何处理用户空间和内核空间的数据交换
5. 老API在真实硬件驱动中的应用

这些知识是通用的，无论使用老API还是新API，它们都是基础。

下一章，我们将学习新字符设备驱动API，它会让你看到更规范、更优雅的驱动开发方式。

---

**相关文档**：
- [老API：虚拟字符设备](06_legacy_chardev.md)
- [新字符设备驱动API](08_new_chardev_api.md)
- [新API实战实验](10_newchardev_experiment.md)
