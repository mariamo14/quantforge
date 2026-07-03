#include <cstdint>
#include <deque>
#include <iostream>

// Monotonic deque of indices: front = index of current window max.
// Pop from the back while the new price >= price at the back (they can
// never be the max again); pop the front when it falls out of the window.

int main() {
    std::ios::sync_with_stdio(false);
    std::cin.tie(nullptr);

    int n, k;
    std::cin >> n >> k;

    for (int i = 0; i < n; i++) {
        std::int64_t price;
        std::cin >> price;
        // TODO
    }
    return 0;
}
