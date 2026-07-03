#include <cstdint>
#include <iostream>
#include <string>

// Parse a price string with up to 4 decimals into an integer number of
// ticks (1 tick = 0.0001), sum price*qty exactly, and print the total
// with exactly 4 decimal places.

int main() {
    std::ios::sync_with_stdio(false);
    std::cin.tie(nullptr);

    int n;
    std::cin >> n;
    for (int i = 0; i < n; i++) {
        std::string price;
        std::int64_t qty;
        std::cin >> price >> qty;
        // TODO: accumulate exact notional in ticks
    }
    // TODO: print total as dollars with exactly 4 decimal places
    return 0;
}
