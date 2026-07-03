#include <cstdint>
#include <iostream>
#include <string>
#include <vector>

// Everything is integer cents: call = max(S-K, 0), put = max(K-S, 0),
// stock = S. Multiply by (signed) quantity, sum in int64, print as
// dollars with 2 decimals (mind negative values when splitting).

struct Position {
    long long qty;
    char type;        // 'C', 'P', or 'S'
    std::int64_t strike;  // unused for 'S'
};

int main() {
    std::ios::sync_with_stdio(false);
    std::cin.tie(nullptr);

    int n, m;
    std::cin >> n >> m;
    std::vector<Position> positions(n);
    // TODO: read positions, then evaluate each terminal price
    return 0;
}
