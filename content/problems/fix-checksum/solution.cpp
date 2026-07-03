#include <cstdio>
#include <iostream>
#include <string>

int main() {
    std::ios::sync_with_stdio(false);
    std::cin.tie(nullptr);

    int m;
    std::cin >> m;
    while (m-- > 0) {
        std::string msg;
        std::cin >> msg;

        // "10=XXX|" is guaranteed to be the final field; "9=" the second.
        std::size_t checksumTag = msg.rfind("|10=");
        std::size_t nineTag = msg.find("|9=");
        std::size_t bodyStart = msg.find('|', nineTag + 1) + 1;

        long long computedLen = (long long)(checksumTag + 1) - (long long)bodyStart;

        long long sum = 0;
        for (std::size_t p = 0; p <= checksumTag; p++) {
            sum += msg[p] == '|' ? 1 : (unsigned char)msg[p];
        }
        int computedSum = (int)(sum % 256);

        // Declared values
        std::size_t lenStart = nineTag + 3;
        long long declaredLen = 0;
        for (std::size_t p = lenStart; msg[p] != '|'; p++) declaredLen = declaredLen * 10 + (msg[p] - '0');
        int declaredSum = 0;
        for (std::size_t p = checksumTag + 4; p < msg.size() && msg[p] != '|'; p++) {
            declaredSum = declaredSum * 10 + (msg[p] - '0');
        }

        if (declaredLen != computedLen) {
            std::printf("BADLEN %lld\n", computedLen);
        } else if (declaredSum != computedSum) {
            std::printf("BADSUM %03d\n", computedSum);
        } else {
            std::printf("OK\n");
        }
    }
    return 0;
}
