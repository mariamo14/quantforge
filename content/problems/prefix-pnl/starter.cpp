#include <cstdint>
#include <iostream>

// One pass over the cumulative P&L: track the running peak (starting at 0),
// drawdown at day t = peak - cum_t. Report max drawdown and earliest trough day.

int main() {
    std::ios::sync_with_stdio(false);
    std::cin.tie(nullptr);

    int n;
    std::cin >> n;
    for (int i = 1; i <= n; i++) {
        std::int64_t pnl;
        std::cin >> pnl;
        // TODO
    }
    // TODO: print max drawdown, then trough day index
    return 0;
}
