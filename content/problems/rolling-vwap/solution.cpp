#include <cstdint>
#include <iostream>
#include <string>
#include <vector>

int main() {
    std::ios::sync_with_stdio(false);
    std::cin.tie(nullptr);

    int n, k;
    std::cin >> n >> k;

    std::vector<std::int64_t> prices(n), volumes(n);
    std::int64_t notional = 0;  // sum p*v over window
    std::int64_t volume = 0;    // sum v over window

    std::string out;
    out.reserve(1 << 21);

    for (int i = 0; i < n; i++) {
        std::cin >> prices[i] >> volumes[i];
        notional += prices[i] * volumes[i];
        volume += volumes[i];
        if (i >= k) {
            notional -= prices[i - k] * volumes[i - k];
            volume -= volumes[i - k];
        }
        // round half-up in pure integer math
        std::int64_t cents = (notional * 2 + volume) / (volume * 2);
        out += std::to_string(cents / 100);
        out += '.';
        out += (char)('0' + cents / 10 % 10);
        out += (char)('0' + cents % 10);
        out += '\n';
    }
    std::cout << out;
    return 0;
}
