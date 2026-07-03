#include <cstdio>
#include <iostream>
#include <string>

// BodyLength (9): bytes after the "9=...|" delimiter, up to and including
// the '|' before "10=".
// CheckSum (10): sum of bytes from message start through the '|' before
// "10=", mod 256; '|' counts as 1 (SOH), other chars as their ASCII value.

int main() {
    std::ios::sync_with_stdio(false);
    std::cin.tie(nullptr);

    int m;
    std::cin >> m;
    for (int i = 0; i < m; i++) {
        std::string msg;
        std::cin >> msg;
        // TODO: locate fields, compute both values, compare, print verdict
    }
    return 0;
}
