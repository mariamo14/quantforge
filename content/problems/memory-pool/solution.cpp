#include <cstdint>
#include <iostream>
#include <queue>
#include <string>
#include <vector>

int main() {
    std::ios::sync_with_stdio(false);
    std::cin.tie(nullptr);

    int n, m;
    std::cin >> n >> m;

    std::vector<bool> used(n, false);
    std::priority_queue<int, std::vector<int>, std::greater<>> freed;
    int watermark = 0;  // blocks [watermark, n) have never been allocated

    std::string out;
    out.reserve(1 << 22);

    for (int op = 0; op < m; op++) {
        std::string kind;
        std::cin >> kind;
        if (kind == "ALLOC") {
            int index = -1;
            if (!freed.empty() && (watermark >= n || freed.top() < watermark)) {
                index = freed.top();
                freed.pop();
            } else if (watermark < n) {
                index = watermark++;
            }
            if (index < 0) {
                out += "FULL\n";
            } else {
                used[index] = true;
                out += std::to_string(index);
                out += '\n';
            }
        } else {
            int index;
            std::cin >> index;
            if (!used[index]) {
                out += "DOUBLE_FREE\n";
            } else {
                used[index] = false;
                freed.push(index);
                out += "OK\n";
            }
        }
    }
    std::cout << out;
    return 0;
}
