#include <cstdint>
#include <iostream>
#include <unordered_map>
#include <vector>

// One pass: before inserting a[j], look up T - a[j] among values seen so far
// (map value -> earliest index). First hit gives the answer.

int main() {
    std::ios::sync_with_stdio(false);
    std::cin.tie(nullptr);

    int n;
    std::int64_t target;
    std::cin >> n >> target;
    // TODO
    return 0;
}
