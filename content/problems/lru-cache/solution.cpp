#include <cstdint>
#include <iostream>
#include <list>
#include <string>
#include <unordered_map>

int main() {
    std::ios::sync_with_stdio(false);
    std::cin.tie(nullptr);

    std::size_t capacity;
    int m;
    std::cin >> capacity >> m;

    using Entry = std::pair<long long, long long>;  // key, value
    std::list<Entry> recency;                        // front = most recently used
    std::unordered_map<long long, std::list<Entry>::iterator> index;
    index.reserve(1 << 18);

    std::string out;
    out.reserve(1 << 21);

    for (int i = 0; i < m; i++) {
        std::string op;
        std::cin >> op;
        if (op == "GET") {
            long long k;
            std::cin >> k;
            auto it = index.find(k);
            if (it == index.end()) {
                out += "-1\n";
            } else {
                recency.splice(recency.begin(), recency, it->second);
                out += std::to_string(it->second->second);
                out += '\n';
            }
        } else {
            long long k, v;
            std::cin >> k >> v;
            auto it = index.find(k);
            if (it != index.end()) {
                it->second->second = v;
                recency.splice(recency.begin(), recency, it->second);
            } else {
                if (index.size() == capacity) {
                    Entry& lru = recency.back();
                    out += "EVICT ";
                    out += std::to_string(lru.first);
                    out += '\n';
                    index.erase(lru.first);
                    recency.pop_back();
                }
                recency.emplace_front(k, v);
                index[k] = recency.begin();
            }
        }
    }
    std::cout << out;
    return 0;
}
