#include <cmath>
#include <cstdio>

int main() {
    double omega, alpha, beta;
    int n, k;
    std::scanf("%lf %lf %lf %d %d", &omega, &alpha, &beta, &n, &k);

    double longRun = omega / (1.0 - alpha - beta);
    double sigma2 = longRun;  // seed at the unconditional variance
    double peak = sigma2;
    double prevReturn = 0.0;

    for (int t = 0; t < n; t++) {
        double r;
        std::scanf("%lf", &r);
        if (t > 0) {
            sigma2 = omega + alpha * prevReturn * prevReturn + beta * sigma2;
            if (sigma2 > peak) {
                peak = sigma2;
            }
        }
        prevReturn = r;
    }

    double phi = alpha + beta;
    double oneAhead = omega + alpha * prevReturn * prevReturn + beta * sigma2;
    double kAhead = longRun + std::pow(phi, k - 1) * (oneAhead - longRun);

    std::printf("%.6f\n%.6f\n%.6f\n",
                std::sqrt(252.0 * sigma2), std::sqrt(252.0 * peak),
                std::sqrt(252.0 * kAhead));
    return 0;
}
