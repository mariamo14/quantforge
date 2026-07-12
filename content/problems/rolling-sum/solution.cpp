#include <iostream>
#include <string>
#include <vector>

int main() {
    std::ios::sync_with_stdio(false);
    std::cin.tie(nullptr);

    int n, k;
    std::cin >> n >> k;

    std::vector<long long> values(n);
    long long sum = 0;

    std::string out;
    out.reserve(1 << 22);

    for (int i = 0; i < n; i++) {
        std::cin >> values[i];
        sum += values[i];
        if (i >= k) {
            sum -= values[i - k];
        }
        out += std::to_string(sum);
        out += '\n';
    }
    std::cout << out;
    return 0;
}
