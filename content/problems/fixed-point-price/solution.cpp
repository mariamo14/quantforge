#include <cstdint>
#include <iostream>
#include <string>

int main() {
    std::ios::sync_with_stdio(false);
    std::cin.tie(nullptr);

    int n;
    std::cin >> n;
    std::int64_t total = 0;
    for (int i = 0; i < n; i++) {
        std::string price;
        std::int64_t qty;
        std::cin >> price >> qty;

        auto dot = price.find('.');
        std::string whole = dot == std::string::npos ? price : price.substr(0, dot);
        std::string frac = dot == std::string::npos ? "" : price.substr(dot + 1);
        while (frac.size() < 4) frac.push_back('0');

        std::int64_t ticks = 0;
        for (char c : whole) ticks = ticks * 10 + (c - '0');
        for (char c : frac) ticks = ticks * 10 + (c - '0');

        total += ticks * qty;
    }

    std::int64_t frac = total % 10000;
    std::cout << total / 10000 << '.'
              << (char)('0' + frac / 1000) << (char)('0' + frac / 100 % 10)
              << (char)('0' + frac / 10 % 10) << (char)('0' + frac % 10) << '\n';
    return 0;
}
