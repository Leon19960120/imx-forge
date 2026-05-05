#include <stdio.h>
#include <stdlib.h>
#include <fcntl.h>
#include <unistd.h>
#include <string.h>
#include <errno.h>

#define DEVICE_PATH "/dev/beep"
#define BEEP_ON  0
#define BEEP_OFF 1
#define BEEP_DURATION_SEC 1   // 选项2 鸣响持续时间（秒）

static void print_usage(const char *prog)
{
    fprintf(stderr, "Usage: %s <0|1|2>\n", prog);
    fprintf(stderr, "  0 - turn beep ON\n");
    fprintf(stderr, "  1 - turn beep OFF\n");
    fprintf(stderr, "  2 - beep once for 1 second (auto-off)\n");
}

int main(int argc, char *argv[])
{
    int fd;
    unsigned char val;

    if (argc != 2) {
        print_usage(argv[0]);
        return EXIT_FAILURE;
    }

    int mode = atoi(argv[1]);

    fd = open(DEVICE_PATH, O_WRONLY);
    if (fd < 0) {
        fprintf(stderr, "Failed to open %s: %s\n", DEVICE_PATH, strerror(errno));
        return EXIT_FAILURE;
    }

    if (mode == 0) {
        val = BEEP_ON;
        if (write(fd, &val, 1) != 1) {
            fprintf(stderr, "Failed to write: %s\n", strerror(errno));
            close(fd);
            return EXIT_FAILURE;
        }
        printf("Input: 0 -> Beep turned ON\n");
    } 
    else if (mode == 1) {
        val = BEEP_OFF;
        if (write(fd, &val, 1) != 1) {
            fprintf(stderr, "Failed to write: %s\n", strerror(errno));
            close(fd);
            return EXIT_FAILURE;
        }
        printf("Input: 1 -> Beep turned OFF\n");
    }
    else if (mode == 2) {
        // 打开蜂鸣器
        val = BEEP_ON;
        if (write(fd, &val, 1) != 1) {
            fprintf(stderr, "Failed to turn beep ON: %s\n", strerror(errno));
            close(fd);
            return EXIT_FAILURE;
        }
        // 等待 1 秒
        sleep(BEEP_DURATION_SEC);
        // 关闭蜂鸣器
        val = BEEP_OFF;
        if (write(fd, &val, 1) != 1) {
            fprintf(stderr, "Failed to turn beep OFF: %s\n", strerror(errno));
            close(fd);
            return EXIT_FAILURE;
        }
        printf("Beeped for 1 second\n");
    }
    else {
        fprintf(stderr, "Error: invalid argument. Must be 0, 1, or 2.\n");
        print_usage(argv[0]);
        close(fd);
        return EXIT_FAILURE;
    }

    close(fd);
    return EXIT_SUCCESS;
}