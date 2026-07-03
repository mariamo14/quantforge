#include <cstdint>
#include <iostream>
#include <string>
#include <vector>

// Fixed-capacity ring buffer: preallocate storage, track head/tail/count.
// PUSH when full -> print DROP. POP when empty -> print EMPTY.

int main() {
    std::ios::sync_with_stdio(false);
    std::cin.tie(nullptr);

    std::size_t capacity;
    int m;
    std::cin >> capacity >> m;

    std::vector<std::int64_t> buffer(capacity);
    // TODO: head, tail, count

    for (int i = 0; i < m; i++) {
        std::string op;
        std::cin >> op;
        if (op == "PUSH") {
            std::int64_t x;
            std::cin >> x;
            // TODO
        } else if (op == "POP") {
            // TODO
        } else {  // SIZE
            // TODO
        }
    }
    return 0;
}
