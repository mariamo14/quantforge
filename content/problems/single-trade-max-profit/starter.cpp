#include <cstdint>
#include <iostream>

// One pass: track the minimum price so far (and its earliest day);
// candidate profit at day i = p[i] - minSoFar. Update the best on
// strict improvement only — that enforces the tie-breaking rule.

int main() {
    std::ios::sync_with_stdio(false);
    std::cin.tie(nullptr);

    int n;
    std::cin >> n;
    for (int i = 1; i <= n; i++) {
        std::int64_t price;
        std::cin >> price;
        // TODO
    }
    return 0;
}
