#include <algorithm>
#include <cstdint>
#include <iostream>
#include <vector>

// Sort by start; sweep, extending the current interval while
// next.start <= current.end (touching merges), else emit and restart.

int main() {
    std::ios::sync_with_stdio(false);
    std::cin.tie(nullptr);

    int n;
    std::cin >> n;
    std::vector<std::pair<std::int64_t, std::int64_t>> halts(n);
    for (auto& [s, e] : halts) std::cin >> s >> e;

    // TODO
    return 0;
}
