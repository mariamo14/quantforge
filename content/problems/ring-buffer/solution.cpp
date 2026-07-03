#include <cstdint>
#include <iostream>
#include <string>
#include <vector>

int main() {
    std::ios::sync_with_stdio(false);
    std::cin.tie(nullptr);

    std::size_t capacity;
    int m;
    std::cin >> capacity >> m;

    std::vector<std::int64_t> buffer(capacity);
    std::size_t head = 0;   // next slot to pop
    std::size_t tail = 0;   // next slot to push
    std::size_t count = 0;

    std::string out;
    out.reserve(1 << 20);

    for (int i = 0; i < m; i++) {
        std::string op;
        std::cin >> op;
        if (op == "PUSH") {
            std::int64_t x;
            std::cin >> x;
            if (count == capacity) {
                out += "DROP\n";
            } else {
                buffer[tail] = x;
                tail = (tail + 1) % capacity;
                count++;
                out += "OK\n";
            }
        } else if (op == "POP") {
            if (count == 0) {
                out += "EMPTY\n";
            } else {
                out += std::to_string(buffer[head]);
                out += '\n';
                head = (head + 1) % capacity;
                count--;
            }
        } else {  // SIZE
            out += std::to_string(count);
            out += '\n';
        }
    }
    std::cout << out;
    return 0;
}
