#include <cstdint>
#include <iostream>
#include <unordered_map>

int main() {
    std::ios::sync_with_stdio(false);
    std::cin.tie(nullptr);

    int n;
    std::int64_t target;
    std::cin >> n >> target;

    std::unordered_map<std::int64_t, int> earliestIndex;
    earliestIndex.reserve(1 << 18);

    for (int j = 1; j <= n; j++) {
        std::int64_t value;
        std::cin >> value;
        auto it = earliestIndex.find(target - value);
        if (it != earliestIndex.end()) {
            std::cout << it->second << ' ' << j << '\n';
            return 0;
        }
        // keep only the earliest index per value
        earliestIndex.emplace(value, j);
    }
    std::cout << "NONE\n";
    return 0;
}
