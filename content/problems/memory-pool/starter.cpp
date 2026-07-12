#include <cstdint>
#include <iostream>
#include <queue>
#include <string>
#include <vector>

// watermark = count of never-yet-allocated blocks handed out so far;
// freed = min-heap of returned indices; used = bitmap for DOUBLE_FREE.
// ALLOC: smallest of (heap top vs watermark). FREE: check bitmap, push heap.

int main() {
    std::ios::sync_with_stdio(false);
    std::cin.tie(nullptr);

    int n, m;
    std::cin >> n >> m;
    // TODO
    return 0;
}
