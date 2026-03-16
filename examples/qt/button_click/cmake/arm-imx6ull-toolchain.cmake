# CMake Toolchain file for i.MX6ULL ARM cross-compilation
# Target: NXP i.MX6ULL (ARM Cortex-A7)
#
# Usage:
#   mkdir build-cross && cd build-cross
#   cmake -DCMAKE_TOOLCHAIN_FILE=../cmake/arm-imx6ull-toolchain.cmake ..

# Target system specification
set(CMAKE_SYSTEM_NAME Linux)
set(CMAKE_SYSTEM_PROCESSOR arm)

# Cross-compiler toolchain paths
set(TOOLCHAIN_DIR /opt/arm-gnu-toolchain)
set(TOOLCHAIN_PREFIX arm-none-linux-gnueabihf-)

# Specify the cross-compilers
set(CMAKE_C_COMPILER ${TOOLCHAIN_DIR}/bin/${TOOLCHAIN_PREFIX}gcc)
set(CMAKE_CXX_COMPILER ${TOOLCHAIN_DIR}/bin/${TOOLCHAIN_PREFIX}g++)
set(CMAKE_AR ${TOOLCHAIN_DIR}/bin/${TOOLCHAIN_PREFIX}ar)
set(CMAKE_STRIP ${TOOLCHAIN_DIR}/bin/${TOOLCHAIN_PREFIX}strip)
set(CMAKE_RANLIB ${TOOLCHAIN_DIR}/bin/${TOOLCHAIN_PREFIX}ranlib)

# Cross-compiled Qt6 installation path
set(CROSS_QT6_DIR /home/charliechen/imx-forge/out/qt6-imx6ull)

# Set the find root paths for CMake to locate libraries and headers
set(CMAKE_FIND_ROOT_PATH ${CROSS_QT6_DIR})

# Tell CMake to search in the target root for libraries and headers
set(CMAKE_FIND_ROOT_PATH_MODE_LIBRARY ONLY)
set(CMAKE_FIND_ROOT_PATH_MODE_INCLUDE ONLY)
set(CMAKE_FIND_ROOT_PATH_MODE_PACKAGE ONLY)

# Allow programs from the host system (like moc, rcc, uic from Qt)
set(CMAKE_FIND_ROOT_PATH_MODE_PROGRAM NEVER)

# Set Qt6 specific paths
set(CMAKE_PREFIX_PATH ${CROSS_QT6_DIR})
set(CMAKE_FIND_FRAMEWORK LAST)

# Set Qt mkspecs for cross-compilation
set(QT_HOST_PATH /home/charliechen/imx-forge/host/qt6-host)

# Additional compiler flags for ARM
set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -march=armv7-a -mfloat-abi=hard -mfpu=neon")
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -march=armv7-a -mfloat-abi=hard -mfpu=neon")
