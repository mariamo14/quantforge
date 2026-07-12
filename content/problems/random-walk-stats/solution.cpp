#include <algorithm>
#include <iostream>

int main() {
    std::ios::sync_with_stdio(false);
    std::cin.tie(nullptr);

    int n;
    std::cin >> n;

    long long position = 0;
    long long high = 0;
    long long zeroCount = 0;

    for (int i = 0; i < n; i++) {
        int step;
        std::cin >> step;
        position += step;
        high = std::max(high, position);
        if (position == 0) {
            zeroCount++;
        }
    }

    std::cout << position << ' ' << high << ' ' << zeroCount << '\n';
    return 0;
}
