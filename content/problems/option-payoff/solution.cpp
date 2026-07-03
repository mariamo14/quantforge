#include <cstdint>
#include <iostream>
#include <string>
#include <vector>

struct Position {
    long long qty;
    char type;
    std::int64_t strike;
};

int main() {
    std::ios::sync_with_stdio(false);
    std::cin.tie(nullptr);

    int n, m;
    std::cin >> n >> m;

    std::vector<Position> positions(n);
    for (auto& p : positions) {
        std::string type;
        std::cin >> p.qty >> type;
        p.type = type[0];
        p.strike = 0;
        if (p.type != 'S') {
            std::cin >> p.strike;
        }
    }

    std::string out;
    out.reserve(1 << 16);
    for (int j = 0; j < m; j++) {
        std::int64_t terminal;
        std::cin >> terminal;
        std::int64_t total = 0;  // cents
        for (const auto& p : positions) {
            std::int64_t value = p.type == 'C' ? std::max<std::int64_t>(terminal - p.strike, 0)
                               : p.type == 'P' ? std::max<std::int64_t>(p.strike - terminal, 0)
                                               : terminal;
            total += p.qty * value;
        }
        std::int64_t abs = total < 0 ? -total : total;
        if (total < 0) {
            out += '-';
        }
        out += std::to_string(abs / 100);
        out += '.';
        out += (char)('0' + abs / 10 % 10);
        out += (char)('0' + abs % 10);
        out += '\n';
    }
    std::cout << out;
    return 0;
}
