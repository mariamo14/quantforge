#include <cstdint>
#include <iostream>
#include <queue>
#include <string>
#include <unordered_set>
#include <vector>

// Two heaps: max-heap of (price, id) for bids, min-heap for asks.
// On cancel: insert id into a cancelled set.
// On query: pop heap tops whose id is cancelled (or superseded), then peek.

int main() {
    std::ios::sync_with_stdio(false);
    std::cin.tie(nullptr);

    int m;
    std::cin >> m;

    for (int i = 0; i < m; i++) {
        std::string type;
        std::cin >> type;
        // TODO
    }
    return 0;
}
