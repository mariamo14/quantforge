#include <cstdint>
#include <iostream>
#include <vector>

// Sliding-window VWAP with running sums. All integer arithmetic:
// round half-up of num/den is (num * 2 + den) / (den * 2).

int main() {
    std::ios::sync_with_stdio(false);
    std::cin.tie(nullptr);

    int n, k;
    std::cin >> n >> k;

    for (int i = 0; i < n; i++) {
        std::int64_t price, volume;
        std::cin >> price >> volume;
        // TODO: update window sums, evict trade i-k, print VWAP as dollars.cents
    }
    return 0;
}
