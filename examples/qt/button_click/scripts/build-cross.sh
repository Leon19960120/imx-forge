#!/bin/bash
# Cross-compile script for i.MX6ULL ARM target
# Usage: ./scripts/build-cross.sh [--clean]

set -e

# Project root directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Build directory for cross-compilation
BUILD_DIR="${PROJECT_ROOT}/build-cross"
TOOLCHAIN_FILE="${PROJECT_ROOT}/cmake/arm-imx6ull-toolchain.cmake"

# Parse arguments
CLEAN_BUILD=false
for arg in "$@"; do
    case $arg in
        --clean)
            CLEAN_BUILD=true
            shift
            ;;
        *)
            echo "Unknown option: $arg"
            echo "Usage: $0 [--clean]"
            exit 1
            ;;
    esac
done

# Clean build directory if requested
if [ "$CLEAN_BUILD" = true ]; then
    echo "Cleaning build directory: ${BUILD_DIR}"
    rm -rf "${BUILD_DIR}"
fi

# Create build directory
mkdir -p "${BUILD_DIR}"
cd "${BUILD_DIR}"

# Configure with toolchain file
echo "Configuring cross-compilation build..."
cmake -DCMAKE_TOOLCHAIN_FILE="${TOOLCHAIN_FILE}" ..

# Build
echo "Building..."
NPROC=$(nproc 2>/dev/null || echo 4)
make -j${NPROC}

echo ""
echo "Build complete! Output: ${BUILD_DIR}/button_click"
echo "To verify the architecture, run:"
echo "  file ${BUILD_DIR}/button_click"
