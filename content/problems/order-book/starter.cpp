#include <cstdint>
#include <iostream>
#include <map>
#include <string>
#include <unordered_map>

// Two std::map<int64_t, int64_t> (price -> total level qty), one per side,
// plus an unordered_map<id -> {side, price, remaining}>.
// Best bid = bids.rbegin(), best ask = asks.begin().
// Erase a level when its quantity reaches zero.

int main() {
    std::ios::sync_with_stdio(false);
    std::cin.tie(nullptr);

    int m;
    std::cin >> m;

    for (int i = 0; i < m; i++) {
        std::string type;
        std::cin >> type;
        if (type == "A") {
            long long id, price, qty;
            char side;
            std::cin >> id >> side >> price >> qty;
            // TODO
        } else if (type == "C") {
            long long id;
            std::cin >> id;
            // TODO
        } else if (type == "X") {
            long long id, qty;
            std::cin >> id >> qty;
            // TODO
        } else {  // Q
            std::string what;
            std::cin >> what;
            if (what == "BEST") {
                // TODO: print "bid ask" or "-" for empty sides
            } else {  // VOL
                char side;
                long long price;
                std::cin >> side >> price;
                // TODO: print level quantity
            }
        }
    }
    return 0;
}
