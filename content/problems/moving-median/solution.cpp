#include <cstdint>
#include <iostream>
#include <set>
#include <string>
#include <vector>

class RollingMedian {
public:
    void insert(std::int64_t x) {
        if (low.empty() || x <= *low.rbegin()) {
            low.insert(x);
        } else {
            high.insert(x);
        }
        rebalance();
    }

    void erase(std::int64_t x) {
        // erase exactly one occurrence from the correct side
        if (!low.empty() && x <= *low.rbegin()) {
            low.erase(low.find(x));
        } else {
            high.erase(high.find(x));
        }
        rebalance();
    }

    std::int64_t median() const {
        return *low.rbegin();
    }

private:
    void rebalance() {
        // invariant: low.size() == high.size() + 1  (window size is odd)
        while (low.size() > high.size() + 1) {
            auto it = std::prev(low.end());
            high.insert(*it);
            low.erase(it);
        }
        while (low.size() < high.size() + 1) {
            auto it = high.begin();
            low.insert(*it);
            high.erase(it);
        }
    }

    std::multiset<std::int64_t> low;   // max side
    std::multiset<std::int64_t> high;  // min side
};

int main() {
    std::ios::sync_with_stdio(false);
    std::cin.tie(nullptr);

    int n, k;
    std::cin >> n >> k;
    std::vector<std::int64_t> prices(n);
    for (auto& p : prices) std::cin >> p;

    RollingMedian window;
    std::string out;
    out.reserve(1 << 21);

    for (int i = 0; i < n; i++) {
        window.insert(prices[i]);
        if (i >= k) {
            window.erase(prices[i - k]);
        }
        if (i >= k - 1) {
            out += std::to_string(window.median());
            out += '\n';
        }
    }
    std::cout << out;
    return 0;
}
