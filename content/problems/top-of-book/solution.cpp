#include <cstdint>
#include <iostream>
#include <queue>
#include <string>
#include <unordered_set>
#include <vector>

using Entry = std::pair<std::int64_t, long long>;  // (price, id)

int main() {
    std::ios::sync_with_stdio(false);
    std::cin.tie(nullptr);

    int m;
    std::cin >> m;

    std::priority_queue<Entry> bids;                                       // max-heap
    std::priority_queue<Entry, std::vector<Entry>, std::greater<>> asks;  // min-heap
    std::unordered_set<long long> cancelled;
    cancelled.reserve(1 << 18);

    auto cleanTop = [&](auto& heap) {
        while (!heap.empty() && cancelled.count(heap.top().second)) {
            cancelled.erase(heap.top().second);
            heap.pop();
        }
    };

    std::string out;
    out.reserve(1 << 20);

    for (int i = 0; i < m; i++) {
        std::string type;
        std::cin >> type;
        if (type == "A") {
            long long id, price;
            char side;
            std::cin >> id >> side >> price;
            if (side == 'B') {
                bids.push({price, id});
            } else {
                asks.push({price, id});
            }
        } else if (type == "C") {
            long long id;
            std::cin >> id;
            cancelled.insert(id);
        } else {
            cleanTop(bids);
            cleanTop(asks);
            if (bids.empty()) out += "-";
            else out += std::to_string(bids.top().first);
            out += ' ';
            if (asks.empty()) out += "-";
            else out += std::to_string(asks.top().first);
            out += '\n';
        }
    }
    std::cout << out;
    return 0;
}
