#include <cmath>
#include <cstdio>

// sigma2[1] = omega / (1 - alpha - beta)
// sigma2[t] = omega + alpha * r[t-1]^2 + beta * sigma2[t-1]
// forecast:  sig1 = omega + alpha*rN^2 + beta*sigmaN^2
//            sigK = longRun + phi^(k-1) * (sig1 - longRun)

int main() {
    double omega, alpha, beta;
    int n, k;
    std::scanf("%lf %lf %lf %d %d", &omega, &alpha, &beta, &n, &k);
    for (int t = 0; t < n; t++) {
        double r;
        std::scanf("%lf", &r);
        // TODO
    }
    // std::printf("%.6f\n%.6f\n%.6f\n", finalVol, peakVol, forecastVol);
    return 0;
}
