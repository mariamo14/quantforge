#include <cmath>
#include <cstdio>

// Welford: delta = x - mean; mean += delta / n; M += delta * (x - mean);
// sample variance = M / (n - 1). Print from the 2nd value onward.

int main() {
    int n;
    std::scanf("%d", &n);
    for (int i = 1; i <= n; i++) {
        double x;
        std::scanf("%lf", &x);
        // TODO
    }
    return 0;
}
