#include <cstdint>
#include <deque>
#include <iostream>
#include <map>
#include <string>

struct Order {
    long long id;
    std::int64_t price;
    std::int64_t qty;
};

// bids: map<price, deque<Order>> — best = highest price -> use rbegin()/greater<>.
// asks: map<price, deque<Order>> — best = lowest price.
// Match incoming against opposite side while prices cross; fills at RESTING price.

int main() {
    std::ios::sync_with_stdio(false);
    std::cin.tie(nullptr);

    int m;
    std::cin >> m;
    for (int i = 0; i < m; i++) {
        long long id, price, qty;
        char side;
        std::cin >> id >> side >> price >> qty;
        // TODO: match, then rest any remainder
    }
    // TODO: print final book
    return 0;
}
