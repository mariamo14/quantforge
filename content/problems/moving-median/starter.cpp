#include <cstdint>
#include <iostream>
#include <set>
#include <vector>

// Two-multiset approach: 'low' (max side) holds ceil(w/2) elements,
// 'high' (min side) holds the rest. Median = *low.rbegin().
// On each step: insert p[i], erase p[i-K] (one occurrence!), rebalance.

int main() {
    std::ios::sync_with_stdio(false);
    std::cin.tie(nullptr);

    int n, k;
    std::cin >> n >> k;
    std::vector<std::int64_t> prices(n);
    for (auto& p : prices) std::cin >> p;

    // TODO
    return 0;
}
