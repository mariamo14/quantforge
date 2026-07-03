#include <cstdint>
#include <iostream>
#include <map>
#include <string>
#include <unordered_map>

struct OrderInfo {
    char side;
    std::int64_t price;
    std::int64_t qty;
};

int main() {
    std::ios::sync_with_stdio(false);
    std::cin.tie(nullptr);

    int m;
    std::cin >> m;

    std::map<std::int64_t, std::int64_t> bids;  // price -> level qty
    std::map<std::int64_t, std::int64_t> asks;
    std::unordered_map<long long, OrderInfo> orders;
    orders.reserve(1 << 18);

    auto bookFor = [&](char side) -> std::map<std::int64_t, std::int64_t>& {
        return side == 'B' ? bids : asks;
    };

    auto reduce = [&](long long id, std::int64_t qty) {
        auto it = orders.find(id);
        OrderInfo& info = it->second;
        auto& book = info.side == 'B' ? bids : asks;
        auto level = book.find(info.price);
        level->second -= qty;
        if (level->second == 0) book.erase(level);
        info.qty -= qty;
        if (info.qty == 0) orders.erase(it);
    };

    std::string out;
    out.reserve(1 << 20);

    for (int i = 0; i < m; i++) {
        std::string type;
        std::cin >> type;
        if (type == "A") {
            long long id, price, qty;
            char side;
            std::cin >> id >> side >> price >> qty;
            orders[id] = OrderInfo{side, price, qty};
            bookFor(side)[price] += qty;
        } else if (type == "C") {
            long long id;
            std::cin >> id;
            reduce(id, orders[id].qty);
        } else if (type == "X") {
            long long id, qty;
            std::cin >> id >> qty;
            reduce(id, qty);
        } else {
            std::string what;
            std::cin >> what;
            if (what == "BEST") {
                if (bids.empty()) out += "-";
                else out += std::to_string(bids.rbegin()->first);
                out += ' ';
                if (asks.empty()) out += "-";
                else out += std::to_string(asks.begin()->first);
                out += '\n';
            } else {
                char side;
                long long price;
                std::cin >> side >> price;
                auto& book = bookFor(side);
                auto it = book.find(price);
                out += std::to_string(it == book.end() ? 0 : it->second);
                out += '\n';
            }
        }
    }
    std::cout << out;
    return 0;
}
