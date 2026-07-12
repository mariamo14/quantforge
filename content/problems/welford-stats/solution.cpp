#include <cmath>
#include <cstdio>

int main() {
    int n;
    std::scanf("%d", &n);

    double mean = 0.0;
    double m2 = 0.0;

    for (int i = 1; i <= n; i++) {
        double x;
        std::scanf("%lf", &x);
        double delta = x - mean;
        mean += delta / i;
        m2 += delta * (x - mean);
        if (i >= 2) {
            std::printf("%.6f %.6f\n", mean, std::sqrt(m2 / (i - 1)));
        }
    }
    return 0;
}
