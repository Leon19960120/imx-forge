#include <linux/init.h>
#include <linux/module.h>
#include <linux/printk.h>

#define PRINT_TIMES (5)

static int __init hello_world_init(void) {
    pr_info("Hello World Module Inserts!\n");
    for (int i = 0; i < PRINT_TIMES; i++) {
        pr_info("Hello, World!\n");
    }
    return 0;
}

static void __exit hello_world_exit(void) {
    pr_info("Hello World Module Exits");
}

module_init(hello_world_init);
module_exit(hello_world_exit);
MODULE_LICENSE("Dual MIT/GPL");
MODULE_DESCRIPTION("This is a hello world example modules");