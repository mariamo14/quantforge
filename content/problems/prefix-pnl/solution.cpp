#include <cstdint>
#include <iostream>

int main() {
    std::ios::sync_with_stdio(false);
    std::cin.tie(nullptr);

    int n;
    std::cin >> n;

    std::int64_t cum = 0;
    std::int64_t peak = 0;  // cum_0 = 0 counts as a peak
    std::int64_t maxDrawdown = 0;
    int troughDay = 1;

    for (int i = 1; i <= n; i++) {
        std::int64_t pnl;
        std::cin >> pnl;
        cum += pnl;
        std::int64_t drawdown = peak - cum;
        if (drawdown > maxDrawdown) {
            maxDrawdown = drawdown;
            troughDay = i;
        }
        if (cum > peak) {
            peak = cum;
        }
    }

    std::cout << maxDrawdown << '\n' << troughDay << '\n';
    return 0;
}
