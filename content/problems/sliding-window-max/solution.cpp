#include <cstdint>
#include <deque>
#include <iostream>
#include <string>
#include <vector>

int main() {
    std::ios::sync_with_stdio(false);
    std::cin.tie(nullptr);

    int n, k;
    std::cin >> n >> k;

    std::vector<std::int64_t> prices(n);
    std::deque<int> window;  // indices, prices decreasing front to back

    std::string out;
    out.reserve(1 << 22);

    for (int i = 0; i < n; i++) {
        std::cin >> prices[i];
        while (!window.empty() && prices[window.back()] <= prices[i]) {
            window.pop_back();
        }
        window.push_back(i);
        if (window.front() <= i - k) {
            window.pop_front();
        }
        out += std::to_string(prices[window.front()]);
        out += '\n';
    }
    std::cout << out;
    return 0;
}
