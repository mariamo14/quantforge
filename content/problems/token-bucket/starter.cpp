#include <cstdint>
#include <iostream>
#include <string>

// Work in millitokens (1 token = 1000). Bucket starts full at C*1000.
// Refill (t - prev) * R millitokens (cap at C*1000), then try to consume 1000.

int main() {
    std::ios::sync_with_stdio(false);
    std::cin.tie(nullptr);

    std::int64_t capacity, rate;
    int m;
    std::cin >> capacity >> rate >> m;

    for (int i = 0; i < m; i++) {
        std::string op;
        std::int64_t t;
        std::cin >> op >> t;
        // TODO: refill, then ALLOW/REJECT
    }
    return 0;
}
