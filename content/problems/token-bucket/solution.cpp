#include <cstdint>
#include <iostream>
#include <string>

int main() {
    std::ios::sync_with_stdio(false);
    std::cin.tie(nullptr);

    std::int64_t capacity, rate;
    int m;
    std::cin >> capacity >> rate >> m;

    const std::int64_t full = capacity * 1000;
    std::int64_t millitokens = full;
    std::int64_t prev = -1;

    std::string out;
    out.reserve(1 << 21);

    for (int i = 0; i < m; i++) {
        std::string op;
        std::int64_t t;
        std::cin >> op >> t;

        if (prev >= 0 && t > prev) {
            std::int64_t refill = (t - prev) * rate;
            millitokens = std::min(full, millitokens + refill);
        }
        prev = t;

        if (millitokens >= 1000) {
            millitokens -= 1000;
            out += "ALLOW\n";
        } else {
            out += "REJECT\n";
        }
    }
    std::cout << out;
    return 0;
}
