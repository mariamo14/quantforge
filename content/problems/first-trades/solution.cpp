#include <algorithm>
#include <iostream>

int main() {
    std::ios::sync_with_stdio(false);
    std::cin.tie(nullptr);

    int n;
    std::cin >> n;

    long long totalQty = 0;
    long long minPrice = -1, maxPrice = -1;
    for (int i = 0; i < n; i++) {
        long long price, qty;
        std::cin >> price >> qty;
        totalQty += qty;
        if (minPrice < 0 || price < minPrice) minPrice = price;
        if (price > maxPrice) maxPrice = price;
    }

    std::cout << n << ' ' << totalQty << ' ' << minPrice << ' ' << maxPrice << '\n';
    return 0;
}
