#include <algorithm>
#include <cstdint>
#include <iostream>
#include <string>
#include <vector>

int main() {
    std::ios::sync_with_stdio(false);
    std::cin.tie(nullptr);

    int n;
    std::cin >> n;
    std::vector<std::pair<std::int64_t, std::int64_t>> halts(n);
    for (auto& [s, e] : halts) std::cin >> s >> e;

    std::sort(halts.begin(), halts.end());

    std::vector<std::pair<std::int64_t, std::int64_t>> merged;
    for (const auto& [s, e] : halts) {
        if (!merged.empty() && s <= merged.back().second) {
            merged.back().second = std::max(merged.back().second, e);
        } else {
            merged.emplace_back(s, e);
        }
    }

    std::int64_t totalHalted = 0;
    for (const auto& [s, e] : merged) totalHalted += e - s;

    std::string out;
    out.reserve(1 << 20);
    out += std::to_string(merged.size());
    out += ' ';
    out += std::to_string(totalHalted);
    out += '\n';
    for (const auto& [s, e] : merged) {
        out += std::to_string(s);
        out += ' ';
        out += std::to_string(e);
        out += '\n';
    }
    std::cout << out;
    return 0;
}
