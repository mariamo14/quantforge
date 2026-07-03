#include <cmath>
#include <cstdio>

// Follow the statement's formulas exactly: N = n*m periods, coupon cF/m per
// period, per-period rate y/m. Accumulate PV, PV-weighted time, and the
// convexity sum in one loop over t = 1..N.

int main() {
    int q;
    std::scanf("%d", &q);
    while (q-- > 0) {
        double F, c, y;
        int n, m;
        std::scanf("%lf %lf %lf %d %d", &F, &c, &y, &n, &m);
        // TODO
        // std::printf("%.4f %.4f %.4f %.4f\n", price, macaulay, modified, convexity);
    }
    return 0;
}
