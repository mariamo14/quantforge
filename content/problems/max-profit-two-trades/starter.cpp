#include <cstdint>
#include <iostream>
#include <vector>

// State machine (O(1) memory): track the best achievable "cash" in each state:
//   buy1  = -min price so far
//   sell1 = best single-trade profit so far
//   buy2  = sell1 - price (bank first profit, re-buy)
//   sell2 = buy2 + price
// Update all four per price, in an order that avoids same-day contamination
// (or note why same-day zero-profit trades make any order safe here).

int main() {
    std::ios::sync_with_stdio(false);
    std::cin.tie(nullptr);

    int n;
    std::cin >> n;
    // TODO
    return 0;
}
