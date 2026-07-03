#include <cstdint>
#include <iostream>

int main() {
    std::ios::sync_with_stdio(false);
    std::cin.tie(nullptr);

    int n;
    std::cin >> n;

    std::int64_t minPrice = 0;
    int minDay = 0;
    std::int64_t bestProfit = 0;
    int bestBuy = 0, bestSell = 0;

    for (int i = 1; i <= n; i++) {
        std::int64_t price;
        std::cin >> price;
        if (i == 1) {
            minPrice = price;
            minDay = 1;
            continue;
        }
        std::int64_t profit = price - minPrice;
        if (profit > bestProfit) {  // strict: keeps the earliest sell day
            bestProfit = profit;
            bestBuy = minDay;
            bestSell = i;
        }
        if (price < minPrice) {  // strict: keeps the earliest buy day
            minPrice = price;
            minDay = i;
        }
    }

    if (bestProfit <= 0) {
        std::cout << 0 << '\n';
    } else {
        std::cout << bestProfit << '\n' << bestBuy << ' ' << bestSell << '\n';
    }
    return 0;
}
