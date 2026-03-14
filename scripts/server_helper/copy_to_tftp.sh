#!/bin/bash
#
# copy_to_tftp.sh - Copy kernel and DTB files to TFTP directory
#
# Usage: copy_to_tftp.sh [OPTIONS]
#
# Options:
#   --kernel=PATH      Path to zImage kernel file
#                     (default: out/linux/zImage)
#   --dts=PATH         Path to DTB file
#                     (default: out/linux/arch/arm/boot/dts/nxp/imx/imx6ull-aes.dtb)
#   --tftp-path=PATH   Path to TFTP directory
#                     (default: ~/tftp)
#   -h, --help         Show this help message
#

# Default values
DEFAULT_KERNEL="out/linux/arch/arm/boot/zImage"
DEFAULT_DTS="out/linux/arch/arm/boot/dts/nxp/imx/imx6ull-aes.dtb"
DEFAULT_TFTP_PATH="$HOME/tftp"

# Initialize variables with defaults
KERNEL="${DEFAULT_KERNEL}"
DTS="${DEFAULT_DTS}"
TFTP_PATH="${DEFAULT_TFTP_PATH}"

# Print usage message
usage() {
    sed -n '/^# Usage:/,/^$/p' "$0" | sed 's/^# //g' | sed 's/^#//g'
    exit 0
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case "$1" in
        --kernel=*)
            KERNEL="${1#*=}"
            ;;
        --dts=*)
            DTS="${1#*=}"
            ;;
        --tftp-path=*)
            TFTP_PATH="${1#*=}"
            ;;
        -h|--help)
            usage
            ;;
        *)
            echo "Error: Unknown option '$1'"
            usage
            ;;
    esac
    shift
done

# Check if rsync is available
if command -v rsync &> /dev/null; then
    COPY_CMD="rsync -ah --progress"
else
    COPY_CMD="cp -v"
fi

# Check if source files exist
check_and_copy() {
    local src="$1"
    local dst="$2"
    local desc="$3"

    if [[ ! -f "${src}" ]]; then
        echo "Error: ${desc} not found at '${src}'"
        return 1
    fi

    # Create destination directory if it doesn't exist
    mkdir -p "$(dirname "${dst}")"

    # Copy file
    ${COPY_CMD} "${src}" "${dst}"
    if [[ $? -eq 0 ]]; then
        echo "Success: Copied ${desc} to '${dst}'"
        return 0
    else
        echo "Error: Failed to copy ${desc}"
        return 1
    fi
}

# Main execution
MAIN_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "${MAIN_DIR}" || exit 1

echo "TFTP Copy Helper"
echo "================"
echo "Kernel:   ${KERNEL}"
echo "DTB:      ${DTS}"
echo "TFTP dir: ${TFTP_PATH}"
echo ""

# Expand tilde in TFTP_PATH
TFTP_PATH="${TFTP_PATH/#\~/$HOME}"

# Copy kernel
KERNEL_DST="${TFTP_PATH}/$(basename "${KERNEL}")"
check_and_copy "${KERNEL}" "${KERNEL_DST}" "Kernel" || exit 1

# Copy DTB
DTB_DST="${TFTP_PATH}/$(basename "${DTS}")"
check_and_copy "${DTS}" "${DTB_DST}" "DTB" || exit 1

echo ""
echo "All files copied successfully!"
