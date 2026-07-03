#include <cstdint>
#include <deque>
#include <functional>
#include <iostream>
#include <map>
#include <string>

struct Order {
    long long id;
    std::int64_t price;
    std::int64_t qty;
};

int main() {
    std::ios::sync_with_stdio(false);
    std::cin.tie(nullptr);

    int m;
    std::cin >> m;

    // bids keyed descending so begin() is the best (highest) bid
    std::map<std::int64_t, std::deque<Order>, std::greater<>> bids;
    std::map<std::int64_t, std::deque<Order>> asks;

    std::string out;
    out.reserve(1 << 21);

    auto emitTrade = [&](long long buyId, long long sellId, std::int64_t price, std::int64_t qty) {
        out += "TRADE ";
        out += std::to_string(buyId);
        out += ' ';
        out += std::to_string(sellId);
        out += ' ';
        out += std::to_string(price);
        out += ' ';
        out += std::to_string(qty);
        out += '\n';
    };

    for (int i = 0; i < m; i++) {
        long long id;
        char side;
        std::int64_t price, qty;
        std::cin >> id >> side >> price >> qty;

        if (side == 'B') {
            while (qty > 0 && !asks.empty() && asks.begin()->first <= price) {
                auto& [restPrice, queue] = *asks.begin();
                while (qty > 0 && !queue.empty()) {
                    Order& resting = queue.front();
                    std::int64_t fill = std::min(qty, resting.qty);
                    emitTrade(id, resting.id, restPrice, fill);
                    qty -= fill;
                    resting.qty -= fill;
                    if (resting.qty == 0) queue.pop_front();
                }
                if (queue.empty()) asks.erase(asks.begin());
            }
            if (qty > 0) bids[price].push_back({id, price, qty});
        } else {
            while (qty > 0 && !bids.empty() && bids.begin()->first >= price) {
                auto& [restPrice, queue] = *bids.begin();
                while (qty > 0 && !queue.empty()) {
                    Order& resting = queue.front();
                    std::int64_t fill = std::min(qty, resting.qty);
                    emitTrade(resting.id, id, restPrice, fill);
                    qty -= fill;
                    resting.qty -= fill;
                    if (resting.qty == 0) queue.pop_front();
                }
                if (queue.empty()) bids.erase(bids.begin());
            }
            if (qty > 0) asks[price].push_back({id, price, qty});
        }
    }

    out += "BOOK BIDS\n";
    for (auto& [price, queue] : bids) {
        for (Order& order : queue) {
            out += std::to_string(order.id);
            out += ' ';
            out += std::to_string(price);
            out += ' ';
            out += std::to_string(order.qty);
            out += '\n';
        }
    }
    out += "BOOK ASKS\n";
    for (auto& [price, queue] : asks) {
        for (Order& order : queue) {
            out += std::to_string(order.id);
            out += ' ';
            out += std::to_string(price);
            out += ' ';
            out += std::to_string(order.qty);
            out += '\n';
        }
    }
    std::cout << out;
    return 0;
}
