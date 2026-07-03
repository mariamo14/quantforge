#include <cstdint>
#include <iostream>
#include <list>
#include <string>
#include <unordered_map>

// std::list<pair<key, value>> in recency order (front = most recent) +
// unordered_map<key, list::iterator>. list::splice moves a node to the
// front in O(1) without invalidating iterators.

int main() {
    std::ios::sync_with_stdio(false);
    std::cin.tie(nullptr);

    std::size_t capacity;
    int m;
    std::cin >> capacity >> m;

    for (int i = 0; i < m; i++) {
        std::string op;
        std::cin >> op;
        if (op == "GET") {
            long long k;
            std::cin >> k;
            // TODO
        } else {  // PUT
            long long k, v;
            std::cin >> k >> v;
            // TODO
        }
    }
    return 0;
}
