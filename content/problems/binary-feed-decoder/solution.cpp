#include <cstdint>
#include <iostream>
#include <string>

namespace {

unsigned byteAt(const std::string& hex, std::size_t byteIndex) {
    auto nibble = [](char c) -> unsigned {
        return c <= '9' ? c - '0' : c - 'a' + 10;
    };
    return nibble(hex[2 * byteIndex]) * 16 + nibble(hex[2 * byteIndex + 1]);
}

std::uint32_t readU32(const std::string& hex, std::size_t offset) {
    std::uint32_t value = 0;
    for (int i = 0; i < 4; i++) value = value << 8 | byteAt(hex, offset + i);
    return value;
}

std::uint64_t readU64(const std::string& hex, std::size_t offset) {
    std::uint64_t value = 0;
    for (int i = 0; i < 8; i++) value = value << 8 | byteAt(hex, offset + i);
    return value;
}

}  // namespace

int main() {
    std::ios::sync_with_stdio(false);
    std::cin.tie(nullptr);

    int m;
    std::cin >> m;

    bool first = true;
    std::uint32_t expected = 0;
    std::string out;
    out.reserve(1 << 21);

    for (int i = 0; i < m; i++) {
        std::string hex;
        std::cin >> hex;

        char type = (char)byteAt(hex, 0);
        std::uint32_t seq = readU32(hex, 1);

        if (!first && seq != expected) {
            out += "GAP ";
            out += std::to_string(expected);
            out += ' ';
            out += std::to_string(seq);
            out += '\n';
        }
        first = false;
        expected = seq + 1;

        if (type == 'A') {
            std::uint64_t orderId = readU64(hex, 5);
            char side = (char)byteAt(hex, 13);
            std::string symbol;
            for (int b = 14; b < 20; b++) {
                char c = (char)byteAt(hex, b);
                if (c != ' ') symbol.push_back(c);
            }
            std::uint32_t price = readU32(hex, 20);
            std::uint32_t qty = readU32(hex, 24);
            out += "ADD ";
            out += std::to_string(seq);
            out += ' ';
            out += std::to_string(orderId);
            out += ' ';
            out += side;
            out += ' ';
            out += symbol;
            out += ' ';
            out += std::to_string(price / 100);
            out += '.';
            out += (char)('0' + price / 10 % 10);
            out += (char)('0' + price % 10);
            out += ' ';
            out += std::to_string(qty);
            out += '\n';
        } else if (type == 'E') {
            out += "EXEC ";
            out += std::to_string(seq);
            out += ' ';
            out += std::to_string(readU64(hex, 5));
            out += ' ';
            out += std::to_string(readU32(hex, 13));
            out += '\n';
        } else {  // 'X'
            out += "CANCEL ";
            out += std::to_string(seq);
            out += ' ';
            out += std::to_string(readU64(hex, 5));
            out += '\n';
        }
    }
    std::cout << out;
    return 0;
}
