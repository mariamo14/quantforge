#include <algorithm>
#include <cstdint>
#include <iostream>

int main() {
    std::ios::sync_with_stdio(false);
    std::cin.tie(nullptr);

    int n;
    std::cin >> n;

    const std::int64_t NEG = INT64_MIN / 4;
    std::int64_t buy1 = NEG, sell1 = 0, buy2 = NEG, sell2 = 0;

    for (int i = 0; i < n; i++) {
        std::int64_t price;
        std::cin >> price;
        buy1 = std::max(buy1, -price);
        sell1 = std::max(sell1, buy1 + price);
        buy2 = std::max(buy2, sell1 - price);
        sell2 = std::max(sell2, buy2 + price);
    }

    std::cout << sell2 << '\n';
    return 0;
}
