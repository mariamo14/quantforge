#include <cmath>
#include <cstdio>

int main() {
    double lambda;
    int n;
    std::scanf("%lf %d", &lambda, &n);

    double sigma2 = 0.0;
    double peak = 0.0;
    for (int t = 0; t < n; t++) {
        double r;
        std::scanf("%lf", &r);
        if (t == 0) {
            sigma2 = r * r;
        } else {
            sigma2 = lambda * sigma2 + (1.0 - lambda) * r * r;
        }
        if (sigma2 > peak) {
            peak = sigma2;
        }
    }

    std::printf("%.6f\n%.6f\n", std::sqrt(252.0 * sigma2), std::sqrt(252.0 * peak));
    return 0;
}
