# 新字符设备驱动API - 精细化资源管理

## 从老API的痛点说起

> **章节引子**

有一种错觉，几乎是每个刚写完第一个驱动的人都会有的：觉得 `register_chrdev` 这一行代码只要不报错，世界就和平了。

但这个错觉很危险。

为什么危险？因为你在这个函数里交出了一份你根本没意识到的空白授权书。当你写下 `register_chrdev(200, ...)` 时，你告诉内核：「把 200 号设备通道下面所有的门——从第 0 扇到第 1048575 扇——全部交给我」。哪怕你的驱动只需要一扇门，内核也会把剩下的那一百多万扇门统统锁死，谁也别想用。

这种行为在工程上叫「资源霸占」。在内核这种寸土寸金的地方，这是严重的社交事故。

**解决这个问题的思路很朴素：按需分配。**

我们需要一种机制，既能精准地申请「我要几个号」，又能灵活地决定「我自己定号」还是「内核你看着办」。这就是本章的主角——**新字符设备驱动 API**。

它不再是那个一行代码搞定一切的暴力函数，而是一套配合精密的组合拳。这组 API 会强迫你直面那些在旧方案里被掩盖的细节——设备号从哪来、字符设备怎么表示、系统怎么知道你加入了。

---

## 一、新API概览

### 1.1 为什么要推出新API？

老API（`register_chrdev`）虽然简单，但存在三个大问题：

| 问题 | 老API | 新API |
|------|-------|-------|
| **设备号管理** | 静态指定，容易冲突 | 动态分配，避免冲突 |
| **资源占用** | 占用整个主设备号（1048576个次设备号） | 按需申请，精准控制 |
| **设备节点** | 需要手动 mknod | 自动创建 |

**新API的设计理念**：
- 把「注册」这个大动作拆成清晰的三个阶段：**领号 → 填表 → 进门**
- 强迫开发者思考每个步骤的目的
- 提供更精细的资源控制

### 1.2 新API的"三步走"

```
第一步：领号
  ↓
  alloc_chrdev_region（申请设备号）
  或
  register_chrdev_region（静态注册）
  
第二步：填表
  ↓
  cdev_init（初始化cdev结构体）
  cdev_add（添加到系统）
  
第三步：进门
  ↓
  class_create（创建设备类）
  device_create（创建具体设备，自动创建/dev节点）
```

看起来比老API复杂？是的。但换来的是什么？
- **对资源的精准控制**
- **对内核行为的完全知情**
- **自动化的设备节点管理**

---

## 二、第一步：领号——设备号分配

老API最大的问题，就是它的颗粒度太粗。这种粗粒度带来了两个必须要解决的麻烦：

1. **撞车风险**：你必须凭感觉或查手册来确定一个主设备号没用过
2. **浪费资源**：一个 LED 驱动只需要一对设备号，但老API会粗暴地霸占整个主设备号下的所有 1048576 个次设备号

### 2.1 路径一：静态注册（我有主见）

如果你很确定自己要用哪个主设备号（比如你想用传统的 200 号），那就用 `register_chrdev_region` 把它「圈」下来：

```c
int register_chrdev_region(dev_t from, unsigned count, const char *name);
```

**参数说明**：
- **from**：你要申请的起始设备号（包含主、次设备号）
- **count**：你要申请多少个连续的设备号。通常这里是 1
- **name**：设备名称，会在 `/proc/devices` 里显示

**使用示例**：
```c
dev_t devid;

devid = MKDEV(200, 0);  // 主设备号200，次设备号0
register_chrdev_region(devid, 1, "led");
```

### 2.2 路径二：动态申请（看着办）

这是更推荐的做法。你不需要关心主设备号是多少，只要告诉内核「给我一个号」，内核会在这个空闲池里随手划一个给你：

```c
int alloc_chrdev_region(dev_t *dev, unsigned baseminor, 
                         unsigned count, const char *name);
```

**参数说明**：
- **dev**：这是一个**传出参数**。函数执行成功后，申请到的设备号会被塞进这个变量里
- **baseminor**：次设备号的起始值，一般为 0
- **count**：数量，通常为 1
- **name**：设备名称

**使用示例**：
```c
dev_t devid;
int major, minor;

alloc_chrdev_region(&devid, 0, 1, "led");
major = MAJOR(devid);  // 获取分配到的主设备号
minor = MINOR(devid);  // 获取分配到的次设备号

printk("major=%d, minor=%d\n", major, minor);
```

### 2.3 归还设备号

不管你是上面哪种方式拿到的号，卸载驱动的时候，必须把它还回去：

```c
void unregister_chrdev_region(dev_t from, unsigned count);
```

**使用示例**：
```c
unregister_chrdev_region(devid, 1);  // 注销设备号
```

### 2.4 实战里的惯用写法

在真实的驱动代码中，我们通常会让「静态指定」和「动态申请」共存，通过一个变量来控制。这样既灵活又便于调试：

```c
int major = 0;  // 为0表示动态申请，非0表示使用指定值
int minor;
dev_t devid;

if (major) {
    // 静态指定
    devid = MKDEV(major, 0);
    register_chrdev_region(devid, 1, "test");
} else {
    // 动态申请
    alloc_chrdev_region(&devid, 0, 1, "test");
    major = MAJOR(devid);  // 保存分配到的主设备号
    minor = MINOR(devid);
}
```

这里用了几个重要的宏：
- **MKDEV(major, minor)**：把主设备号和次设备号拼成一个完整的 `dev_t` 类型
- **MAJOR(devid)**：从 `dev_t` 中提取主设备号
- **MINOR(devid)**：从 `dev_t` 中提取次设备号

---

## 三、第二步：填表——cdev结构体与注册

有了设备号，不代表设备就能工作了。旧API帮你把脏活累活全干了，但在新模型里，你需要亲手组装设备的核心——**cdev 结构体**。

### 3.1 cdev：设备的"身份证"

你可以把 `cdev` 理解为字符设备在内核里的「身份证」和「操作手册」的合集：

```c
struct cdev {
    struct kobject kobj;
    struct module *owner;
    const struct file_operations *ops;
    struct list_head list;
    dev_t dev;
    unsigned int count;
};
```

需要重点关注的成员：
- **ops**：指向 `file_operations` 结构体的指针（设备的灵魂）
- **dev**：设备号
- **owner**：通常填 `THIS_MODULE`，防止驱动在使用中被意外卸载

### 3.2 初始化cdev：cdev_init

定义一个 `struct cdev testcdev;` 之后，它还是一张白纸。你需要用 `cdev_init` 函数把它和你写好的操作函数集绑在一起：

```c
void cdev_init(struct cdev *cdev, const struct file_operations *fops);
```

**使用示例**：
```c
struct cdev testcdev;
static struct file_operations test_fops = {
    .owner = THIS_MODULE,
    .open = test_open,
    .read = test_read,
    .write = test_write,
    .release = test_release,
};

testcdev.owner = THIS_MODULE;
cdev_init(&testcdev, &test_fops);  // 初始化 cdev
```

注意：虽然 `cdev_init` 也会做一些初始化工作，但把 `owner` 填上 `THIS_MODULE` 是个好习惯。

### 3.3 添加到系统：cdev_add

身份证填好了，操作手册挂上了，现在要去内核那里「报到了」：

```c
int cdev_add(struct cdev *p, dev_t dev, unsigned count);
```

**参数说明**：
- **p**：指向你的 `cdev` 变量
- **dev**：设备号
- **count**：设备数量，通常是 1

**使用示例**：
```c
cdev_add(&testcdev, devid, 1);  // 添加字符设备
```

这一步一旦成功，你的设备就在内核里活了。用户空间只要知道这个设备号，就能通过设备文件访问它。

### 3.4 删除cdev：cdev_del

卸载驱动模块时，你必须把 `cdev` 从系统中剥离：

```c
void cdev_del(struct cdev *p);
```

**使用示例**：
```c
cdev_del(&testcdev);  // 删除 cdev
```

### 3.5 完整的"领号+填表"流程

把前面的代码连起来看：

```c
dev_t devid;
struct cdev testcdev;
static struct file_operations test_fops = {
    .owner = THIS_MODULE,
    // ...
};

/* 1. 领号：申请设备号 */
alloc_chrdev_region(&devid, 0, 1, "test");

/* 2. 填表：初始化并添加cdev */
testcdev.owner = THIS_MODULE;
cdev_init(&testcdev, &test_fops);
cdev_add(&testcdev, devid, 1);
```

你会发现，这一套组合拳下来，实现的功能才等价于旧版本里简简单单的一句 `register_chrdev`。

代码变多了，但你换回的是什么？
- 对资源的精准控制
- 对内核行为的完全知情

---

## 四、第三步：进门——自动创建设备节点

上一节，我们用 `cdev_add` 完成了设备在内核层面的注册。但如果你现在把模块加载进板子，去 `/dev` 目录下看，你会发现——什么都没有。

内核知道这设备存在，但用户空间还蒙在鼓里。

在旧时代（或者老API代码里），这时候你得手动敲 `mknod` 命令，告诉系统"在这个路径上建个文件"。这很原始。作为驱动开发者，我们的目标是让硬件变得"热插拔即用"。

这一节，我们要解决的就是这个"最后一公里"的问题：**如何让设备节点在加载驱动时自动出现在 `/dev` 目录下。**

### 4.1 mdev机制：谁来守门？

在 Linux 的世界里，创建设备节点这种事，其实**不是内核干的**。

这听起来有点反直觉。内核负责管理硬件，但"在文件系统里创建一个文件节点"这种脏活累活，内核是甩手给用户空间的程序去做的。

- **udev**：完整的 Linux 桌面/服务器发行版里的守门员，功能强大
- **mdev**：BusyBox 提供的简化版 udev，专为嵌入式 Linux 设计

当我们使用 `modprobe` 加载驱动，或者 `rmmod` 卸载驱动时，内核会通过 **hotplug（热插拔）** 机制通知用户空间的 mdev，mdev 会自动在 `/dev` 目录下创建对应的设备文件。

#### 物业管理员类比

你可以把内核想象成一个**物业管理员**（mdev），而硬件设备是**住户**。

当住户（驱动）搬进来时，住户自己不能去楼道（`/dev`）里乱贴门牌号。住户必须先去物业前台（内核 sysfs）登记。物业管理员看到前台登记的信息后，才会去楼道里钉上一个正式的门牌号。

`mdev` 并不是一直盯着前台看的轮询程序，它是被内核"唤醒"的。内核通过 `hotplug` 机制主动把消息塞给它。这种"主动通知"机制效率极高。

### 4.2 创建类：class_create

在 `cdev_add` 之后，我们需要创建一个"类"。

这里的"类"是一个逻辑上的容器。我们在 `/sys/class` 目录下看到的那些文件夹（如 `net`、`input`）就是各种类。把设备归类到某个类下，不仅是为了自动创建节点，也是为了向用户空间暴露设备层级关系。

```c
struct class *class_create(struct module *owner, const char *name);
```

**参数说明**：
- **owner**：填 `THIS_MODULE`，代表拥有这个类的模块
- **name**：类的名字。如果你填 `"led_class"`，那么在 `/sys/class/led_class` 下就能看到它

**使用示例**：
```c
struct class *led_class;

led_class = class_create(THIS_MODULE, "led_class");
if (IS_ERR(led_class)) {
    return PTR_ERR(led_class);
}
```

⚠️ **别忘了这一步**

很多人以为注册了 `cdev` 就万事大吉，结果忘了 `class_create`。结果就是：内核里有设备，`cat /proc/devices` 能看到，但 `/dev` 下空空如也。

### 4.3 创建设备：device_create

类创建好了，只是搭了个架子。现在我们要在这个类下面挂上具体的"设备"。这一步才是真正触发 `mdev` 去创建 `/dev` 下节点文件的动作。

```c
struct device *device_create(
    struct class *class,
    struct device *parent,
    dev_t devt,
    void *drvdata,
    const char *fmt, ...
);
```

**参数说明**：
- **class**：设备要挂在哪个类下面
- **parent**：父设备，一般填 `NULL`
- **devt**：设备号
- **drvdata**：设备私有数据，一般填 `NULL`
- **fmt**：设备名字。**这是重点！** 如果你填 `"led0"`，那么 mdev 就会在 `/dev` 目录下创建一个叫 `led0` 的文件

**这是一个可变参数函数**，你可以像 `printf` 那样格式化设备名：
```c
device_create(class, NULL, devid, NULL, "led%d", 0);  // 生成 led0
device_create(class, NULL, devid, NULL, "led%d", 1);  // 生成 led1
```

**使用示例**：
```c
struct device *led_device;

led_device = device_create(led_class, NULL, devid, NULL, "led0");
if (IS_ERR(led_device)) {
    class_destroy(led_class);  // 失败时记得清理类
    return PTR_ERR(led_device);
}
```

**回到物业管理员的类比**：

如果说 `class_create` 是在物业系统里建立了一个"业主群"，那么 `device_create` 就是把你这个具体的业主拉进群里，并告诉物业："嘿，去给这位业主钉个叫 `led0` 的门牌号。"

当你执行 `device_create` 时，内核就会在 `/sys/class/<你的类>/<你的设备>` 下生成目录和属性文件，mdev 监听到这些变化，就会自动在 `/dev` 下创建节点。

### 4.4 销毁顺序：先 device 后 class

卸载驱动时，必须按逆序销毁：

```c
device_destroy(led_class, devid);  // 1. 先删除设备
class_destroy(led_class);          // 2. 再删除类
```

这像穿衣服和脱衣服，顺序不能反。

---

## 五、完整的"三步走"流程

把上面的三步组合起来，代码结构非常清晰：

```c
/* 全局变量 */
struct cdev testcdev;
struct class *test_class;
struct device *test_device;
dev_t devid;

/* 驱动入口函数 */
static int __init test_init(void)
{
    int retvalue;

    /* 第一步：领号 */
    retvalue = alloc_chrdev_region(&devid, 0, 1, "test");
    if (retvalue < 0) {
        return retvalue;
    }

    /* 第二步：填表 */
    testcdev.owner = THIS_MODULE;
    cdev_init(&testcdev, &test_fops);
    retvalue = cdev_add(&testcdev, devid, 1);
    if (retvalue < 0) {
        goto failed_cdev;
    }

    /* 第三步：进门 */
    test_class = class_create(THIS_MODULE, "test_class");
    if (IS_ERR(test_class)) {
        retvalue = PTR_ERR(test_class);
        goto failed_class;
    }

    test_device = device_create(test_class, NULL, devid, NULL, "test0");
    if (IS_ERR(test_device)) {
        retvalue = PTR_ERR(test_device);
        goto failed_device;
    }

    return 0;

failed_device:
    class_destroy(test_class);
failed_class:
    cdev_del(&testcdev);
failed_cdev:
    unregister_chrdev_region(devid, 1);
    return retvalue;
}

/* 驱动出口函数 */
static void __exit test_exit(void)
{
    /* 第三步：进门（逆序）*/
    device_destroy(test_class, devid);
    class_destroy(test_class);

    /* 第二步：填表（逆序）*/
    cdev_del(&testcdev);

    /* 第一步：领号（逆序）*/
    unregister_chrdev_region(devid, 1);
}
```

注意错误处理中的 `goto` 用法。这是内核驱动的标准做法：清理时跳转到对应的标签，确保资源被正确释放。

---

## 六、新老API对比

让我们用一张表来总结新老API的差异：

| 特性 | 老API | 新API |
|------|-------|-------|
| **注册函数** | `register_chrdev()` | `alloc_chrdev_region` + `cdev_add` |
| **代码行数** | 1行 | 5-10行 |
| **设备号管理** | 静态指定，容易冲突 | 动态分配，避免冲突 |
| **资源占用** | 占用整个主设备号（0~1048575） | 按需申请，精准控制 |
| **设备节点** | 手动 `mknod` | 自动创建（`class_create` + `device_create`） |
| **适用场景** | 快速原型、学习 | 生产环境、多设备 |
| **错误处理** | 简单 | 需要处理多个步骤的错误 |

### 什么时候用老API？

- 快速验证想法
- 学习驱动基础概念
- 只需要一个设备，且不在乎资源浪费

### 什么时候用新API？

- 生产环境代码
- 需要管理多个设备
- 需要自动创建设备节点
- 需要精细控制资源

---

## 七、常见错误

### 错误1：忘记创建类

```c
/* ❌ 错误 */
cdev_add(&testcdev, devid, 1);
// 忘记 class_create 和 device_create
```

**后果**：设备在内核里注册成功，但 `/dev` 下没有节点文件。

### 错误2：销毁顺序错误

```c
/* ❌ 错误 */
class_destroy(test_class);   // 先销毁类
device_destroy(test_class, devid);  // 再销毁设备（错误！）
```

**后果**：内核崩溃或内存泄漏。

### 错误3：忘记错误处理

```c
/* ❌ 错误 */
alloc_chrdev_region(&devid, 0, 1, "test");
cdev_add(&testcdev, devid, 1);
test_class = class_create(THIS_MODULE, "test");
test_device = device_create(...);
// 没有检查返回值
```

**后果**：某一步失败后，后续步骤继续执行，导致内核崩溃或资源泄漏。

---

## 八、本章小结

新字符设备驱动 API 虽然代码量比老 API 多，但它带来了：

✅ **精细化资源管理**：按需申请设备号，避免浪费
✅ **自动化**：自动创建设备节点，无需手动 mknod
✅ **灵活性**：支持静态指定和动态分配两种模式
✅ **可扩展性**：为管理多设备打下基础

新API的"三步走"：
1. **领号**：`alloc_chrdev_region` 或 `register_chrdev_region`
2. **填表**：`cdev_init` + `cdev_add`
3. **进门**：`class_create` + `device_create`

下一章，我们将使用新 API 编写一个完整的 LED 驱动，并介绍如何用设备结构体封装所有信息，让代码更整洁、更专业。

---

**相关文档**：
- [老API字符设备驱动](06_legacy_chardev.md)
- [新API实战实验](09_newchardev_experiment.md)
- [硬件访问基础](10_hardware_access.md)
