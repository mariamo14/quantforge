#include <cmath>
#include <cstdio>
#include <cstring>

// FV = pv * (1+r)^n     PV = fv / (1+r)^n
// std::pow handles the power; print with %.2f.

int main() {
    int q;
    std::scanf("%d", &q);
    while (q-- > 0) {
        char op[3];
        double amount, r;
        int n;
        std::scanf("%2s %lf %lf %d", op, &amount, &r, &n);
        // TODO: compute and print the result with 2 decimals
    }
    return 0;
}
