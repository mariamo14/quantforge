#include <cstdint>
#include <iostream>
#include <string>

// Helpers you likely want:
//   byteAt(hex, i)  -> value of byte i (2 hex chars)
//   readU32(hex, i) -> big-endian u32 starting at byte offset i
//   readU64(hex, i) -> big-endian u64
// Offsets: type at 0, seq at 1; ADD: id@5, side@13, symbol@14..19,
// price@20, qty@24. EXEC: id@5, qty@13. CANCEL: id@5.

int main() {
    std::ios::sync_with_stdio(false);
    std::cin.tie(nullptr);

    int m;
    std::cin >> m;
    for (int i = 0; i < m; i++) {
        std::string hex;
        std::cin >> hex;
        // TODO: decode, detect gaps, print
    }
    return 0;
}
